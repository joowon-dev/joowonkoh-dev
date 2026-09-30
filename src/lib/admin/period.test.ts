import { describe, expect, it } from "vitest";
import { parsePeriod, previousPeriod, withQuery } from "./period";

// 2026-10-01 02:40 KST — UTC 로는 아직 9/30
const NOW = new Date("2026-09-30T17:40:00Z");

describe("parsePeriod", () => {
  it("기본은 어제(KST)까지 30일", () => {
    expect(parsePeriod({}, NOW)).toEqual({
      start: "2026-09-01",
      end: "2026-09-30",
      days: 30,
      query: {},
      preset: 30,
    });
  });

  it("range 프리셋", () => {
    const p = parsePeriod({ range: "7" }, NOW);
    expect([p.start, p.end, p.days, p.query]).toEqual(["2026-09-24", "2026-09-30", 7, { range: "7" }]);
  });

  it("모르는 range 는 기본값으로", () => {
    expect(parsePeriod({ range: "12" }, NOW).days).toBe(30);
  });

  it("직접 지정 — to 가 오늘 이후면 어제로 자른다", () => {
    const p = parsePeriod({ from: "2026-09-10", to: "2026-10-05" }, NOW);
    expect([p.start, p.end, p.days, p.preset]).toEqual(["2026-09-10", "2026-09-30", 21, null]);
    expect(p.query).toEqual({ from: "2026-09-10", to: "2026-09-30" });
  });

  it("from 이 to 보다 늦으면 하루짜리로", () => {
    const p = parsePeriod({ from: "2026-09-20", to: "2026-09-10" }, NOW);
    expect([p.start, p.end, p.days]).toEqual(["2026-09-10", "2026-09-10", 1]);
  });

  it("형식이 틀린 from 은 무시하고 기본 기간", () => {
    expect(parsePeriod({ from: "어제" }, NOW).days).toBe(30);
  });
});

describe("previousPeriod", () => {
  it("바로 앞 같은 길이", () => {
    expect(previousPeriod(parsePeriod({ range: "7" }, NOW))).toEqual({ start: "2026-09-17", end: "2026-09-23" });
  });
});

describe("withQuery", () => {
  it("쿼리가 없으면 경로만", () => {
    expect(withQuery("/admin/web", {})).toBe("/admin/web");
    expect(withQuery("/admin/web", { range: "7" })).toBe("/admin/web?range=7");
  });
});
