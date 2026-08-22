import { describe, expect, it } from "vitest";
import {
  computeNow,
  dateRangeBounds,
  shouldKeepWaitingForTiles,
  summaryOpacity,
} from "./playback";

describe("computeNow", () => {
  const range = { from: 1_000, to: 11_000 };

  it("0초 경과는 기간의 시작", () => {
    expect(computeNow(0, 10, range)).toBe(1_000);
  });

  it("절반 경과는 기간의 중간", () => {
    expect(computeNow(5, 10, range)).toBe(6_000);
  });

  it("전체 경과는 기간의 끝", () => {
    expect(computeNow(10, 10, range)).toBe(11_000);
  });

  it("느린 기기라 경과가 durationSec을 넘어도 끝을 넘지 않는다", () => {
    expect(computeNow(37, 10, range)).toBe(11_000);
  });

  it("durationSec이 0 이하면 바로 끝으로 본다", () => {
    expect(computeNow(0, 0, range)).toBe(11_000);
  });
});

describe("shouldKeepWaitingForTiles", () => {
  it("대기 중인 타일이 없으면 더 기다리지 않는다", () => {
    expect(shouldKeepWaitingForTiles(0, 0, 3_000)).toBe(false);
  });

  it("대기 중이고 아직 최대 시간 전이면 기다린다", () => {
    expect(shouldKeepWaitingForTiles(4, 1_500, 3_000)).toBe(true);
  });

  it("대기 중이어도 최대 시간을 넘기면 포기한다", () => {
    expect(shouldKeepWaitingForTiles(4, 3_001, 3_000)).toBe(false);
  });
});

describe("summaryOpacity", () => {
  const durationSec = 10; // 마지막 3초가 카드 몫이므로 startRatio = 0.7

  it("마지막 3초 이전에는 안 보인다", () => {
    expect(summaryOpacity(0.5, durationSec)).toBe(0);
    expect(summaryOpacity(0.7, durationSec)).toBe(0);
  });

  it("마지막 3초 동안 0에서 1로 선형 상승한다", () => {
    // 0.85는 startRatio(0.7)와 끝(1.0)의 정확히 중간
    expect(summaryOpacity(0.85, durationSec)).toBeCloseTo(0.5, 9);
  });

  it("끝에서는 완전히 덮는다", () => {
    expect(summaryOpacity(1, durationSec)).toBe(1);
  });

  it("영상 길이가 카드 몫(3초)보다 짧으면 시작하자마자 완전히 덮는다", () => {
    expect(summaryOpacity(0.01, 2)).toBe(1);
    expect(summaryOpacity(0, 2)).toBe(0);
  });
});

describe("dateRangeBounds", () => {
  it("종료일 자정 직전까지 포함한다", () => {
    const b = dateRangeBounds("2026-03-01", "2026-03-01");
    expect(b).not.toBeNull();
    expect(b!.from).toBe(Date.parse("2026-03-01"));
    expect(b!.to).toBe(Date.parse("2026-03-02") - 1);
  });

  it("시작이 종료보다 늦으면 null", () => {
    expect(dateRangeBounds("2026-03-10", "2026-03-01")).toBeNull();
  });

  it("파싱할 수 없는 날짜는 null", () => {
    expect(dateRangeBounds("", "2026-03-01")).toBeNull();
    expect(dateRangeBounds("2026-03-01", "not-a-date")).toBeNull();
  });
});
