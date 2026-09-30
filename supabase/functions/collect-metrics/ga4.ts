/**
 * GA4 Data API 응답 → metrics_daily 행.
 *
 * Deno(Edge Function)와 Node(vitest) 양쪽에서 돌아야 하므로 이 파일은 아무것도
 * import 하지 않는다.
 */

/** GA4 지표 이름 → metrics_daily.metric_key */
export const GA4_METRICS = {
  activeUsers: "active_users",
  sessions: "sessions",
  newUsers: "new_users",
} as const;

export type MetricRow = {
  source: "ga4";
  metric_date: string; // YYYY-MM-DD
  entity: string;
  metric_key: string;
  value: number;
};

type Ga4Report = {
  metricHeaders?: { name: string }[];
  rows?: {
    dimensionValues: { value: string }[];
    metricValues: { value: string }[];
  }[];
};

/**
 * 어제부터 거슬러 `days`일을 요청한다. 오늘은 수집 중이라 불완전하다.
 * GA4는 처리 지연으로 최근 1~2일 값이 뒤늦게 바뀌므로, 매일 며칠씩 겹쳐서
 * 다시 받는다. upsert라 겹쳐도 중복은 쌓이지 않는다.
 */
export function buildReportRequest(days: number) {
  return {
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }],
    dimensions: [{ name: "date" }],
    metrics: Object.keys(GA4_METRICS).map((name) => ({ name })),
    keepEmptyRows: true,
  };
}

export function normalizeGa4Report(
  report: Ga4Report,
  propertyId: string,
): MetricRow[] {
  const headers = (report.metricHeaders ?? []).map((h) => h.name);
  const rows: MetricRow[] = [];

  for (const row of report.rows ?? []) {
    const metricDate = toIsoDate(row.dimensionValues[0]?.value ?? "");

    headers.forEach((name, i) => {
      const metricKey = GA4_METRICS[name as keyof typeof GA4_METRICS];
      if (!metricKey) return;

      const value = Number(row.metricValues[i]?.value);
      if (!Number.isFinite(value)) return;

      rows.push({
        source: "ga4",
        metric_date: metricDate,
        entity: propertyId,
        metric_key: metricKey,
        value,
      });
    });
  }

  return rows;
}

/** GA4의 `date` 차원은 속성 시간대 기준 YYYYMMDD 로 온다. */
function toIsoDate(yyyymmdd: string): string {
  if (!/^\d{8}$/.test(yyyymmdd)) {
    throw new Error(`GA4 date 차원 형식이 예상과 다르다: "${yyyymmdd}"`);
  }
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6)}`;
}
