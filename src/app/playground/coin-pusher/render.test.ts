import { describe, it, expect } from "vitest";
import { PERSPECTIVE_SCALE, computeCamera, projectPoint } from "./render";
import { PUSHER_BACK_Y, type Board } from "./physics";

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

  it("키 큰 뷰포트(390x780)에선 너비가 제약이다", () => {
    const vp = { w: 390, h: 780 };
    const cam = computeCamera(vp, board);
    // 높이 제약이 아님을 확인해 너비 제약임을 증명
    const depth = (board.fallLine - PUSHER_BACK_Y) * PERSPECTIVE_SCALE;
    const widthFit = (vp.w - 32) / board.width; // SIDE_PADDING = 16
    const heightFit = (vp.h - 48) / depth; // VERTICAL_PADDING = 24
    expect(heightFit).toBeGreaterThan(widthFit); // 높이가 더 여유로움
    expect(cam.scale).toBeCloseTo(widthFit, 5); // 배율은 너비 제약값
  });

  it("짧고 넓은 뷰포트(900x160)에선 높이가 제약이다", () => {
    const vp = { w: 900, h: 160 };
    const cam = computeCamera(vp, board);
    // 판의 전체 높이(푸셔 뒤에서 낙하선까지)가 화면에 들어가야 한다
    const top = projectPoint(0, PUSHER_BACK_Y, cam).sy;
    const bottom = projectPoint(0, board.fallLine, cam).sy;
    expect(top).toBeGreaterThanOrEqual(0);
    expect(bottom).toBeLessThanOrEqual(vp.h);
  });

  it("높이가 제약일 때도 판이 가운데 정렬된다", () => {
    const vp = { w: 900, h: 160 };
    const cam = computeCamera(vp, board);
    // 높이 제약 뷰포트에서 offsetX는 진정한 가운데 정렬이어야 한다.
    // 구 코드였다면 offsetX = SIDE_PADDING(16)이었을 테니 좌우 여백이 비대칭이었을 것.
    const leftGap = projectPoint(0, 0, cam).sx;
    const rightGap = vp.w - projectPoint(board.width, 0, cam).sx;
    expect(leftGap).toBeCloseTo(rightGap, 1); // 대칭
    expect(leftGap).toBeGreaterThan(16); // SIDE_PADDING보다 큼 (구 코드와 다름)
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
