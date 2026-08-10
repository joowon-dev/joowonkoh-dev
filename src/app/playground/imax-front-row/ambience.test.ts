import { describe, expect, it } from "vitest";
import { flicker, gateWeave, idleSway, luminance, spillColor } from "./ambience";

const samples = Array.from({ length: 600 }, (_, i) => i * 0.031);

describe("게이트 위블", () => {
  it("범위를 벗어나지 않는다", () => {
    for (const t of samples) {
      const w = gateWeave(t);
      expect(Math.abs(w.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(w.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(w.roll)).toBeLessThanOrEqual(1);
    }
  });

  it("세로가 가로보다 크게 흔들린다", () => {
    const peak = (pick: (t: number) => number) => Math.max(...samples.map((t) => Math.abs(pick(t))));
    expect(peak((t) => gateWeave(t).y)).toBeGreaterThan(peak((t) => gateWeave(t).x));
  });

  it("프레임 사이에 튀지 않는다", () => {
    // 60fps 한 칸 사이 변화가 크면 흔들림이 아니라 지직거림으로 보인다
    for (let i = 1; i < samples.length; i++) {
      const a = gateWeave(i / 60);
      const b = gateWeave((i + 1) / 60);
      expect(Math.abs(b.y - a.y)).toBeLessThan(0.1);
    }
  });
});

describe("램프 밝기", () => {
  it("1 근처에서만 논다", () => {
    for (const t of samples) {
      expect(flicker(t)).toBeGreaterThan(0.97);
      expect(flicker(t)).toBeLessThan(1.03);
    }
  });

  it("평균은 1에 붙어 있다", () => {
    const mean = samples.reduce((s, t) => s + flicker(t), 0) / samples.length;
    expect(mean).toBeCloseTo(1, 2);
  });

  it("가만히 있지는 않는다", () => {
    const values = samples.map(flicker);
    expect(Math.max(...values) - Math.min(...values)).toBeGreaterThan(0.005);
  });
});

describe("스크린 스필", () => {
  it("밝은 화면일수록 벽이 밝아진다", () => {
    const dark = luminance(spillColor([0.05, 0.05, 0.05]));
    const bright = luminance(spillColor([0.9, 0.9, 0.9]));
    expect(bright).toBeGreaterThan(dark);
  });

  it("벽이 스크린보다 훨씬 어둡다", () => {
    // 흡음재라 빛을 거의 안 돌려준다. 이게 무너지면 상영관이 아니라 밝은 방이 된다
    const screen: [number, number, number] = [0.8, 0.8, 0.8];
    expect(luminance(spillColor(screen))).toBeLessThan(luminance(screen) * 0.25);
  });

  it("완전한 검은 화면에서도 0이 되진 않는다", () => {
    expect(luminance(spillColor([0, 0, 0]))).toBeGreaterThan(0);
  });

  it("화면 색조를 따라간다", () => {
    const red = spillColor([0.8, 0.1, 0.1]);
    expect(red[0]).toBeGreaterThan(red[1]);
    expect(red[0]).toBeGreaterThan(red[2]);
  });
});

describe("몸 흔들림", () => {
  it("눈에 띄지 않을 만큼만 움직인다", () => {
    for (const t of samples) {
      const s = idleSway(t);
      // 1° 미만
      expect(Math.abs(s.yaw)).toBeLessThan(0.018);
      expect(Math.abs(s.pitch)).toBeLessThan(0.018);
    }
  });

  it("멈춰 있지 않다", () => {
    // 주기가 30초쯤이라 일부러 길게 훑는다. 몇 초만 보면 정지한 것과 구별되지
    // 않는데, 그게 이 흔들림의 의도다
    const slow = Array.from({ length: 900 }, (_, i) => i * 0.1);
    const yaws = slow.map((t) => idleSway(t).yaw);
    expect(Math.max(...yaws) - Math.min(...yaws)).toBeGreaterThan(0.005);
  });
});
