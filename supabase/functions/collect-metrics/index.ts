/**
 * collect-metrics — 외부 지표를 받아 metrics_daily 에 쌓는다.
 *
 *   POST /functions/v1/collect-metrics?source=ga4|admob&days=3
 *   x-collect-secret: <Vault collect_metrics_secret>
 *
 * pg_cron 이 소스마다 매일 부른다(마이그레이션 20261001000000, 20261001020000).
 * 처음 한 번은 days=30 으로 소급 수집해 차트를 채운다.
 *
 * 자격증명은 Vault 에 있다(마이그레이션 20261001010000). Edge Function secrets 가 아니라
 * Vault 를 쓰는 건 SQL 만으로 넣고 바꿀 수 있어서다.
 *
 * 성공이든 실패든 collection_runs 에 남긴다. 어드민 화면의 수집 지연 배너가
 * 이 테이블을 본다 — 조용히 멈추는 수집이 가장 나쁘다.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildNetworkReportRequest, normalizeAdmobReport } from "./admob.ts";
import { buildReportRequest, normalizeGa4Report } from "./ga4.ts";
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

const COLLECTORS: Record<string, (days: number) => Promise<Row[]>> = {
  ga4: collectGa4,
  admob: collectAdmob,
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

  const collect = COLLECTORS[source];
  if (!collect) {
    return json({ error: `아직 수집기가 없는 소스: ${source}` }, 400);
  }

  const startedAt = new Date().toISOString();

  try {
    const rows = await collect(days);

    const { error } = await supabase
      .from("metrics_daily")
      .upsert(
        rows.map((row) => ({ ...row, updated_at: startedAt })),
        { onConflict: "source,metric_date,entity,metric_key" },
      );
    if (error) throw new Error(`metrics_daily upsert 실패: ${error.message}`);

    await recordRun(source, {
      last_run_at: startedAt,
      last_success: startedAt,
      status: "ok",
      error: null,
    });

    return json({ source, days, rows: rows.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // last_success 는 건드리지 않는다. 배너가 "마지막 성공이 언제였나"를 보여야 한다.
    await recordRun(source, { last_run_at: startedAt, status: "error", error: message });
    return json({ source, error: message }, 500);
  }
});

async function collectGa4(days: number) {
  const key = JSON.parse(await requireSecret("ga4_service_account_json")) as ServiceAccountKey;

  const token = await fetchAccessToken(
    key,
    "https://www.googleapis.com/auth/analytics.readonly",
  );

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(buildReportRequest(days)),
    },
  );
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`GA4 runReport 실패 (${res.status}): ${body?.error?.message ?? JSON.stringify(body)}`);
  }

  return normalizeGa4Report(body, GA4_PROPERTY_ID);
}

async function collectAdmob(days: number) {
  const token = await refreshAccessToken({
    clientId: await requireSecret("admob_client_id"),
    clientSecret: await requireSecret("admob_client_secret"),
    refreshToken: await requireSecret("admob_refresh_token"),
  });

  const request = buildNetworkReportRequest(new Date(), days);
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

  return normalizeAdmobReport(body, request.reportSpec.dateRange);
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
