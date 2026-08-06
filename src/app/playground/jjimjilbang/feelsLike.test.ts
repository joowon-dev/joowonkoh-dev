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
  /*
   * 이 검사가 원래 있었어야 했다. 기온을 조금 움직였을 뿐인데 체감온도가
   * 껑충 뛰면 방이 바뀐다. 실제로 10도 경계에서 0.2도 차이에 2.6도가
   * 뛰어서 얼음방과 수면실이 갈렸다.
   */
  it("기온을 훑어도 체감온도가 튀지 않는다", () => {
    for (const humidity of [30, 60, 90]) {
      for (const wind of [0, 1.2, 1.3, 5, 12]) {
        let previous = feelsLike(-15, humidity, wind);
        for (let t = -14.9; t <= 40; t += 0.1) {
          const current = feelsLike(t, humidity, wind);
          expect(
            Math.abs(current - previous),
            `기온 ${t.toFixed(1)}도, 습도 ${humidity}%, 바람 ${wind}m/s에서 튐`,
          ).toBeLessThan(0.3);
          previous = current;
        }
      }
    }
  });

  it("풍속을 훑어도 체감온도가 튀지 않는다", () => {
    for (const temp of [0, 5, 10, 15]) {
      let previous = feelsLike(temp, 60, 0);
      for (let w = 0.1; w <= 20; w += 0.1) {
        const current = feelsLike(temp, 60, w);
        expect(Math.abs(current - previous), `기온 ${temp}도, 풍속 ${w.toFixed(1)}에서 튐`).toBeLessThan(0.3);
        previous = current;
      }
    }
  });

  it("양 끝에서는 각각의 기상청 식과 정확히 만난다", () => {
    expect(feelsLike(10, 60, 5)).toBe(winterFeelsLike(10, 5));
    expect(feelsLike(25, 60, 2)).toBe(summerFeelsLike(25, 60));
  });

  it("바람은 시원하게만 만든다 — 기온보다 높아지지 않는다", () => {
    for (const wind of [0, 0.5, 1, 1.2, 1.3, 3]) {
      expect(feelsLike(5, 60, wind)).toBeLessThanOrEqual(5);
      expect(feelsLike(0, 60, wind)).toBeLessThanOrEqual(0);
    }
  });

  it("추운 날 바람이 세면 더 춥게 느낀다", () => {
    expect(feelsLike(0, 60, 10)).toBeLessThan(feelsLike(0, 60, 2));
  });

  it("더운 날 습하면 더 덥게 느낀다", () => {
    expect(feelsLike(33, 40, 2)).toBeLessThan(feelsLike(33, 80, 2));
  });
});
