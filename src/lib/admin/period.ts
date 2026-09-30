import { dateRange, kstDate } from "./series";

/**
 * 화면이 보는 기간. 끝은 늘 어제(KST) 이하 — 오늘은 수집 중이라 불완전하다.
 *
 *   ?range=7|30|90            어제까지 N일 (기본 30)
 *   ?from=YYYY-MM-DD&to=...   직접 지정. to 가 어제를 넘으면 어제로 자른다
 */
export const RANGE_PRESETS = [7, 30, 90] as const;
export const DEFAULT_RANGE = 30;
/** 수집기가 소급할 수 있는 최대 폭과 맞춘다. 그 이상은 데이터가 없다. */
export const MAX_DAYS = 366;

export type Period = {
  start: string;
  end: string;
  days: number;
  /** 링크에 다시 붙일 쿼리. 프리셋이면 range, 직접 지정이면 from/to */
  query: Record<string, string>;
  preset: number | null;
};

type SearchParams = Record<string, string | string[] | undefined>;

export function parsePeriod(params: SearchParams, now: Date): Period {
  const yesterday = kstDate(now, -1);
  const from = single(params.from);
  const to = single(params.to);

  if (from && isDate(from)) {
    let end = to && isDate(to) ? to : yesterday;
    if (end > yesterday) end = yesterday;
    let start = from > end ? end : from;
    let days = daysBetween(start, end) + 1;
    if (days > MAX_DAYS) {
      days = MAX_DAYS;
      start = dateRange(end, MAX_DAYS)[0];
    }
    return { start, end, days, query: { from: start, to: end }, preset: null };
  }

  const range = Number(single(params.range));
  const days = (RANGE_PRESETS as readonly number[]).includes(range) ? range : DEFAULT_RANGE;
  return {
    start: dateRange(yesterday, days)[0],
    end: yesterday,
    days,
    query: days === DEFAULT_RANGE ? {} : { range: String(days) },
    preset: days,
  };
}

/** 바로 앞 같은 길이의 기간 — "지난 기간 대비" 비교용 */
export function previousPeriod(period: Period): { start: string; end: string } {
  const end = dateRange(period.start, 2)[0];
  return { start: dateRange(end, period.days)[0], end };
}

export function withQuery(path: string, query: Record<string, string>): string {
  const qs = new URLSearchParams(query).toString();
  return qs ? `${path}?${qs}` : path;
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}
