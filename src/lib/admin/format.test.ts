import { describe, expect, it } from "vitest";
import { countryName, formatDay, formatDuration, formatUsd } from "./format";

describe("format", () => {
  it("달러 — $1 미만은 세 자리", () => {
    expect(formatUsd(1.8)).toBe("$1.80");
    expect(formatUsd(0.0503)).toBe("$0.050");
    expect(formatUsd(1234.5)).toBe("$1,234.50");
  });

  it("초를 분·초로", () => {
    expect(formatDuration(42)).toBe("42초");
    expect(formatDuration(83)).toBe("1분 23초");
    expect(formatDuration(120)).toBe("2분");
  });

  it("날짜는 요일까지", () => {
    expect(formatDay("2026-09-30")).toBe("9월 30일 (수)");
  });

  it("국가 코드를 한국어로, 모르는 값은 그대로", () => {
    expect(countryName("KR")).toBe("대한민국");
    expect(countryName("(not set)")).toBe("알 수 없음");
    expect(countryName("ZZZ")).toBe("ZZZ");
  });
});
