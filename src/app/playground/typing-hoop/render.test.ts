import { describe, expect, it } from "vitest";
import { buildFlight, flightAt, RIM_HEIGHT, type Outcome, type Vec3 } from "./flight";
import {
  CAM_Y,
  HORIZON,
  PALETTE,
  SCENE_H,
  SCENE_W,
  drawScene,
  floorPoint,
  project,
  type Scene,
} from "./render";

interface Op {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

/**
 * 캔버스 대신 사각형 목록을 받아 적는 가짜 컨텍스트.
 *
 * 픽셀을 실제로 칠하지 않고도 "무엇을 어디에 그렸는가"를 확인할 수 있다.
 * 렌더러가 쓰는 API가 fillRect 하나뿐이라 이게 가능하다.
 */
function recorder() {
  const ops: Op[] = [];
  const stack: [number, number][] = [];
  let tx = 0;
  let ty = 0;
  const ctx = {
    fillStyle: "#000000" as string | CanvasGradient | CanvasPattern,
    globalAlpha: 1,
    save() {
      stack.push([tx, ty]);
    },
    restore() {
      const s = stack.pop();
      if (s) [tx, ty] = s;
    },
    translate(x: number, y: number) {
      tx += x;
      ty += y;
    },
    fillRect(x: number, y: number, w: number, h: number) {
      ops.push({ x: x + tx, y: y + ty, w, h, color: String(ctx.fillStyle) });
    },
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, ops };
}

function scene(over: Partial<Scene> = {}): Scene {
  return {
    distanceM: 5,
    pose: { armLift: 0, holding: true, crouch: 0 },
    ball: null,
    swishAgeMs: null,
    shake: 0,
    spin: 0,
    ...over,
  };
}

function draw(s: Scene): Op[] {
  const { ctx, ops } = recorder();
  drawScene(ctx, s);
  return ops;
}

/** 이 색으로 칠해진 사각형들의 무게중심 */
function centroid(ops: Op[], color: string): { x: number; y: number; n: number } | null {
  const hits = ops.filter((o) => o.color === color);
  if (hits.length === 0) return null;
  let sx = 0;
  let sy = 0;
  let area = 0;
  for (const o of hits) {
    const a = Math.max(1, o.w) * Math.max(1, o.h);
    sx += (o.x + o.w / 2) * a;
    sy += (o.y + o.h / 2) * a;
    area += a;
  }
  return { x: sx / area, y: sy / area, n: hits.length };
}

const ALL: Outcome[] = ["clean", "frontRim", "backRim", "bank", "short", "long"];

describe("project", () => {
  it("멀수록 작아진다", () => {
    expect(project({ x: 0, y: 0, z: 10 }).scale).toBeLessThan(
      project({ x: 0, y: 0, z: 2 }).scale,
    );
  });

  it("카메라 높이에 있는 점은 수평선에 걸린다", () => {
    expect(project({ x: 0, y: CAM_Y, z: 6 }).y).toBeCloseTo(HORIZON, 6);
  });

  it("바닥은 멀어질수록 수평선에 다가간다", () => {
    const near = floorPoint(0, 1).y;
    const far = floorPoint(0, 30).y;
    expect(near).toBeGreaterThan(far);
    expect(far).toBeGreaterThan(HORIZON);
  });

  it("정면은 화면 한가운데다", () => {
    expect(project({ x: 0, y: 1, z: 5 }).x).toBeCloseTo(SCENE_W / 2, 6);
  });

  it("카메라가 림보다 높다 — 낮으면 골대 구멍이 안 보인다", () => {
    expect(CAM_Y).toBeGreaterThan(RIM_HEIGHT);
  });
});

describe("drawScene", () => {
  it("좌표에 NaN이 섞이지 않는다", () => {
    for (const d of [3, 5, 8.5]) {
      for (const o of ALL) {
        const f = buildFlight(o, d);
        const ops = draw(
          scene({ distanceM: d, ball: flightAt(f, f.totalMs / 2).pos, swishAgeMs: 20 }),
        );
        const bad = ops.filter(
          (p) => !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.w),
        );
        expect(bad).toEqual([]);
      }
    }
  });

  it("바닥과 벽이 화면을 다 덮는다", () => {
    const ops = draw(scene());
    const wall = ops.find((o) => o.color === PALETTE.wall)!;
    const floor = ops.find((o) => o.color === PALETTE.floor)!;
    expect(wall.y).toBe(0);
    expect(wall.h).toBe(HORIZON);
    expect(floor.y).toBe(HORIZON);
    expect(floor.y + floor.h).toBe(SCENE_H);
    expect(floor.w).toBe(SCENE_W);
  });

  it("공이 손에 있으면 선수 근처에만 공 색이 있다", () => {
    const c = centroid(draw(scene()), PALETTE.ball)!;
    expect(c).not.toBeNull();
    // 선수는 화면 아래쪽에 서 있다
    expect(c.y).toBeGreaterThan(HORIZON + 40);
  });

  it("던진 뒤에는 손의 공이 사라진다", () => {
    const held = centroid(draw(scene()), PALETTE.ball)!;
    const thrown = centroid(
      draw(scene({ pose: { armLift: 1, holding: false, crouch: 0 } })),
      PALETTE.ball,
    );
    expect(held.n).toBeGreaterThan(0);
    expect(thrown).toBeNull();
  });

  it("날아가는 공은 계산된 자리에 그려진다", () => {
    const f = buildFlight("clean", 5);
    for (const t of [0, f.arcs[0].ms * 0.4, f.arcs[0].ms * 0.85]) {
      const pos = flightAt(f, t).pos;
      const want = project(pos);
      const got = centroid(
        draw(scene({ ball: pos, pose: { armLift: 1, holding: false, crouch: 0 } })),
        PALETTE.ball,
      )!;
      expect(got).not.toBeNull();
      expect(got.x).toBeCloseTo(want.x, 0);
      expect(Math.abs(got.y - want.y)).toBeLessThan(3);
    }
  });

  it("날아가는 동안 공이 위로 올라갔다 내려온다", () => {
    const f = buildFlight("clean", 6);
    const ys = [0.1, 0.5, 1].map((u) => {
      const pos = flightAt(f, f.arcs[0].ms * u).pos;
      return centroid(
        draw(scene({ distanceM: 6, ball: pos, pose: { armLift: 1, holding: false, crouch: 0 } })),
        PALETTE.ball,
      )!.y;
    });
    // 화면 좌표는 아래로 갈수록 커진다. 올라가면 값이 줄어든다
    expect(ys[1]).toBeLessThan(ys[0]);
    expect(ys[2]).toBeGreaterThan(ys[1]);
  });

  it("어떤 슛이든 공이 화면 밖으로 사라지지 않는다", () => {
    // 카메라 상수를 건드리면 제일 먼저 깨지는 곳이다.
    // 공이 프레임 밖으로 나가면 플레이어는 결과를 눈으로 못 따라간다.
    for (const d of [3, 5.5, 8.5]) {
      for (const o of ALL) {
        const f = buildFlight(o, d);
        for (let t = 0; t <= f.totalMs; t += 40) {
          const p: Vec3 = flightAt(f, t).pos;
          const s = project(p);
          expect(s.x).toBeGreaterThan(0);
          expect(s.x).toBeLessThan(SCENE_W);
          expect(s.y).toBeGreaterThan(0);
          expect(s.y).toBeLessThan(SCENE_H);
        }
      }
    }
  });

  it("골대는 선수보다 위에, 수평선 근처에 있다", () => {
    const rim = project({ x: 0, y: RIM_HEIGHT, z: 5 });
    const feet = floorPoint(0, 0);
    expect(rim.y).toBeLessThan(feet.y);
    expect(Math.abs(rim.y - HORIZON)).toBeLessThan(40);
  });

  it("먼 골대가 가까운 골대보다 작게 그려진다", () => {
    const near = draw(scene({ distanceM: 3.2 })).filter((o) => o.color === PALETTE.board);
    const far = draw(scene({ distanceM: 8.5 })).filter((o) => o.color === PALETTE.board);
    expect(far[0].w).toBeLessThan(near[0].w);
  });

  it("흔들림은 정수 픽셀이라 도트가 어긋나지 않는다", () => {
    const ops = draw(scene({ shake: 0.7 }));
    const wall = ops.find((o) => o.color === PALETTE.wall)!;
    expect(Number.isInteger(wall.x)).toBe(true);
    expect(Number.isInteger(wall.y)).toBe(true);
  });

  it("모든 사각형이 정수 좌표에 정수 크기로 찍힌다", () => {
    const f = buildFlight("bank", 7);
    const ops = draw(
      scene({ distanceM: 7, ball: flightAt(f, 900).pos, swishAgeMs: 60, shake: 0.4 }),
    );
    const fractional = ops.filter(
      (o) =>
        !Number.isInteger(o.x) || !Number.isInteger(o.y) || !Number.isInteger(o.w) || !Number.isInteger(o.h),
    );
    expect(fractional).toEqual([]);
  });

  it("팔을 올리면 손이 위로 간다", () => {
    const down = centroid(draw(scene({ pose: { armLift: 0, holding: true, crouch: 0 } })), PALETTE.ball)!;
    const up = centroid(draw(scene({ pose: { armLift: 1, holding: true, crouch: 0 } })), PALETTE.ball)!;
    expect(up.y).toBeLessThan(down.y);
  });
});
