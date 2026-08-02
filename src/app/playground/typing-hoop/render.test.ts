import { describe, expect, it } from "vitest";
import { BALL_RADIUS, buildFlight, flightAt, RIM_HEIGHT, type Outcome, type Vec3 } from "./flight";
import {
  CAM_Y,
  CAM_Z,
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

/** 이 색들로 칠해진 사각형 전체를 감싸는 상자 */
function bounds(
  ops: Op[],
  colors: string[],
): { x0: number; y0: number; x1: number; y1: number } | null {
  const hits = ops.filter((o) => colors.includes(o.color));
  if (hits.length === 0) return null;
  return {
    x0: Math.min(...hits.map((o) => o.x)),
    y0: Math.min(...hits.map((o) => o.y)),
    x1: Math.max(...hits.map((o) => o.x + o.w)),
    y1: Math.max(...hits.map((o) => o.y + o.h)),
  };
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

  it("카메라가 던지는 사람 눈높이에 있다 — 1인칭이라 림보다 낮다", () => {
    expect(CAM_Y).toBeLessThan(RIM_HEIGHT);
    expect(CAM_Y).toBeGreaterThan(1.4);
    // 공 바로 뒤다. 여기서 멀어지면 다시 3인칭이 된다
    expect(Math.abs(CAM_Z)).toBeLessThan(1);
  });

  it("올려다보므로 림이 수평선 위에 온다", () => {
    for (const d of [3.2, 5.5, 8.5]) {
      expect(project({ x: 0, y: RIM_HEIGHT, z: d }).y).toBeLessThan(HORIZON);
    }
  });

  it("가까울수록 림을 더 가파르게 올려다본다", () => {
    // 이 각도 차이가 링 타원의 납작한 정도로 나타나 거리감을 만든다
    const angle = (d: number) => Math.atan2(RIM_HEIGHT - CAM_Y, d - CAM_Z);
    expect(angle(3.2)).toBeGreaterThan(angle(8));
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

  it("들고 있는 공은 화면 아래쪽 한가운데, 내 손 안에 있다", () => {
    const c = centroid(draw(scene()), PALETTE.ball)!;
    expect(c).not.toBeNull();
    expect(c.y).toBeGreaterThan(SCENE_H * 0.6);
    expect(Math.abs(c.x - SCENE_W / 2)).toBeLessThan(6);
  });

  it("손이 화면 아래 가장자리까지 이어진다 — 허공에 뜬 손이 아니다", () => {
    const skin = draw(scene()).filter((o) => o.color === PALETTE.skin);
    expect(skin.length).toBeGreaterThan(0);
    expect(Math.max(...skin.map((o) => o.y + o.h))).toBeGreaterThanOrEqual(SCENE_H);
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

  it("날아가는 공은 계산된 자리에 계산된 크기로 그려진다", () => {
    const f = buildFlight("clean", 5);
    for (const t of [0, f.arcs[0].ms * 0.4, f.arcs[0].ms * 0.85]) {
      const pos = flightAt(f, t).pos;
      const want = project(pos);
      const wantR = BALL_RADIUS * want.scale;
      // 공은 어두운 원 위에 밝은 원을 살짝 어긋나게 얹어 그린다. 그래서 밝은
      // 부분만 보면 중심이 밀린다 — 두 색을 합친 테두리 상자로 재야 맞다.
      const box = bounds(
        draw(scene({ ball: pos, pose: { armLift: 1, holding: false, crouch: 0 } })),
        [PALETTE.ball, PALETTE.ballDark],
      )!;
      expect(box).not.toBeNull();
      expect(Math.abs((box.x0 + box.x1) / 2 - want.x)).toBeLessThan(2);
      expect(Math.abs((box.y0 + box.y1) / 2 - want.y)).toBeLessThan(2);
      expect(box.x1 - box.x0).toBeCloseTo(wantR * 2, -0.5);
    }
  });

  it("날아가는 동안 공이 화면에서 솟았다 내려온다", () => {
    // 1인칭이라 화면상 정점은 실제 궤적의 절반 지점이 아니다. 공이 카메라에서
    // 멀어지며 작아지는 만큼 빨리 내려오기 때문에, 정점이 훨씬 앞당겨진다.
    // 그래서 특정 지점을 콕 집지 않고 "가운데 어딘가에서 가장 높다"만 본다.
    const f = buildFlight("clean", 6);
    const ys = [0, 0.15, 0.3, 0.5, 0.75, 1].map(
      (u) =>
        centroid(
          draw(
            scene({
              distanceM: 6,
              ball: flightAt(f, f.arcs[0].ms * u).pos,
              pose: { armLift: 1, holding: false, crouch: 0 },
            }),
          ),
          PALETTE.ball,
        )!.y,
    );
    // 화면 좌표는 아래로 갈수록 커진다. 솟는다는 건 값이 작아진다는 뜻이다
    const top = Math.min(...ys);
    expect(top).toBeLessThan(ys[0]);
    expect(top).toBeLessThan(ys[ys.length - 1]);
  });

  it("어떤 슛이든 공이 화면 밖으로 사라지지 않는다", () => {
    // 1인칭에서 제일 깨지기 쉬운 곳이다. 카메라가 공에 붙어 있어서 화각이나
    // 아치를 조금만 건드려도 던진 공이 곧장 화면 위로 빠져나간다. 실제로
    // "너무 셌어요"의 아치를 3인칭 때 값 그대로 뒀더니 근거리에서 사라졌다.
    for (const d of [3, 3.2, 5.5, 8.5]) {
      for (const o of ALL) {
        const f = buildFlight(o, d);
        for (let t = 0; t <= f.totalMs; t += 20) {
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

  it("들어가는 슛은 림을 지나는 순간이 화면 안에 보인다", () => {
    for (const d of [3.2, 5.5, 8.5]) {
      for (const o of ["clean", "frontRim", "backRim", "bank"] as Outcome[]) {
        const f = buildFlight(o, d);
        const s = project(flightAt(f, f.swishAtMs!).pos);
        expect(s.y).toBeGreaterThan(0);
        expect(s.y).toBeLessThan(SCENE_H);
      }
    }
  });

  it("골대가 수평선 위, 들고 있는 공보다 위에 있다", () => {
    const rim = project({ x: 0, y: RIM_HEIGHT, z: 5 });
    expect(rim.y).toBeLessThan(HORIZON);
    expect(rim.y).toBeLessThan(centroid(draw(scene()), PALETTE.ball)!.y);
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
