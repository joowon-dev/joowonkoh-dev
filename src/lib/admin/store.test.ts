import { describe, expect, it } from "vitest";
import {
  dailyStoreSeries,
  isNewReview,
  rankLabel,
  snapshotAt,
  type StoreMetric,
  type StoreReview,
  summarizeStores,
} from "./store";

const m = (at: string, store: "ios" | "android", metric_key: string, value: number, app_slug = "moneytick"): StoreMetric => ({
  at,
  app_slug,
  store,
  metric_key,
  value,
});

// KST 10/25 23시, 10/26 01시, 10/26 05시
const A = "2026-10-25T14:00:00.000Z";
const B = "2026-10-25T16:00:00.000Z";
const C = "2026-10-25T20:00:00.000Z";

const rows: StoreMetric[] = [
  m(A, "ios", "rating", 3.9),
  m(A, "ios", "rating_count", 39),
  m(A, "ios", "rank_category", 80),
  m(B, "ios", "rating", 3.95),
  m(B, "ios", "rating_count", 40),
  m(B, "ios", "rank_category", 71),
  m(C, "ios", "rating", 3.95),
  m(C, "ios", "rating_count", 40), // C 에는 순위가 없다 = 차트 밖
  m(C, "android", "rating", 4.7),
  m(C, "android", "rating_count", 7),
  m(C, "android", "installs", 2071),
  m(C, "ios", "rating", 5, "jigumia"),
];

describe("snapshotAt", () => {
  it("가장 최근 수집만 — 차트 밖이 된 순위를 옛 값으로 채우지 않는다", () => {
    expect(snapshotAt(rows, "moneytick", "ios")).toEqual({ at: C, values: { rating: 3.95, rating_count: 40 } });
  });

  it("그 시각 이전 기준(어제와 비교)", () => {
    expect(snapshotAt(rows, "moneytick", "ios", B).values.rank_category).toBe(71);
  });
});

describe("dailyStoreSeries", () => {
  it("KST 하루마다 그날 마지막 수집 값", () => {
    const s = dailyStoreSeries(rows, { slug: "moneytick", store: "ios", metricKey: "rating_count", endDate: "2026-10-26", days: 2 });
    expect(s).toEqual([
      { date: "2026-10-25", value: 39 },
      { date: "2026-10-26", value: 40 },
    ]);
  });

  it("그날 마지막 수집에 순위가 없으면 null(차트 밖)", () => {
    const s = dailyStoreSeries(rows, { slug: "moneytick", store: "ios", metricKey: "rank_category", endDate: "2026-10-26", days: 2 });
    expect(s.map((p) => p.value)).toEqual([80, null]);
  });
});

describe("summarizeStores", () => {
  it("별점은 평가 수 가중 평균, 설치 수는 Play, 순위는 좋은 쪽", () => {
    const sum = summarizeStores(
      [...rows, m(C, "android", "rank_category", 150)],
      [{ app_slug: "moneytick", store: "android", at: C, title: null, version: null, updated: null, genre: "금융", genre_key: "FINANCE" }],
      "moneytick",
    );
    expect(sum.ratingCount).toBe(47);
    expect(sum.rating).toBeCloseTo((3.95 * 40 + 4.7 * 7) / 47);
    expect(sum.installs).toBe(2071);
    expect(sum.bestRank).toEqual({ store: "android", rank: 150, genre: "금융" });
  });

  it("평가가 하나도 없으면 별점 null", () => {
    expect(summarizeStores([m(C, "ios", "rating", 0), m(C, "ios", "rating_count", 0)], [], "moneytick").rating).toBeNull();
  });
});

describe("isNewReview / rankLabel", () => {
  const review = { first_seen_at: "2026-10-26T00:00:00Z" } as StoreReview;
  it("처음 본 지 24시간 안이면 새 리뷰", () => {
    expect(isNewReview(review, new Date("2026-10-26T23:00:00Z"))).toBe(true);
    expect(isNewReview(review, new Date("2026-10-27T01:00:00Z"))).toBe(false);
  });
  it("순위가 없으면 차트 길이 밖", () => {
    expect(rankLabel(71, "ios")).toBe("71위");
    expect(rankLabel(null, "ios")).toBe("100위 밖");
    expect(rankLabel(undefined, "android")).toBe("200위 밖");
  });
});
