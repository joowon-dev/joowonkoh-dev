import { describe, it, expect } from "vitest";
import { PERSPECTIVE_SCALE, computeCamera, projectPoint } from "./render";
import { type Board } from "./physics";

const board: Board = { width: 420, fallLine: 220 };

describe("computeCamera", () => {
  it("판 너비가 화면 안에 들어간다", () => {
    const vp = { w: 390, h: 780 };
    const cam = computeCamera(vp, board);
    const left = projectPoint(0, 0, cam).sx;
    const right = projectPoint(board.width, 0, cam).sx;
    expect(left).toBeGreaterThanOrEqual(0);
    expect(right).toBeLessThanOrEqual(vp.w);
  });

  it("화면이 넓어지면 배율도 커진다", () => {
    const small = computeCamera({ w: 390, h: 780 }, board);
    const large = computeCamera({ w: 900, h: 780 }, board);
    expect(large.scale).toBeGreaterThan(small.scale);
  });

  it("배율은 항상 양수다", () => {
    expect(computeCamera({ w: 100, h: 100 }, board).scale).toBeGreaterThan(0);
  });
});

describe("projectPoint", () => {
  const cam = computeCamera({ w: 390, h: 780 }, board);

  it("x가 커지면 화면 x도 커진다", () => {
    expect(projectPoint(200, 0, cam).sx).toBeGreaterThan(projectPoint(100, 0, cam).sx);
  });

  it("y가 커지면 화면 y도 커진다 (앞쪽이 아래)", () => {
    expect(projectPoint(0, 200, cam).sy).toBeGreaterThan(projectPoint(0, 100, cam).sy);
  });

  it("y축이 x축보다 압축된다", () => {
    const dx = projectPoint(100, 0, cam).sx - projectPoint(0, 0, cam).sx;
    const dy = projectPoint(0, 100, cam).sy - projectPoint(0, 0, cam).sy;
    expect(dy).toBeCloseTo(dx * PERSPECTIVE_SCALE, 5);
  });

  it("좌표는 항상 유한하다", () => {
    const p = projectPoint(0, 0, cam);
    expect(Number.isFinite(p.sx)).toBe(true);
    expect(Number.isFinite(p.sy)).toBe(true);
  });
});
