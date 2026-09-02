import { describe, expect, it } from "vitest";
import { makeCamera } from "./camera";
import type { Vec3 } from "./flight";
import { buildRibbons, rectangleLoop } from "./ribbon";

const camera = makeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 }, 1);

/** 카메라 정면으로 멀어지며 위로 올라가는 선 */
const straight: Vec3[] = [
  { x: 0, y: -0.5, z: 12 },
  { x: 0, y: 0, z: 8 },
  { x: 0, y: 0.5, z: 4 },
];

describe("buildRibbons", () => {
  it("점마다 정점 두 개를 만든다", () => {
    const [ribbon] = buildRibbons(camera, straight, { width: 0.01 });
    expect(ribbon.count).toBe(6);
    expect(ribbon.positions).toHaveLength(12);
    expect(ribbon.alphas).toHaveLength(6);
  });

  it("두 정점이 중심선을 사이에 두고 마주 본다", () => {
    const [ribbon] = buildRibbons(camera, straight, { width: 0.02 });
    for (let i = 0; i < 3; i++) {
      const ax = ribbon.positions[i * 4];
      const ay = ribbon.positions[i * 4 + 1];
      const bx = ribbon.positions[i * 4 + 2];
      const by = ribbon.positions[i * 4 + 3];
      // 폭이 0.02면 두 정점 사이가 0.04다
      expect(Math.hypot(ax - bx, ay - by)).toBeCloseTo(0.04, 6);
    }
  });

  it("카메라 뒤로 넘어가면 거기서 끊는다", () => {
    // 안 끊으면 화면을 가로지르는 엉뚱한 선이 하나 생긴다
    const crossing: Vec3[] = [
      { x: 0, y: 0, z: 10 },
      { x: 0, y: 0.2, z: 6 },
      { x: 0, y: 0.4, z: -6 }, // 뒤
      { x: 0, y: 0.6, z: -8 }, // 뒤
      { x: 0.2, y: 0, z: 6 },
      { x: 0.2, y: 0, z: 3 },
    ];
    const ribbons = buildRibbons(camera, crossing, { width: 0.01 });
    expect(ribbons).toHaveLength(2);
    expect(ribbons[0].count).toBe(4);
    expect(ribbons[1].count).toBe(4);
  });

  it("점 하나만 남는 조각은 버린다", () => {
    const lonely: Vec3[] = [
      { x: 0, y: 0, z: 8 },
      { x: 0, y: 0, z: -8 },
      { x: 0, y: 0, z: 6 },
    ];
    expect(buildRibbons(camera, lonely, { width: 0.01 })).toHaveLength(0);
  });

  it("전부 카메라 뒤면 아무것도 안 만든다", () => {
    const behind: Vec3[] = [
      { x: 0, y: 0, z: -3 },
      { x: 0, y: 0, z: -6 },
    ];
    expect(buildRibbons(camera, behind, { width: 0.01 })).toHaveLength(0);
  });

  it("화면이 넓어져도 띠 굵기가 눈에 같다", () => {
    // 화면 좌표의 x는 화면비만큼 눌려 있으므로 그만큼 되돌려야 한다
    const wide = makeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 }, 2);
    const horizontal: Vec3[] = [
      { x: -1, y: 0, z: 8 },
      { x: 1, y: 0, z: 8 },
    ];
    const [square] = buildRibbons(camera, horizontal, { width: 0.03 });
    const [stretched] = buildRibbons(wide, horizontal, { width: 0.03 });

    // 가로로 흐르는 선이므로 굵기는 세로로 붙는다 — 화면비와 무관해야 한다
    const thickness = (r: typeof square) =>
      Math.abs(r.positions[1] - r.positions[3]);
    expect(thickness(stretched)).toBeCloseTo(thickness(square), 6);
  });

  it("fade로 끝을 옅게 만들 수 있다", () => {
    const [ribbon] = buildRibbons(camera, straight, {
      width: 0.01,
      fade: (progress) => progress,
    });
    expect(ribbon.alphas[0]).toBeCloseTo(0, 6);
    expect(ribbon.alphas[1]).toBeCloseTo(0, 6);
    expect(ribbon.alphas.at(-1)).toBeCloseTo(1, 6);
  });

  it("점이 겹쳐 있어도 터지지 않는다", () => {
    const stuck: Vec3[] = [
      { x: 0, y: 0, z: 8 },
      { x: 0, y: 0, z: 8 },
      { x: 0, y: 0, z: 8 },
    ];
    const [ribbon] = buildRibbons(camera, stuck, { width: 0.01 });
    for (const value of ribbon.positions) expect(Number.isFinite(value)).toBe(true);
  });
});

describe("rectangleLoop", () => {
  it("시작점으로 돌아와 닫힌다", () => {
    const loop = rectangleLoop(-1, 1, 0, 2, 0);
    expect(loop).toHaveLength(5);
    expect(loop[0]).toEqual(loop[4]);
  });

  it("네 귀퉁이를 한 바퀴 돈다", () => {
    const loop = rectangleLoop(-0.216, 0.216, 0.5, 1.1, 0);
    expect(loop.map((p) => [p.x, p.y])).toEqual([
      [-0.216, 0.5],
      [0.216, 0.5],
      [0.216, 1.1],
      [-0.216, 1.1],
      [-0.216, 0.5],
    ]);
    expect(loop.every((p) => p.z === 0)).toBe(true);
  });
});
