import { describe, it, expect } from "vitest";
import { launch, step, isLanded, distanceMeters, GROUND_Y } from "./physics";

describe("launch", () => {
  it("power와 angle로 초기 속도를 만든다", () => {
    const s = launch({ angle: Math.PI / 4, power: 1 });
    expect(s.x).toBe(0);
    expect(s.y).toBeGreaterThanOrEqual(GROUND_Y);
    expect(s.vx).toBeGreaterThan(0);
    expect(s.vy).toBeGreaterThan(0);
  });
});

describe("step", () => {
  it("중력으로 vy가 감소한다", () => {
    const s0 = launch({ angle: Math.PI / 4, power: 1 });
    const s1 = step(s0, 0, 0.016);
    expect(s1.vy).toBeLessThan(s0.vy);
    expect(s1.x).toBeGreaterThan(s0.x);
  });

  it("바람은 vx를 증가시킨다", () => {
    const s0 = launch({ angle: Math.PI / 4, power: 1 });
    const noWind = step(s0, 0, 0.016);
    const withWind = step(s0, 1, 0.016);
    expect(withWind.vx).toBeGreaterThan(noWind.vx);
  });
});

describe("isLanded / distanceMeters", () => {
  it("지면 아래로 내려가면 착지", () => {
    expect(isLanded({ x: 100, y: -1, vx: 5, vy: -5 })).toBe(true);
  });
  it("공중이면 착지 아님", () => {
    expect(isLanded({ x: 100, y: 50, vx: 5, vy: 1 })).toBe(false);
  });
  it("distanceMeters는 정수 m", () => {
    expect(distanceMeters({ x: 200, y: 0, vx: 0, vy: 0 })).toBe(10);
  });
});
