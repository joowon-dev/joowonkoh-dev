import { describe, it, expect } from "vitest";
import { toGrid } from "./grid";

/*
 * 기준값은 기상청이 배포하는 격자 목록에 있는 것들이다. 변환식을 건드리면
 * 여기서 먼저 깨진다.
 */
describe("toGrid", () => {
  it("서울시청은 (60, 127)이다", () => {
    expect(toGrid(37.5665, 126.978)).toEqual({ nx: 60, ny: 127 });
  });

  it("부산시청은 (98, 76)이다", () => {
    expect(toGrid(35.1796, 129.0756)).toEqual({ nx: 98, ny: 76 });
  });

  it("제주시청은 (53, 38)이다", () => {
    expect(toGrid(33.4996, 126.5312)).toEqual({ nx: 53, ny: 38 });
  });

  it("격자는 항상 정수다", () => {
    for (const [lat, lon] of [
      [37.4563, 126.7052],
      [35.8714, 128.6014],
      [36.3504, 127.3845],
    ]) {
      const { nx, ny } = toGrid(lat, lon);
      expect(Number.isInteger(nx)).toBe(true);
      expect(Number.isInteger(ny)).toBe(true);
    }
  });

  it("가까운 두 지점은 같거나 이웃한 격자에 떨어진다", () => {
    const a = toGrid(37.5665, 126.978);
    const b = toGrid(37.57, 126.982);
    expect(Math.abs(a.nx - b.nx)).toBeLessThanOrEqual(1);
    expect(Math.abs(a.ny - b.ny)).toBeLessThanOrEqual(1);
  });
});
