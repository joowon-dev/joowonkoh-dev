import { dateRange, kstDate, type SeriesPoint } from "./series";

export type Store = "ios" | "android";

export const STORE_LABELS: Record<Store, string> = { ios: "App Store", android: "Google Play" };

/** store_metrics 한 행. 1시간마다. */
export type StoreMetric = {
  at: string;
  app_slug: string;
  store: Store;
  metric_key: string;
  value: number;
};

export type StoreListingRow = {
  app_slug: string;
  store: Store;
  at: string;
  title: string | null;
  version: string | null;
  updated: string | null;
  genre: string | null;
  genre_key: string | null;
};

export type StoreReview = {
  store: Store;
  review_id: string;
  app_slug: string;
  rating: number;
  title: string | null;
  body: string;
  author: string | null;
  version: string | null;
  reviewed_at: string;
  replied: boolean;
  first_seen_at: string;
};

/** 차트 길이 — 이 밖이면 순위 행이 없다. */
export const CHART_SIZE: Record<Store, number> = { ios: 100, android: 200 };

function pick(rows: readonly StoreMetric[], slug: string, store: Store) {
  return rows.filter((r) => r.app_slug === slug && r.store === store);
}

/**
 * at 시각(또는 그 전) 가장 최근 수집의 값들. 순위는 차트 밖이면 행이 없으므로,
 * 그 수집에 순위 행이 없으면 「밖」(null)이다 — 더 옛날 순위를 끌어오지 않는다.
 */
export function snapshotAt(rows: readonly StoreMetric[], slug: string, store: Store, at?: string) {
  const mine = pick(rows, slug, store).filter((r) => at === undefined || r.at <= at);
  let last: string | null = null;
  for (const r of mine) if (last === null || r.at > last) last = r.at;
  const values: Record<string, number> = {};
  for (const r of mine) if (r.at === last) values[r.metric_key] = r.value;
  return { at: last, values };
}

/** KST 하루마다 그날 마지막 수집 값. 수집이 없는 날은 null. */
export function dailyStoreSeries(
  rows: readonly StoreMetric[],
  opts: { slug: string; store: Store; metricKey: string; endDate: string; days: number },
): SeriesPoint[] {
  const mine = pick(rows, opts.slug, opts.store);
  const collected = new Map<string, string>(); // 날짜 → 그날 마지막 수집 시각
  for (const r of mine) {
    const day = kstDate(new Date(r.at));
    if ((collected.get(day) ?? "") < r.at) collected.set(day, r.at);
  }
  const value = new Map<string, number>();
  for (const r of mine) {
    if (r.metric_key !== opts.metricKey) continue;
    const day = kstDate(new Date(r.at));
    if (collected.get(day) === r.at) value.set(day, r.value);
  }
  return dateRange(opts.endDate, opts.days).map((date) => ({
    date,
    // 그날 수집은 됐는데 순위 행이 없으면 차트 밖 — 선을 끊는다(null).
    value: value.get(date) ?? null,
  }));
}

export type StoreSummary = {
  rating: number | null;
  ratingCount: number;
  installs: number | null;
  /** 두 스토어의 카테고리 순위 중 좋은 쪽 */
  bestRank: { store: Store; rank: number; genre: string | null } | null;
};

/** 앱 카드 한 줄. 별점은 평가 수로 가중 평균한다. */
export function summarizeStores(
  rows: readonly StoreMetric[],
  listings: readonly StoreListingRow[],
  slug: string,
): StoreSummary {
  let weighted = 0;
  let count = 0;
  let installs: number | null = null;
  let bestRank: StoreSummary["bestRank"] = null;

  for (const store of ["ios", "android"] as const) {
    const { values } = snapshotAt(rows, slug, store);
    const n = values.rating_count ?? 0;
    if (values.rating !== undefined && n > 0) {
      weighted += values.rating * n;
      count += n;
    }
    if (store === "android" && values.installs !== undefined) installs = values.installs;
    const rank = values.rank_category;
    if (rank !== undefined && (bestRank === null || rank < bestRank.rank)) {
      const genre = listings.find((l) => l.app_slug === slug && l.store === store)?.genre ?? null;
      bestRank = { store, rank, genre };
    }
  }
  return { rating: count > 0 ? weighted / count : null, ratingCount: count, installs, bestRank };
}

/** 처음 본 지 하루가 안 된 리뷰. */
export function isNewReview(review: StoreReview, now: Date): boolean {
  return now.getTime() - Date.parse(review.first_seen_at) < 24 * 3_600_000;
}

/** 스토어 링크와 같은 모양 — 순위 표시. 차트 밖이면 「100위 밖」. */
export function rankLabel(rank: number | undefined | null, store: Store): string {
  return rank ? `${rank}위` : `${CHART_SIZE[store]}위 밖`;
}
