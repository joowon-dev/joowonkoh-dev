/**
 * AdMob Network Report → metrics_daily / metrics_breakdown 행.
 *
 * ga4.ts 와 같은 이유로 외부 패키지를 쓰지 않는다.
 */
import { type BreakdownRow, mergeBreakdownRows, toIsoDate } from "./breakdown.ts";

/** AdMob 지표 → metrics_daily.metric_key */
export const ADMOB_METRICS = {
  ESTIMATED_EARNINGS: "estimated_earnings",
  IMPRESSIONS: "impressions",
} as const;

/** 세부 보고서 지표. 전부 합산 가능하다. */
export const ADMOB_BREAKDOWN_METRICS = {
  ESTIMATED_EARNINGS: "estimated_earnings",
  IMPRESSIONS: "impressions",
  CLICKS: "clicks",
  AD_REQUESTS: "ad_requests",
  MATCHED_REQUESTS: "matched_requests",
} as const;

/** metrics_breakdown.dimension → AdMob 차원. 라벨은 응답의 displayLabel 을 쓴다. */
export const ADMOB_BREAKDOWNS = {
  app: "APP",
  ad_unit: "AD_UNIT",
  format: "FORMAT",
  country: "COUNTRY",
} as const;

export type AdmobBreakdown = keyof typeof ADMOB_BREAKDOWNS;

// eCPM(IMPRESSION_RPM)은 저장하지 않는다. 앱별 비율이라 대시보드가 날짜별로 합산하면
// 틀린 숫자가 된다. 필요하면 earnings / impressions * 1000 으로 합계에서 다시 낸다.
// CTR(clicks/impressions), 매치율(matched/requests)도 같은 이유로 화면에서 낸다.

export type MetricRow = {
  source: "admob";
  metric_date: string; // YYYY-MM-DD
  entity: string; // AdMob app id (ca-app-pub-...~...)
  metric_key: string;
  value: number;
};

type Chunk = {
  header?: { localizationSettings?: { currencyCode?: string } };
  row?: {
    dimensionValues: Record<string, { value: string; displayLabel?: string }>;
    metricValues: Record<
      string,
      { microsValue?: string; integerValue?: string; doubleValue?: number }
    >;
  };
  footer?: unknown;
};

type YMD = { year: number; month: number; day: number };

/**
 * 어제(계정 시간대 = KST)부터 거슬러 `days`일. AdMob 도 하루 이틀 뒤에 값이 확정된다.
 * API 는 timeZone 을 받지 않고 계정 보고 시간대를 쓴다 — 이 계정은 Asia/Seoul.
 */
export function buildNetworkReportRequest(now: Date, days: number) {
  const end = kstDay(now, -1);
  const start = kstDay(now, -days);
  return {
    reportSpec: {
      dateRange: { startDate: start, endDate: end },
      dimensions: ["DATE", "APP"],
      metrics: Object.keys(ADMOB_METRICS),
      localizationSettings: { currencyCode: "USD" },
    },
  };
}

export function buildAdmobBreakdownRequest(now: Date, days: number, dimension: AdmobBreakdown) {
  const { reportSpec } = buildNetworkReportRequest(now, days);
  return {
    reportSpec: {
      ...reportSpec,
      dimensions: ["DATE", ADMOB_BREAKDOWNS[dimension]],
      metrics: Object.keys(ADMOB_BREAKDOWN_METRICS),
    },
  };
}

export function normalizeAdmobBreakdown(
  chunks: readonly Chunk[],
  dimension: AdmobBreakdown,
): BreakdownRow[] {
  assertUsd(chunks);
  const apiDimension = ADMOB_BREAKDOWNS[dimension];
  const rows: BreakdownRow[] = [];

  for (const { row } of chunks) {
    if (!row) continue;
    const metricDate = toIsoDate(row.dimensionValues.DATE?.value ?? "", "AdMob");
    const cell = row.dimensionValues[apiDimension];
    if (!cell?.value) continue;

    for (const [name, metricKey] of Object.entries(ADMOB_BREAKDOWN_METRICS)) {
      const value = readMetric(row.metricValues[name]);
      if (value === null) continue;
      rows.push({
        source: "admob",
        metric_date: metricDate,
        dimension,
        dim_value: cell.value,
        dim_label: cell.displayLabel ?? null,
        metric_key: metricKey,
        value,
      });
    }
  }
  return mergeBreakdownRows(rows);
}

/**
 * `dateRange` 를 주면 그 범위에서 행이 하나도 없는 날을 0 으로 채운다. AdMob 은 광고가
 * 0 인 날에 행을 아예 보내지 않는데, 행이 없으면 대시보드는 "수집 누락"으로 보고
 * 선을 끊는다. 수집은 됐고 값이 0 이었다는 걸 남기려고 entity "none" 으로 0 을 적는다
 * (날짜별 합산이라 합계는 그대로다).
 */
export function normalizeAdmobReport(
  chunks: readonly Chunk[],
  dateRange?: { startDate: YMD; endDate: YMD },
): MetricRow[] {
  assertUsd(chunks);

  const rows: MetricRow[] = [];
  for (const { row } of chunks) {
    if (!row) continue;

    const metricDate = toIsoDate(row.dimensionValues.DATE?.value ?? "", "AdMob");
    const appId = row.dimensionValues.APP?.value;
    if (!appId) continue;

    for (const [name, metricKey] of Object.entries(ADMOB_METRICS)) {
      const value = readMetric(row.metricValues[name]);
      if (value === null) continue;

      rows.push({ source: "admob", metric_date: metricDate, entity: appId, metric_key: metricKey, value });
    }
  }

  if (dateRange) {
    const seen = new Set(rows.map((r) => r.metric_date));
    for (const date of datesBetween(dateRange.startDate, dateRange.endDate)) {
      if (seen.has(date)) continue;
      for (const metricKey of Object.values(ADMOB_METRICS)) {
        rows.push({ source: "admob", metric_date: date, entity: "none", metric_key: metricKey, value: 0 });
      }
    }
  }

  return rows;
}

function datesBetween(start: YMD, end: YMD): string[] {
  const dates: string[] = [];
  const last = Date.UTC(end.year, end.month - 1, end.day);
  for (let t = Date.UTC(start.year, start.month - 1, start.day); t <= last; t += 86_400_000) {
    dates.push(new Date(t).toISOString().slice(0, 10));
  }
  return dates;
}

function kstDay(now: Date, offsetDays: number): YMD {
  const d = new Date(now.getTime() + 9 * 3_600_000 + offsetDays * 86_400_000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** 대시보드는 달러로 그린다. 다른 통화가 오면 숫자를 섞지 말고 멈춘다. */
function assertUsd(chunks: readonly Chunk[]) {
  const currency = chunks.find((c) => c.header)?.header?.localizationSettings?.currencyCode;
  if (currency && currency !== "USD") {
    throw new Error(`AdMob 보고서 통화가 USD 가 아니다: ${currency}`);
  }
}

/** 수익은 마이크로 단위 정수(microsValue)로, 나머지는 integerValue/doubleValue 로 온다. */
function readMetric(
  cell: { microsValue?: string; integerValue?: string; doubleValue?: number } | undefined,
): number | null {
  if (!cell) return null;
  const value =
    cell.microsValue !== undefined
      ? Number(cell.microsValue) / 1_000_000
      : Number(cell.integerValue ?? cell.doubleValue);
  return Number.isFinite(value) ? value : null;
}
