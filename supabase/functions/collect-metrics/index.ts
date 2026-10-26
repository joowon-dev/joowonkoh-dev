/**
 * collect-metrics — 외부 지표를 받아 metrics_daily(소스 합계)와
 * metrics_breakdown(페이지·유입경로·광고단위 등 차원별 세부)에 쌓는다.
 *
 *   POST /functions/v1/collect-metrics?source=ga4|admob&days=3
 *   x-collect-secret: <Vault collect_metrics_secret>
 *
 * pg_cron 이 소스마다 매일 부른다(마이그레이션 20261001000000, 20261001020000).
 * 처음 한 번은 days=30 으로 소급 수집해 차트를 채운다.
 *
 * 실시간 소스는 따로 돈다(마이그레이션 20261026000000) — days 를 받지 않는다.
 *   ga4_live     1분마다. 등록부(apps)의 GA4 속성마다 최근 30분 → live_metrics / live_detail
 *   admob_today  10분마다. AdMob 오늘치 → live_metrics
 *   ga4_discover 매일. 서비스 계정이 보는 속성의 스트림을 훑어 apps.ga4_property_id 를 채운다
 *   store        1시간마다. 스토어 공개 정보(별점·평가 수·Play 설치 수·차트 순위·리뷰)
 *                → store_metrics / store_listing / store_reviews (마이그레이션 20261026010000)
 *
 * 자격증명은 Vault 에 있다(마이그레이션 20261001010000). Edge Function secrets 가 아니라
 * Vault 를 쓰는 건 SQL 만으로 넣고 바꿀 수 있어서다.
 *
 * 성공이든 실패든 collection_runs 에 남긴다. 어드민 화면의 수집 지연 배너가
 * 이 테이블을 본다 — 조용히 멈추는 수집이 가장 나쁘다.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  ADMOB_BREAKDOWNS,
  type AdmobBreakdown,
  buildAdmobBreakdownRequest,
  buildNetworkReportRequest,
  normalizeAdmobBreakdown,
  normalizeAdmobReport,
} from "./admob.ts";
import type { BreakdownRow } from "./breakdown.ts";
import {
  buildBreakdownRequest,
  buildReportRequest,
  GA4_BREAKDOWNS,
  type Ga4Breakdown,
  normalizeGa4Breakdown,
  normalizeGa4Report,
} from "./ga4.ts";
import {
  ADMOB_TODAY_METRICS,
  buildAdmobTodayRequest,
  type LiveDetail,
  type LiveRow,
  matchProperties,
  minuteFloor,
  normalizeAdmobToday,
  normalizeRealtime,
  propertyIds,
  REALTIME_REQUESTS,
  type RealtimeReports,
} from "./live.ts";
import {
  appleChartUrl,
  appleReviewsUrl,
  hourFloor,
  parseAppleChart,
  parseAppleLookup,
  parseAppleReviews,
  parsePlayChart,
  parsePlayDetails,
  parsePlayReviews,
  playChartRequest,
  playDetailsUrl,
  playReviewsRequest,
  rankOf,
  type ReviewRow,
  type StoreListing,
  type StoreMetricRow,
} from "./store.ts";
import {
  fetchAccessToken,
  refreshAccessToken,
  type ServiceAccountKey,
} from "./google.ts";

/** joowonkoh.com 웹 스트림이 달린 GA4 속성. 비밀이 아니다. */
const GA4_PROPERTY_ID = "434494008";

/** 주원의 AdMob 계정. 비밀이 아니다. */
const ADMOB_ACCOUNT = "accounts/pub-7807290470382730";

const DEFAULT_DAYS = 3;
const MAX_DAYS = 90;

type Row = {
  source: string;
  metric_date: string;
  entity: string;
  metric_key: string;
  value: number;
};

/** 한 번 수집에서 나오는 것: 소스 합계(metrics_daily)와 차원별 세부(metrics_breakdown). */
type Collected = { daily: Row[]; breakdown: BreakdownRow[] };

/** 한 요청에 너무 큰 본문을 보내지 않게 나눠 쓴다. */
const UPSERT_CHUNK = 1000;

const COLLECTORS: Record<string, (days: number) => Promise<Collected>> = {
  ga4: collectGa4,
  admob: collectAdmob,
};

/** 실시간 작업은 쓰기까지 스스로 하고, 화면에 남길 요약만 돌려준다. */
const LIVE_TASKS: Record<string, (now: Date) => Promise<Record<string, unknown>>> = {
  ga4_live: collectGa4Live,
  admob_today: collectAdmobToday,
  ga4_discover: discoverGa4Properties,
  store: collectStores,
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  // 함수 URL 은 공개라 누구나 부를 수 있다. 쿼터를 태우지 못하게 공유 비밀로 막는다.
  const secret = await readSecret("collect_metrics_secret");
  if (!secret || req.headers.get("x-collect-secret") !== secret) {
    return json({ error: "unauthorized" }, 401);
  }

  const url = new URL(req.url);
  const source = url.searchParams.get("source") ?? "";
  const days = clampDays(url.searchParams.get("days"));

  const startedAt = new Date().toISOString();

  const task = LIVE_TASKS[source];
  if (task) {
    try {
      const summary = await task(new Date(startedAt));
      // 일부 속성만 실패했으면 쓸 수 있는 건 쓰고, 실패는 숨기지 않는다.
      const partial = typeof summary.error === "string" ? summary.error : null;
      await recordRun(source, {
        last_run_at: startedAt,
        last_success: startedAt,
        status: partial ? "error" : "ok",
        error: partial,
      });
      return json({ source, ...summary });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await recordRun(source, { last_run_at: startedAt, status: "error", error: message });
      return json({ source, error: message }, 500);
    }
  }

  const collect = COLLECTORS[source];
  if (!collect) {
    return json({ error: `아직 수집기가 없는 소스: ${source}` }, 400);
  }

  try {
    const { daily, breakdown } = await collect(days);

    await upsertAll("metrics_daily", daily, "source,metric_date,entity,metric_key", startedAt);
    await upsertAll(
      "metrics_breakdown",
      breakdown,
      "source,metric_date,dimension,dim_value,metric_key",
      startedAt,
    );

    await recordRun(source, {
      last_run_at: startedAt,
      last_success: startedAt,
      status: "ok",
      error: null,
    });

    return json({ source, days, rows: daily.length, breakdownRows: breakdown.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // last_success 는 건드리지 않는다. 배너가 "마지막 성공이 언제였나"를 보여야 한다.
    await recordRun(source, { last_run_at: startedAt, status: "error", error: message });
    return json({ source, error: message }, 500);
  }
});

async function ga4Token(): Promise<string> {
  const key = JSON.parse(await requireSecret("ga4_service_account_json")) as ServiceAccountKey;
  return fetchAccessToken(key, "https://www.googleapis.com/auth/analytics.readonly");
}

async function collectGa4(days: number): Promise<Collected> {
  const token = await ga4Token();

  const runReport = async (request: unknown) => {
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(request),
      },
    );
    const body = await res.json();
    if (!res.ok) {
      throw new Error(`GA4 runReport 실패 (${res.status}): ${body?.error?.message ?? JSON.stringify(body)}`);
    }
    return body;
  };

  const dimensions = Object.keys(GA4_BREAKDOWNS) as Ga4Breakdown[];
  const [total, ...reports] = await Promise.all([
    runReport(buildReportRequest(days)),
    ...dimensions.map((d) => runReport(buildBreakdownRequest(d, days))),
  ]);

  return {
    daily: normalizeGa4Report(total, GA4_PROPERTY_ID),
    breakdown: reports.flatMap((report, i) => normalizeGa4Breakdown(report, dimensions[i])),
  };
}

async function admobReporter() {
  const token = await refreshAccessToken({
    clientId: await requireSecret("admob_client_id"),
    clientSecret: await requireSecret("admob_client_secret"),
    refreshToken: await requireSecret("admob_refresh_token"),
  });

  return async (request: unknown) => {
    const res = await fetch(
      `https://admob.googleapis.com/v1/${ADMOB_ACCOUNT}/networkReport:generate`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(request),
      },
    );
    const body = await res.json();
    if (!res.ok) {
      // 에러도 배열로 올 때가 있다: [{ error: {...} }]
      const error = Array.isArray(body) ? body[0]?.error : body?.error;
      throw new Error(`AdMob networkReport 실패 (${res.status}): ${error?.message ?? JSON.stringify(body)}`);
    }
    return body;
  };
}

async function collectAdmob(days: number): Promise<Collected> {
  const generate = await admobReporter();
  const now = new Date();
  const request = buildNetworkReportRequest(now, days);
  const dimensions = Object.keys(ADMOB_BREAKDOWNS) as AdmobBreakdown[];
  const [total, ...reports] = await Promise.all([
    generate(request),
    ...dimensions.map((d) => generate(buildAdmobBreakdownRequest(now, days, d))),
  ]);

  return {
    daily: normalizeAdmobReport(total, request.reportSpec.dateRange),
    breakdown: reports.flatMap((report, i) => normalizeAdmobBreakdown(report, dimensions[i])),
  };
}

async function collectGa4Live(now: Date) {
  const { data: apps, error } = await supabase
    .from("apps")
    .select("slug, ga4_property_id")
    .not("ga4_property_id", "is", null);
  if (error) throw new Error(`apps 읽기 실패: ${error.message}`);

  const token = await ga4Token();
  const at = minuteFloor(now);
  const names = Object.keys(REALTIME_REQUESTS) as (keyof typeof REALTIME_REQUESTS)[];

  const realtime = async (propertyId: string, request: unknown) => {
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
      {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(request),
      },
    );
    const body = await res.json();
    if (!res.ok) throw new Error(`${res.status} ${body?.error?.message ?? JSON.stringify(body)}`);
    return body;
  };

  // 속성 하나가 권한 오류여도 나머지는 적는다.
  const results = await Promise.allSettled(
    (apps ?? []).map(async ({ ga4_property_id: id }) => {
      const reports = await Promise.all(names.map((n) => realtime(id, REALTIME_REQUESTS[n])));
      const byName = Object.fromEntries(names.map((n, i) => [n, reports[i]])) as RealtimeReports;
      return normalizeRealtime(byName, id, at);
    }),
  );

  const rows: LiveRow[] = [];
  const details: LiveDetail[] = [];
  const failures: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      rows.push(r.value.row);
      details.push(r.value.detail);
    } else {
      const reason = r.reason instanceof Error ? r.reason.message : String(r.reason);
      failures.push(`${apps![i].slug}: ${reason}`);
    }
  });

  await upsertLive(rows);
  if (details.length > 0) {
    const { error: e } = await supabase.from("live_detail").upsert(details, { onConflict: "source,entity" });
    if (e) throw new Error(`live_detail upsert 실패: ${e.message}`);
  }

  if (rows.length === 0 && failures.length > 0) throw new Error(failures.join(" / "));
  return { properties: rows.length, ...(failures.length > 0 ? { error: failures.join(" / ") } : {}) };
}

async function collectAdmobToday(now: Date) {
  const generate = await admobReporter();
  const rows = normalizeAdmobToday(await generate(buildAdmobTodayRequest(now)), minuteFloor(now));

  // 오늘 아직 광고가 하나도 안 나간 시각엔 행이 없다. 수집은 됐다는 걸 0 으로 남긴다.
  if (rows.length === 0) {
    for (const metricKey of Object.values(ADMOB_TODAY_METRICS)) {
      rows.push({ at: minuteFloor(now), source: "admob", entity: "none", metric_key: metricKey, value: 0 });
    }
  }
  await upsertLive(rows);
  return { rows: rows.length };
}

async function discoverGa4Properties() {
  const token = await ga4Token();
  const admin = async (path: string) => {
    const res = await fetch(`https://analyticsadmin.googleapis.com/v1beta/${path}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(`GA4 Admin ${path} 실패 (${res.status}): ${body?.error?.message ?? JSON.stringify(body)}`);
    return body;
  };

  const ids = propertyIds(await admin("accountSummaries?pageSize=200"));
  const streams = await Promise.all(ids.map((id) => admin(`properties/${id}/dataStreams?pageSize=50`)));
  const streamsByProperty = Object.fromEntries(ids.map((id, i) => [id, streams[i].dataStreams ?? []]));

  const { data: apps, error } = await supabase
    .from("apps")
    .select("slug, ios_bundle_id, android_package")
    .eq("kind", "app");
  if (error) throw new Error(`apps 읽기 실패: ${error.message}`);

  const found = matchProperties(apps ?? [], streamsByProperty);
  for (const [slug, propertyId] of Object.entries(found)) {
    const { error: e } = await supabase.from("apps").update({ ga4_property_id: propertyId }).eq("slug", slug);
    if (e) throw new Error(`apps.${slug} 갱신 실패: ${e.message}`);
  }

  const missing = (apps ?? []).map((a) => a.slug).filter((slug) => !found[slug]);
  return {
    visibleProperties: ids.length,
    matched: found,
    ...(missing.length > 0 ? { error: `GA4 속성을 못 찾은 앱: ${missing.join(", ")} — 서비스 계정 권한 확인` } : {}),
  };
}

type StoreApp = {
  slug: string;
  app_store_id: number | null;
  android_package: string | null;
  play_listed: boolean;
};

async function collectStores(now: Date) {
  const { data, error } = await supabase
    .from("apps")
    .select("slug, app_store_id, android_package, play_listed")
    .eq("kind", "app");
  if (error) throw new Error(`apps 읽기 실패: ${error.message}`);
  const apps = (data ?? []) as StoreApp[];
  const at = hourFloor(now);

  const getJson = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  };
  const getText = async (url: string, init?: RequestInit) => {
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.text();
  };
  const postPlay = (req: { url: string; body: string }) =>
    getText(req.url, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: req.body,
    });

  const metrics: StoreMetricRow[] = [];
  const listings: StoreListing[] = [];
  const reviews: ReviewRow[] = [];
  const failures: string[] = [];

  // 한 앱·한 스토어가 실패해도 나머지는 적는다.
  const attempt = async (label: string, job: () => Promise<void>) => {
    try {
      await job();
    } catch (err) {
      failures.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  await Promise.all(
    apps.flatMap((app) => {
      const jobs: Promise<void>[] = [];
      if (app.app_store_id) {
        const id = Number(app.app_store_id);
        jobs.push(attempt(`${app.slug} App Store`, async () => {
          const r = parseAppleLookup(await getJson(`https://itunes.apple.com/lookup?id=${id}&country=kr`), app.slug, at);
          metrics.push(...r.metrics);
          listings.push(r.listing);
        }));
        jobs.push(attempt(`${app.slug} App Store 리뷰`, async () => {
          reviews.push(...parseAppleReviews(await getJson(appleReviewsUrl(id)), app.slug));
        }));
      }
      if (app.play_listed && app.android_package) {
        const pkg = app.android_package;
        jobs.push(attempt(`${app.slug} Play`, async () => {
          const r = parsePlayDetails(await getText(playDetailsUrl(pkg)), app.slug, at);
          metrics.push(...r.metrics);
          listings.push(r.listing);
        }));
        jobs.push(attempt(`${app.slug} Play 리뷰`, async () => {
          reviews.push(...parsePlayReviews(await postPlay(playReviewsRequest(pkg)), app.slug));
        }));
      }
      return jobs;
    }),
  );

  // 차트는 장르마다 한 번만 받는다. 앱이 차트 밖이면 순위 행을 쓰지 않는다(화면은 「밖」으로 읽는다).
  const charts = new Map<string, Promise<string[]>>();
  const chart = (key: string, load: () => Promise<string[]>) => {
    if (!charts.has(key)) charts.set(key, load());
    return charts.get(key)!;
  };
  const appleChart = (genre: string | null) =>
    chart(`ios:${genre ?? "all"}`, async () => parseAppleChart(await getJson(appleChartUrl(genre))));
  const playChart = (category: string) =>
    chart(`android:${category}`, async () => parsePlayChart(await postPlay(playChartRequest(category))));

  await Promise.all(
    listings.map((listing) => {
      const app = apps.find((a) => a.slug === listing.app_slug)!;
      const rank = (metric_key: string, ids: string[], id: string) => {
        const r = rankOf(ids, id);
        if (r !== null) metrics.push({ at, app_slug: app.slug, store: listing.store, metric_key, value: r });
      };
      if (listing.store === "ios") {
        const id = String(app.app_store_id);
        return Promise.all([
          attempt(`App Store 전체 차트`, async () => rank("rank_overall", await appleChart(null), id)),
          listing.genre_key &&
          attempt(`App Store ${listing.genre} 차트`, async () => rank("rank_category", await appleChart(listing.genre_key), id)),
        ]);
      }
      const pkg = app.android_package!;
      return Promise.all([
        attempt(`Play 전체 차트`, async () => rank("rank_overall", await playChart("APPLICATION"), pkg)),
        listing.genre_key &&
        attempt(`Play ${listing.genre} 차트`, async () => rank("rank_category", await playChart(listing.genre_key!), pkg)),
      ]);
    }),
  );

  for (let i = 0; i < metrics.length; i += UPSERT_CHUNK) {
    const { error: e } = await supabase
      .from("store_metrics")
      .upsert(metrics.slice(i, i + UPSERT_CHUNK), { onConflict: "at,app_slug,store,metric_key" });
    if (e) throw new Error(`store_metrics upsert 실패: ${e.message}`);
  }
  if (listings.length > 0) {
    const { error: e } = await supabase.from("store_listing").upsert(listings, { onConflict: "app_slug,store" });
    if (e) throw new Error(`store_listing upsert 실패: ${e.message}`);
  }
  // first_seen_at 은 보내지 않는다 — 처음 본 시각이 남아 「새 리뷰」를 가른다.
  for (let i = 0; i < reviews.length; i += UPSERT_CHUNK) {
    const { error: e } = await supabase
      .from("store_reviews")
      .upsert(reviews.slice(i, i + UPSERT_CHUNK), { onConflict: "store,review_id" });
    if (e) throw new Error(`store_reviews upsert 실패: ${e.message}`);
  }

  // 같은 차트 실패가 앱마다 반복되므로 한 번씩만 적는다.
  const unique = [...new Set(failures)];
  if (metrics.length === 0 && unique.length > 0) throw new Error(unique.join(" / "));
  return {
    metrics: metrics.length,
    listings: listings.length,
    reviews: reviews.length,
    ...(unique.length > 0 ? { error: unique.join(" / ") } : {}),
  };
}

async function upsertLive(rows: readonly LiveRow[]) {
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const { error } = await supabase
      .from("live_metrics")
      .upsert(rows.slice(i, i + UPSERT_CHUNK), { onConflict: "source,at,entity,metric_key" });
    if (error) throw new Error(`live_metrics upsert 실패: ${error.message}`);
  }
}

async function upsertAll(
  table: string,
  rows: readonly object[],
  onConflict: string,
  updatedAt: string,
) {
  for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK).map((row) => ({ ...row, updated_at: updatedAt }));
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });
    if (error) throw new Error(`${table} upsert 실패: ${error.message}`);
  }
}

async function readSecret(name: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("collect_metrics_secret", { secret_name: name });
  if (error) throw new Error(`Vault 읽기 실패(${name}): ${error.message}`);
  return data;
}

async function requireSecret(name: string): Promise<string> {
  const value = await readSecret(name);
  if (!value) throw new Error(`Vault 에 ${name} 이 없다`);
  return value;
}

async function recordRun(source: string, fields: Record<string, string | null>) {
  const { error } = await supabase
    .from("collection_runs")
    .upsert({ source, ...fields }, { onConflict: "source" });
  if (error) console.error("collection_runs 기록 실패", error.message);
}

function clampDays(raw: string | null): number {
  const n = Number(raw ?? DEFAULT_DAYS);
  if (!Number.isInteger(n) || n < 1) return DEFAULT_DAYS;
  return Math.min(n, MAX_DAYS);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
