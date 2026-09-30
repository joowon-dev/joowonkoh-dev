import type { MetricRow, Source } from "./types";

export type SeriesPoint = { date: string; value: number | null };

/**
 * 평평한 metrics_daily 행을 날짜가 빠짐없이 채워진 시계열로 만든다.
 *
 * 수집이 하루 걸러 실패하면 그 날짜의 행 자체가 없다. 없는 날을 0으로 채우면
 * "수익이 0원인 날"처럼 보여 오해를 부르므로, 구멍은 null로 남기고 그리는 쪽에서
 * 선을 끊는다.
 */
export function buildSeries(
  rows: readonly MetricRow[],
  options: {
    source: Source;
    metricKey: string;
    endDate: string; // YYYY-MM-DD, 포함
    days: number;
  },
): SeriesPoint[] {
  const { source, metricKey, endDate, days } = options;

  const totals = new Map<string, number>();
  for (const row of rows) {
    if (row.source !== source || row.metric_key !== metricKey) continue;
    // entity가 여러 개면(속성 여러 개, 앱 여러 개) 날짜별로 합산한다.
    totals.set(row.metric_date, (totals.get(row.metric_date) ?? 0) + row.value);
  }

  return dateRange(endDate, days).map((date) => ({
    date,
    value: totals.has(date) ? totals.get(date)! : null,
  }));
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 한국 날짜(YYYY-MM-DD). GA4 속성이 KST라 metric_date 도 KST 날짜다.
 * toISOString()은 UTC라 00~09시(KST)에는 하루 전 날짜가 나온다.
 */
export function kstDate(now: Date, offsetDays = 0): string {
  return new Date(now.getTime() + KST_OFFSET_MS + offsetDays * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

/** endDate로 끝나는 days일치 날짜를 오름차순으로 만든다. */
export function dateRange(endDate: string, days: number): string[] {
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (Number.isNaN(end)) throw new Error(`날짜 형식이 아닙니다: ${endDate}`);

  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(new Date(end - i * 86_400_000).toISOString().slice(0, 10));
  }
  return dates;
}

export type Delta = {
  current: number | null;
  previous: number | null;
  /** 전일 대비 변화율. 비교 불가면 null. */
  changeRatio: number | null;
};

/** 시계열의 마지막 두 점으로 전일 대비 증감을 낸다. */
export function computeDelta(series: readonly SeriesPoint[]): Delta {
  const current = series.at(-1)?.value ?? null;
  const previous = series.at(-2)?.value ?? null;

  // 이전 값이 0이면 변화율이 무한대가 된다. 숫자를 만들어내지 않고 비운다.
  const changeRatio =
    current === null || previous === null || previous === 0
      ? null
      : (current - previous) / previous;

  return { current, previous, changeRatio };
}

/** 기간 합계. 값이 하나도 없으면 null — 0 과 "모름"을 구분한다. */
export function sumPoints(series: readonly SeriesPoint[]): number | null {
  let sum = 0;
  let any = false;
  for (const p of series) {
    if (p.value === null) continue;
    sum += p.value;
    any = true;
  }
  return any ? sum : null;
}
