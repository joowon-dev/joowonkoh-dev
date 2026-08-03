import { describe, expect, it } from "vitest";
import { buildSeries, computeDelta, dateRange } from "./series";
import type { MetricRow } from "./types";

function row(overrides: Partial<MetricRow>): MetricRow {
  return {
    source: "ga4",
    metric_date: "2026-08-02",
    entity: "properties/1",
    metric_key: "active_users",
    value: 10,
    ...overrides,
  };
}

describe("dateRange", () => {
  it("endDate를 포함해 오름차순으로 만든다", () => {
    expect(dateRange("2026-08-03", 3)).toEqual([
      "2026-08-01",
      "2026-08-02",
      "2026-08-03",
    ]);
  });

  it("월 경계를 넘어간다", () => {
    expect(dateRange("2026-08-01", 2)).toEqual(["2026-07-31", "2026-08-01"]);
  });

  it("날짜 형식이 아니면 던진다", () => {
    expect(() => dateRange("어제", 3)).toThrow();
  });
});

describe("buildSeries", () => {
  const opts = {
    source: "ga4" as const,
    metricKey: "active_users",
    endDate: "2026-08-03",
    days: 3,
  };

  it("행이 없는 날은 0이 아니라 null로 둔다", () => {
    const series = buildSeries([row({ metric_date: "2026-08-03" })], opts);
    expect(series).toEqual([
      { date: "2026-08-01", value: null },
      { date: "2026-08-02", value: null },
      { date: "2026-08-03", value: 10 },
    ]);
  });

  it("같은 날짜의 여러 entity를 합산한다", () => {
    const series = buildSeries(
      [
        row({ metric_date: "2026-08-03", entity: "properties/1", value: 10 }),
        row({ metric_date: "2026-08-03", entity: "properties/2", value: 5 }),
      ],
      opts,
    );
    expect(series.at(-1)).toEqual({ date: "2026-08-03", value: 15 });
  });

  it("다른 소스와 다른 지표를 섞지 않는다", () => {
    const series = buildSeries(
      [
        row({ metric_date: "2026-08-03", value: 10 }),
        row({ metric_date: "2026-08-03", source: "admob", value: 999 }),
        row({ metric_date: "2026-08-03", metric_key: "sessions", value: 777 }),
      ],
      opts,
    );
    expect(series.at(-1)?.value).toBe(10);
  });

  it("범위 밖 날짜는 버린다", () => {
    const series = buildSeries([row({ metric_date: "2026-07-01" })], opts);
    expect(series.every((p) => p.value === null)).toBe(true);
  });

  it("값이 0인 날은 0으로 남긴다", () => {
    const series = buildSeries(
      [row({ metric_date: "2026-08-03", value: 0 })],
      opts,
    );
    expect(series.at(-1)?.value).toBe(0);
  });
});

describe("computeDelta", () => {
  it("마지막 두 점으로 변화율을 낸다", () => {
    const delta = computeDelta([
      { date: "2026-08-02", value: 100 },
      { date: "2026-08-03", value: 120 },
    ]);
    expect(delta.current).toBe(120);
    expect(delta.previous).toBe(100);
    expect(delta.changeRatio).toBeCloseTo(0.2);
  });

  it("감소도 표현한다", () => {
    const delta = computeDelta([
      { date: "2026-08-02", value: 100 },
      { date: "2026-08-03", value: 75 },
    ]);
    expect(delta.changeRatio).toBeCloseTo(-0.25);
  });

  it("이전 값이 0이면 변화율을 만들지 않는다", () => {
    const delta = computeDelta([
      { date: "2026-08-02", value: 0 },
      { date: "2026-08-03", value: 10 },
    ]);
    expect(delta.changeRatio).toBeNull();
  });

  it("빠진 날이 있으면 변화율을 만들지 않는다", () => {
    const delta = computeDelta([
      { date: "2026-08-02", value: null },
      { date: "2026-08-03", value: 10 },
    ]);
    expect(delta.current).toBe(10);
    expect(delta.changeRatio).toBeNull();
  });

  it("점이 하나뿐이면 비교하지 않는다", () => {
    const delta = computeDelta([{ date: "2026-08-03", value: 10 }]);
    expect(delta.previous).toBeNull();
    expect(delta.changeRatio).toBeNull();
  });

  it("빈 시계열도 견딘다", () => {
    expect(computeDelta([])).toEqual({
      current: null,
      previous: null,
      changeRatio: null,
    });
  });
});
