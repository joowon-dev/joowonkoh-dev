/**
 * GA4 Data API 응답 → metrics_daily / metrics_breakdown 행.
 *
 * Deno(Edge Function)와 Node(vitest) 양쪽에서 돌아야 하므로 외부 패키지를 쓰지 않는다.
 */
import { type BreakdownRow, mergeBreakdownRows, toIsoDate } from "./breakdown.ts";

/** GA4 지표 이름 → metrics_daily.metric_key (속성 합계) */
export const GA4_METRICS = {
  activeUsers: "active_users",
  sessions: "sessions",
  newUsers: "new_users",
  screenPageViews: "screen_page_views",
  engagedSessions: "engaged_sessions",
  userEngagementDuration: "user_engagement_duration", // 초. 평균 참여 시간 = 이것 / active_users
} as const;

/**
 * 세부 보고서마다 공통으로 받는 지표. 전부 합산 가능하다.
 * 참여율(engaged/sessions)·평균 참여 시간(duration/activeUsers)은 화면에서 낸다.
 */
export const GA4_BREAKDOWN_METRICS = {
  screenPageViews: "screen_page_views",
  activeUsers: "active_users",
  sessions: "sessions",
  engagedSessions: "engaged_sessions",
  userEngagementDuration: "user_engagement_duration",
} as const;

/** metrics_breakdown.dimension → GA4 차원(값, 사람이 읽을 이름) */
export const GA4_BREAKDOWNS = {
  page: { value: "pagePath", label: "pageTitle" },
  channel: { value: "sessionDefaultChannelGroup", label: null },
  source_medium: { value: "sessionSourceMedium", label: null },
  country: { value: "countryId", label: "country" },
  device: { value: "deviceCategory", label: null },
} as const;

export type Ga4Breakdown = keyof typeof GA4_BREAKDOWNS;

export type MetricRow = {
  source: "ga4";
  metric_date: string; // YYYY-MM-DD
  entity: string;
  metric_key: string;
  value: number;
};

type Ga4Report = {
  dimensionHeaders?: { name: string }[];
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

export function buildBreakdownRequest(dimension: Ga4Breakdown, days: number) {
  const spec = GA4_BREAKDOWNS[dimension];
  const dimensions = [{ name: "date" }, { name: spec.value }];
  if (spec.label) dimensions.push({ name: spec.label });

  return {
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }],
    dimensions,
    metrics: Object.keys(GA4_BREAKDOWN_METRICS).map((name) => ({ name })),
    // 기본 10,000행에서 잘린다. 페이지 × 90일도 넉넉히 들어가게.
    limit: 100000,
  };
}

export function normalizeGa4Report(
  report: Ga4Report,
  propertyId: string,
): MetricRow[] {
  const headers = (report.metricHeaders ?? []).map((h) => h.name);
  const rows: MetricRow[] = [];

  for (const row of report.rows ?? []) {
    const metricDate = toIsoDate(row.dimensionValues[0]?.value ?? "", "GA4");

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

/**
 * 세부 보고서 → metrics_breakdown. 차원 순서는 응답의 dimensionHeaders 를 따른다
 * (요청 순서를 가정하지 않는다).
 */
export function normalizeGa4Breakdown(
  report: Ga4Report,
  dimension: Ga4Breakdown,
): BreakdownRow[] {
  const spec = GA4_BREAKDOWNS[dimension];
  const dimNames = (report.dimensionHeaders ?? []).map((h) => h.name);
  const dateAt = dimNames.indexOf("date");
  const valueAt = dimNames.indexOf(spec.value);
  const labelAt = spec.label ? dimNames.indexOf(spec.label) : -1;
  if (dateAt < 0 || valueAt < 0) {
    throw new Error(`GA4 ${dimension} 보고서에 date/${spec.value} 차원이 없다`);
  }

  const metricNames = (report.metricHeaders ?? []).map((h) => h.name);
  const rows: BreakdownRow[] = [];

  for (const row of report.rows ?? []) {
    const metricDate = toIsoDate(row.dimensionValues[dateAt]?.value ?? "", "GA4");
    const dimValue = row.dimensionValues[valueAt]?.value ?? "(not set)";
    const dimLabel = labelAt >= 0 ? (row.dimensionValues[labelAt]?.value ?? null) : null;

    metricNames.forEach((name, i) => {
      const metricKey = GA4_BREAKDOWN_METRICS[name as keyof typeof GA4_BREAKDOWN_METRICS];
      if (!metricKey) return;
      const value = Number(row.metricValues[i]?.value);
      if (!Number.isFinite(value)) return;

      rows.push({
        source: "ga4",
        metric_date: metricDate,
        dimension,
        dim_value: dimValue,
        dim_label: dimLabel,
        metric_key: metricKey,
        value,
      });
    });
  }

  return mergeBreakdownRows(rows);
}
