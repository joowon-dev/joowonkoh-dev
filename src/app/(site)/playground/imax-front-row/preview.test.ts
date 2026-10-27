import { describe, expect, it } from "vitest";
import { fitContain } from "./preview";

describe("미리보기 맞춤", () => {
  it("원본보다 넓은 상자면 위아래가 아니라 좌우가 남는다", () => {
    const fit = fitContain(400, 400, 1000, 500);
    expect(fit.height).toBeCloseTo(500);
    expect(fit.width).toBeCloseTo(500);
    expect(fit.x).toBeCloseTo(250);
    expect(fit.y).toBeCloseTo(0);
  });

  it("원본보다 좁은 상자면 위아래가 남는다", () => {
    const fit = fitContain(1600, 400, 800, 800);
    expect(fit.width).toBeCloseTo(800);
    expect(fit.height).toBeCloseTo(200);
    expect(fit.x).toBeCloseTo(0);
    expect(fit.y).toBeCloseTo(300);
  });

  it("비율이 같으면 딱 채운다", () => {
    const fit = fitContain(1280, 720, 640, 360);
    expect(fit).toEqual({ x: 0, y: 0, width: 640, height: 360 });
  });

  it("어떤 경우에도 상자를 넘지 않는다", () => {
    const sizes = [
      [1280, 720],
      [720, 1280],
      [1000, 1000],
      [3000, 200],
    ];
    for (const [w, h] of sizes) {
      for (const [dw, dh] of [
        [800, 600],
        [400, 900],
        [1920, 1080],
      ]) {
        const fit = fitContain(w, h, dw, dh);
        expect(fit.width).toBeLessThanOrEqual(dw + 1e-9);
        expect(fit.height).toBeLessThanOrEqual(dh + 1e-9);
        expect(fit.x).toBeGreaterThanOrEqual(-1e-9);
        expect(fit.y).toBeGreaterThanOrEqual(-1e-9);
      }
    }
  });

  it("원본 비율을 지킨다", () => {
    const fit = fitContain(1600, 900, 500, 500);
    expect(fit.width / fit.height).toBeCloseTo(1600 / 900, 6);
  });

  it("가운데에 놓는다", () => {
    const fit = fitContain(100, 50, 640, 480);
    expect(fit.x + fit.width / 2).toBeCloseTo(320);
    expect(fit.y + fit.height / 2).toBeCloseTo(240);
  });

  it("아직 크기를 모를 때 NaN을 내지 않는다", () => {
    const cases: [number, number, number, number][] = [
      [0, 0, 640, 480],
      [1280, 720, 0, 0],
      [-1, 100, 640, 480],
    ];
    for (const [sw, sh, dw, dh] of cases) {
      expect(fitContain(sw, sh, dw, dh)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    }
  });
});
