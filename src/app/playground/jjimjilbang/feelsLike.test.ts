import { describe, it, expect } from "vitest";
import { feelsLike, summerFeelsLike, winterFeelsLike, wetBulb } from "./feelsLike";

describe("wetBulb", () => {
  /*
   * 습도가 100%면 습구온도와 기온이 같아진다 — 더 이상 증발할 여지가 없어서다.
   * 식을 잘못 옮겼는지 알아보는 데 이만한 기준이 없다.
   */
  it("습도 100%에서는 기온과 거의 같다", () => {
    for (const ta of [0, 15, 25, 35]) {
      expect(wetBulb(ta, 100)).toBeCloseTo(ta, 0);
    }
  });

  it("습도가 낮을수록 기온보다 많이 내려간다", () => {
    expect(wetBulb(30, 20)).toBeLessThan(wetBulb(30, 60));
    expect(wetBulb(30, 60)).toBeLessThan(wetBulb(30, 90));
  });
});

describe("summerFeelsLike", () => {
  it("같은 기온이면 습할수록 덥게 느낀다", () => {
    expect(summerFeelsLike(30, 30)).toBeLessThan(summerFeelsLike(30, 80));
  });

  it("습한 여름날은 기온보다 높게 나온다", () => {
    expect(summerFeelsLike(31, 78)).toBeGreaterThan(31);
  });
});

describe("winterFeelsLike", () => {
  it("바람이 셀수록 춥게 느낀다", () => {
    expect(winterFeelsLike(0, 10)).toBeLessThan(winterFeelsLike(0, 2));
  });

  it("추운 날 바람이 불면 기온보다 낮게 나온다", () => {
    expect(winterFeelsLike(-5, 5)).toBeLessThan(-5);
  });
});

describe("feelsLike", () => {
  it("기온 10도 이하에 바람이 1.3m/s 이상이면 겨울 식을 쓴다", () => {
    expect(feelsLike(0, 50, 5)).toBe(winterFeelsLike(0, 5));
  });

  it("추워도 바람이 약하면 기온을 그대로 쓴다", () => {
    // 바람이 없는데 냉각식을 돌리면 기온보다 높은 체감온도가 나온다
    expect(feelsLike(0, 50, 1.2)).toBe(0);
  });

  it("기온 20도 이상이면 여름 식을 쓴다", () => {
    expect(feelsLike(31, 78, 2)).toBe(summerFeelsLike(31, 78));
  });

  it("10~20도 사이는 기온을 그대로 쓴다", () => {
    expect(feelsLike(15, 60, 3)).toBe(15);
    expect(feelsLike(19.9, 60, 0)).toBe(19.9);
  });

  it("경계값에서 어느 쪽 식을 쓰는지 분명하다", () => {
    expect(feelsLike(10, 50, 1.3)).toBe(winterFeelsLike(10, 1.3));
    expect(feelsLike(20, 50, 0)).toBe(summerFeelsLike(20, 50));
  });
});
