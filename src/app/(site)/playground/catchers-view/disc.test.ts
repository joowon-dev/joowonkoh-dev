import { describe, expect, it } from "vitest";
import { DISC_SEGMENTS, RIM_ALPHA, buildDisc } from "./disc";
import { catcherCamera, makeCamera, project } from "./camera";
import { ZONE } from "./pitchers";
import { BALL_RADIUS, type Vec3 } from "./flight";

const AHEAD: Vec3 = { x: 0, y: 0, z: 10 };

function straightCamera(aspect = 1) {
  return makeCamera({ x: 0, y: 0, z: 0 }, AHEAD, aspect);
}

/** 스트립의 짝수 번째가 중심, 홀수 번째가 테두리다 */
function rim(disc: NonNullable<ReturnType<typeof buildDisc>>, i: number) {
  return { x: disc.positions[i * 4 + 2], y: disc.positions[i * 4 + 3] };
}

describe("buildDisc", () => {
  it("중심과 테두리를 번갈아 낸다", () => {
    const disc = buildDisc(straightCamera(), AHEAD, 0.1)!;
    expect(disc.count).toBe((DISC_SEGMENTS + 1) * 2);
    expect(disc.positions).toHaveLength(disc.count * 2);
    expect(disc.alphas).toHaveLength(disc.count);

    for (let i = 0; i <= DISC_SEGMENTS; i++) {
      expect(disc.positions[i * 4]).toBeCloseTo(0, 9);
      expect(disc.positions[i * 4 + 1]).toBeCloseTo(0, 9);
    }
  });

  it("가운데가 진하고 테두리가 옅다", () => {
    const disc = buildDisc(straightCamera(), AHEAD, 0.1)!;
    for (let i = 0; i <= DISC_SEGMENTS; i++) {
      expect(disc.alphas[i * 2]).toBe(1);
      // Float32Array라 0.45가 딱 떨어지지 않는다
      expect(disc.alphas[i * 2 + 1]).toBeCloseTo(RIM_ALPHA, 6);
    }
  });

  it("테두리가 닫힌다 — 마지막 점이 첫 점으로 돌아온다", () => {
    const disc = buildDisc(straightCamera(), AHEAD, 0.1)!;
    const first = rim(disc, 0);
    const last = rim(disc, DISC_SEGMENTS);
    expect(last.x).toBeCloseTo(first.x, 9);
    expect(last.y).toBeCloseTo(first.y, 9);
  });

  it("화면비가 1이면 진짜 원이다", () => {
    const disc = buildDisc(straightCamera(1), AHEAD, 0.2)!;
    const middle = project(straightCamera(1), AHEAD)!;
    const radii = [];
    for (let i = 0; i < DISC_SEGMENTS; i++) {
      const p = rim(disc, i);
      radii.push(Math.hypot(p.x - middle.x, p.y - middle.y));
    }
    for (const r of radii) expect(r).toBeCloseTo(radii[0], 8);
  });

  it("넓은 화면에서는 가로로 눌러 원 모양을 지킨다", () => {
    // NDC는 가로로 늘어난 좌표계라, 가로 반지름을 화면비로 나눠야 화면에서 원이다
    const disc = buildDisc(straightCamera(2), AHEAD, 0.2)!;
    const right = rim(disc, 0);
    const top = rim(disc, DISC_SEGMENTS / 4);
    expect(Math.abs(right.x)).toBeCloseTo(Math.abs(top.y) / 2, 6);
  });

  it("멀수록 작다", () => {
    const camera = straightCamera();
    const near = rim(buildDisc(camera, { x: 0, y: 0, z: 5 }, 0.1)!, DISC_SEGMENTS / 4);
    const far = rim(buildDisc(camera, { x: 0, y: 0, z: 20 }, 0.1)!, DISC_SEGMENTS / 4);
    expect(near.y).toBeGreaterThan(far.y * 3);
  });

  it("카메라 뒤에 있으면 아무것도 안 준다", () => {
    expect(buildDisc(straightCamera(), { x: 0, y: 0, z: -3 }, 0.1)).toBeNull();
  });

  it("눈 안쪽으로 들어오면 그리지 않는다", () => {
    // 각반지름이 무한대라 화면을 다 덮는다. 그런 원판은 뜻이 없다
    expect(buildDisc(straightCamera(), { x: 0, y: 0, z: 0.01 }, 0.1)).toBeNull();
  });
});

describe("스트라이크존 위의 통과 지점", () => {
  it("존 한가운데로 들어온 공은 화면 한가운데 근처에 찍힌다", () => {
    const camera = catcherCamera(16 / 9);
    const middle = (ZONE.bottom + ZONE.top) / 2;
    const disc = buildDisc(camera, { x: 0, y: middle, z: 0 }, BALL_RADIUS)!;
    expect(disc.positions[0]).toBeCloseTo(0, 6);
  });

  it("존 좌우로 들어온 공이 좌우로 갈린다", () => {
    const camera = catcherCamera(16 / 9);
    const y = (ZONE.bottom + ZONE.top) / 2;
    const left = buildDisc(camera, { x: -ZONE.halfWidth, y, z: 0 }, BALL_RADIUS)!;
    const right = buildDisc(camera, { x: ZONE.halfWidth, y, z: 0 }, BALL_RADIUS)!;
    expect(left.positions[0]).toBeLessThan(0);
    expect(right.positions[0]).toBeGreaterThan(0);
  });

  it("존 안에 찍힌 원판은 화면 밖으로 안 나간다", () => {
    const camera = catcherCamera(16 / 9);
    for (const x of [-ZONE.halfWidth, 0, ZONE.halfWidth]) {
      for (const y of [ZONE.bottom, ZONE.top]) {
        const disc = buildDisc(camera, { x, y, z: 0 }, BALL_RADIUS)!;
        for (let i = 0; i <= DISC_SEGMENTS; i++) {
          const p = rim(disc, i);
          expect(Math.abs(p.x)).toBeLessThan(1);
          expect(Math.abs(p.y)).toBeLessThan(1);
        }
      }
    }
  });
});
