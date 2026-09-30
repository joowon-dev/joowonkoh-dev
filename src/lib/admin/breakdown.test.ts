import { describe, expect, it } from "vitest";
import { type Column, pivotBreakdown, ratio, sortLines } from "./breakdown";

const ROWS = [
  { dim_value: "/", dim_label: "Joowon Koh", metric_key: "screen_page_views", total: "300" },
  { dim_value: "/", dim_label: "Joowon Koh", metric_key: "sessions", total: "200" },
  { dim_value: "/", dim_label: "Joowon Koh", metric_key: "engaged_sessions", total: "120" },
  { dim_value: "/blog/a", dim_label: null, metric_key: "screen_page_views", total: 50 },
  { dim_value: "/blog/a", dim_label: null, metric_key: "sessions", total: 0 },
];

describe("pivotBreakdown", () => {
  it("차원값마다 한 줄, numeric 문자열은 숫자로", () => {
    const lines = pivotBreakdown(ROWS);
    expect(lines).toEqual([
      { value: "/", label: "Joowon Koh", metrics: { screen_page_views: 300, sessions: 200, engaged_sessions: 120 } },
      { value: "/blog/a", label: null, metrics: { screen_page_views: 50, sessions: 0 } },
    ]);
  });
});

describe("ratio", () => {
  it("분모가 0 이거나 없으면 null — 숫자를 만들어내지 않는다", () => {
    expect(ratio(120, 200)).toBe(0.6);
    expect(ratio(1, 0)).toBeNull();
    expect(ratio(undefined, 3)).toBeNull();
  });
});

describe("sortLines", () => {
  const engagement: Column = {
    key: "engagement_rate",
    label: "참여율",
    derive: (m) => ratio(m.engaged_sessions, m.sessions),
    format: String,
  };
  const views: Column = { key: "screen_page_views", label: "조회", format: String };

  it("저장된 지표로 내림차순", () => {
    expect(sortLines(pivotBreakdown(ROWS), views).map((l) => l.value)).toEqual(["/", "/blog/a"]);
  });

  it("파생 지표로 정렬하고 null 은 뒤로 — 방향과 상관없이", () => {
    const lines = pivotBreakdown(ROWS);
    expect(sortLines(lines, engagement, "desc").map((l) => l.value)).toEqual(["/", "/blog/a"]);
    expect(sortLines(lines, engagement, "asc").map((l) => l.value)).toEqual(["/", "/blog/a"]);
  });
});
