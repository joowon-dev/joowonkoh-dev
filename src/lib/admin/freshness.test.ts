import { describe, expect, it } from "vitest";
import { findFreshnessProblems } from "./freshness";
import type { CollectionRun } from "./types";

const NOW = new Date("2026-08-03T12:00:00Z");

function run(overrides: Partial<CollectionRun>): CollectionRun {
  return {
    source: "ga4",
    last_run_at: "2026-08-03T02:00:00Z",
    last_success: "2026-08-03T02:00:00Z",
    status: "ok",
    error: null,
    ...overrides,
  };
}

const HEALTHY: CollectionRun[] = [
  run({ source: "ga4" }),
  run({ source: "admob" }),
  run({ source: "instagram" }),
];

describe("findFreshnessProblems", () => {
  it("모두 최근에 성공했으면 문제가 없다", () => {
    expect(findFreshnessProblems(HEALTHY, NOW)).toEqual([]);
  });

  it("수집 기록이 아예 없는 소스를 never로 보고한다", () => {
    const problems = findFreshnessProblems([], NOW);
    expect(problems).toHaveLength(3);
    expect(problems.every((p) => p.reason === "never")).toBe(true);
  });

  it("행은 있지만 성공한 적이 없으면 never로 본다", () => {
    const problems = findFreshnessProblems(
      [
        run({ source: "ga4", last_success: null, status: "error", error: "401" }),
        run({ source: "admob" }),
        run({ source: "instagram" }),
      ],
      NOW,
    );
    expect(problems).toEqual([
      {
        source: "ga4",
        reason: "never",
        lastSuccess: null,
        hoursSince: null,
        error: "401",
      },
    ]);
  });

  it("마지막 성공이 36시간을 넘으면 stale로 본다", () => {
    const problems = findFreshnessProblems(
      [
        run({ source: "ga4", last_success: "2026-08-01T23:00:00Z" }),
        run({ source: "admob" }),
        run({ source: "instagram" }),
      ],
      NOW,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0].source).toBe("ga4");
    expect(problems[0].reason).toBe("stale");
    expect(problems[0].hoursSince).toBeCloseTo(37);
  });

  it("36시간 경계 안쪽은 문제로 보지 않는다", () => {
    const problems = findFreshnessProblems(
      [
        run({ source: "ga4", last_success: "2026-08-02T00:00:00Z" }), // 정확히 36시간
        run({ source: "admob" }),
        run({ source: "instagram" }),
      ],
      NOW,
    );
    expect(problems).toEqual([]);
  });

  it("최근 성공이 있어도 마지막 시도가 실패면 error로 보고한다", () => {
    const problems = findFreshnessProblems(
      [
        run({ source: "admob", status: "error", error: "quota exceeded" }),
        run({ source: "ga4" }),
        run({ source: "instagram" }),
      ],
      NOW,
    );
    expect(problems).toEqual([
      {
        source: "admob",
        reason: "error",
        lastSuccess: "2026-08-03T02:00:00Z",
        hoursSince: 10,
        error: "quota exceeded",
      },
    ]);
  });

  it("여러 소스가 동시에 밀려도 모두 보고한다", () => {
    const problems = findFreshnessProblems(
      [run({ source: "ga4", last_success: "2026-07-01T00:00:00Z" })],
      NOW,
    );
    expect(problems.map((p) => p.source).sort()).toEqual([
      "admob",
      "ga4",
      "instagram",
    ]);
  });
});
