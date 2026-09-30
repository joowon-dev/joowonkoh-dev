/**
 * collect-metrics — 외부 지표를 받아 metrics_daily 에 쌓는다.
 *
 *   POST /functions/v1/collect-metrics?source=ga4&days=3
 *   x-collect-secret: <Vault collect_metrics_secret>
 *
 * pg_cron 이 매일 부른다(마이그레이션 20261001000000). 처음 한 번은 days=30 으로
 * 소급 수집해 차트를 채운다.
 *
 * 자격증명은 Vault 에 있다(마이그레이션 20261001010000). Edge Function secrets 가 아니라
 * Vault 를 쓰는 건 SQL 만으로 넣고 바꿀 수 있어서다.
 *
 * 성공이든 실패든 collection_runs 에 남긴다. 어드민 화면의 수집 지연 배너가
 * 이 테이블을 본다 — 조용히 멈추는 수집이 가장 나쁘다.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildReportRequest, normalizeGa4Report } from "./ga4.ts";
import { fetchAccessToken, type ServiceAccountKey } from "./google.ts";

/** joowonkoh.com 웹 스트림이 달린 GA4 속성. 비밀이 아니다. */
const GA4_PROPERTY_ID = "434494008";

const DEFAULT_DAYS = 3;
const MAX_DAYS = 90;

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
  const source = url.searchParams.get("source");
  const days = clampDays(url.searchParams.get("days"));

  if (source !== "ga4") {
    return json({ error: `아직 수집기가 없는 소스: ${source}` }, 400);
  }

  const startedAt = new Date().toISOString();

  try {
    const rows = await collectGa4(days);

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
  const raw = await readSecret("ga4_service_account_json");
  if (!raw) throw new Error("Vault 에 ga4_service_account_json 이 없다");
  const key = JSON.parse(raw) as ServiceAccountKey;
  const propertyId = GA4_PROPERTY_ID;

  const token = await fetchAccessToken(
    key,
    "https://www.googleapis.com/auth/analytics.readonly",
  );

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
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

  return normalizeGa4Report(body, propertyId);
}

async function readSecret(name: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("collect_metrics_secret", { secret_name: name });
  if (error) throw new Error(`Vault 읽기 실패(${name}): ${error.message}`);
  return data;
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
