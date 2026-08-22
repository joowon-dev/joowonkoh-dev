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

  // elapsedMs가 maxWaitMs와 정확히 같은 경계. `<`를 `<=`로 바꾸는 돌연변이는
  // 여기서 true를 돌려주고(한 번 더 기다리고), 원본은 false를 돌려준다 — 최대
  // 시간을 "넘겨야" 포기하는 게 아니라 "도달하면" 포기해야 실제로 3초를 넘기지
  // 않는다.
  it("경과 시간이 최대 시간과 정확히 같으면 포기한다", () => {
    expect(shouldKeepWaitingForTiles(4, 3_000, 3_000)).toBe(false);
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

  // durationSec이 카드 몫(3초)과 정확히 같은 경계. `<=`를 `<`로 바꾸는 돌연변이는
  // durationSec === 3일 때 방어 분기를 건너뛰고 정상 램프 계산으로 빠지는데,
  // 그 경우 startRatio = 1 - 3/3 = 0이라 나눗셈 자체는 안 깨지지만 "3초짜리
  // 영상은 시작하자마자 완전히 덮는다"는 계약과는 다른 값(ratio 그대로)을
  // 돌려준다.
  it("영상 길이가 카드 몫과 정확히 같으면 시작하자마자 완전히 덮는다", () => {
    expect(summaryOpacity(0.01, 3)).toBe(1);
    expect(summaryOpacity(0, 3)).toBe(0);
  });

  // ratio가 1을 넘는 입력(재생 루프가 클램프하기 전에 부르거나, 부동소수점
  // 오차로 아주 살짝 넘긴 경우)에도 Math.min(1, …) 클램프가 없으면 opacity가
  // 1을 넘는다 — drawSummaryCard의 globalAlpha 계약(1 = 완전히 덮는다)을 넘어서는
  // 값은 캔버스 API가 조용히 잘라내긴 하지만, 그 잘림에 기대면 안 된다.
  it("진행률이 1을 넘어도 1로 잘린다", () => {
    expect(summaryOpacity(1.5, durationSec)).toBe(1);
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
