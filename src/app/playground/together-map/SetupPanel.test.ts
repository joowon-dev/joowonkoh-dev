import { describe, expect, it } from "vitest";
import { clampToRange } from "./SetupPanel";

describe("clampToRange", () => {
  it("빈 문자열은 0이 아니라 최소값으로 떨어진다", () => {
    // Number("") === 0 을 그대로 쓰면 지우는 도중에 판정 거리가 0이 되어
    // 항상 0건이 나오는 등 도구가 조용히 망가진다.
    expect(clampToRange("", 10, 2000)).toBe(10);
  });

  it("숫자가 아닌 입력도 최소값으로 떨어진다", () => {
    expect(clampToRange("abc", 50, 5000)).toBe(50);
  });

  it("최소값보다 작은 값은 최소값으로 올라간다", () => {
    expect(clampToRange("0", 10, 2000)).toBe(10);
  });

  it("최대값보다 큰 값은 최대값으로 내려간다", () => {
    expect(clampToRange("9999", 50, 5000)).toBe(5000);
  });

  it("범위 안의 값은 그대로 통과한다", () => {
    expect(clampToRange("150", 10, 2000)).toBe(150);
  });
});
