import { describe, expect, it } from "vitest";
import { BALL_RADIUS, type Vec3 } from "./flight";
import { CATCHER_EYE, catcherCamera, makeCamera, project, projectedRadius } from "./camera";
import { BASES, MOUND_CENTER } from "./field";

const AHEAD: Vec3 = { x: 0, y: 0, z: 10 };

/** 정면을 똑바로 보는, 화면비 1의 시험용 카메라 */
function straightCamera() {
  return makeCamera({ x: 0, y: 0, z: 0 }, AHEAD, 1);
}

describe("makeCamera", () => {
  it("축 셋이 서로 직각인 오른손 좌표계다", () => {
    const camera = makeCamera({ x: 0, y: 1, z: -1 }, { x: 0.4, y: 1.6, z: 16 }, 1.8);
    const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;

    expect(dot(camera.forward, camera.right)).toBeCloseTo(0, 9);
    expect(dot(camera.forward, camera.up)).toBeCloseTo(0, 9);
    expect(dot(camera.right, camera.up)).toBeCloseTo(0, 9);
  });

  it("화면이 기울지 않는다 — 포수는 고개를 갸웃하지 않는다", () => {
    // 위를 올려다보는 카메라라도 right는 수평이어야 한다
    const camera = makeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 5, z: 10 }, 1);
    expect(camera.right.y).toBeCloseTo(0, 9);
  });
});

describe("project", () => {
  it("정면 축 위의 점은 화면 중앙에 온다", () => {
    const p = project(straightCamera(), AHEAD);
    expect(p?.x).toBeCloseTo(0, 9);
    expect(p?.y).toBeCloseTo(0, 9);
    expect(p?.depth).toBeCloseTo(10, 9);
  });

  it("위는 위로, 오른쪽은 오른쪽으로 간다", () => {
    const camera = straightCamera();
    expect(project(camera, { x: 0, y: 1, z: 10 })!.y).toBeGreaterThan(0);
    expect(project(camera, { x: 1, y: 0, z: 10 })!.x).toBeGreaterThan(0);
  });

  it("카메라 뒤에 있으면 아무것도 안 준다", () => {
    expect(project(straightCamera(), { x: 0, y: 0, z: -5 })).toBeNull();
  });

  it("멀어지면 화면 중앙으로 모인다", () => {
    const camera = straightCamera();
    const near = project(camera, { x: 1, y: 0, z: 5 })!;
    const far = project(camera, { x: 1, y: 0, z: 20 })!;
    expect(Math.abs(far.x)).toBeLessThan(Math.abs(near.x));
  });

  it("화면이 넓어지면 가로로 눌린다", () => {
    const square = makeCamera({ x: 0, y: 0, z: 0 }, AHEAD, 1);
    const wide = makeCamera({ x: 0, y: 0, z: 0 }, AHEAD, 2);
    const p: Vec3 = { x: 1, y: 1, z: 10 };

    // 세로 화각은 그대로 두고 가로만 넓히는 방식이다
    expect(project(wide, p)!.y).toBeCloseTo(project(square, p)!.y, 9);
    expect(project(wide, p)!.x).toBeCloseTo(project(square, p)!.x / 2, 9);
  });
});

describe("projectedRadius", () => {
  it("가까울수록 크다", () => {
    const camera = straightCamera();
    const far = projectedRadius(camera, { x: 0, y: 0, z: 16.5 }, BALL_RADIUS);
    const near = projectedRadius(camera, { x: 0, y: 0, z: 2 }, BALL_RADIUS);
    expect(near).toBeGreaterThan(far * 5);
  });

  it("거리를 절반으로 줄이면 두 배가 된다", () => {
    // 멀리 있을 때는 각반지름이 거의 선형이라 이 관계가 성립해야 한다
    const camera = straightCamera();
    const far = projectedRadius(camera, { x: 0, y: 0, z: 16 }, BALL_RADIUS);
    const half = projectedRadius(camera, { x: 0, y: 0, z: 8 }, BALL_RADIUS);
    expect(half / far).toBeCloseTo(2, 3);
  });

  it("공이 눈보다 안쪽으로 들어오면 화면을 다 덮는다", () => {
    const camera = straightCamera();
    expect(projectedRadius(camera, { x: 0, y: 0, z: 0.01 }, BALL_RADIUS)).toBe(Infinity);
  });
});

describe("catcherCamera", () => {
  it("릴리스 지점이 화면 위쪽 절반 안에 들어온다", () => {
    // 눈높이 1.05m에서 1.8m 릴리스를 보므로 중앙보다 위지만 화면 밖은 아니다
    const p = project(catcherCamera(16 / 9), { x: -0.35, y: 1.8, z: 16.5 })!;
    expect(p.y).toBeGreaterThan(0);
    expect(p.y).toBeLessThan(1);
    expect(Math.abs(p.x)).toBeLessThan(1);
  });

  it("스트라이크존 네 귀퉁이가 전부 화면 안에 있다", () => {
    const camera = catcherCamera(16 / 9);
    for (const x of [-0.216, 0.216]) {
      for (const y of [0.5, 1.1]) {
        const p = project(camera, { x, y, z: 0 })!;
        expect(Math.abs(p.x)).toBeLessThan(1);
        expect(Math.abs(p.y)).toBeLessThan(1);
      }
    }
  });

  it("눈은 홈플레이트 뒤에 있다", () => {
    expect(CATCHER_EYE.z).toBeLessThan(0);
  });

  it("16:9 화면에 1·2·3루가 전부 들어온다", () => {
    // 화각을 55°에서 60°로 넓힌 이유가 이것이다. 55°에서는 가로 반각이
    // 42.8°라 45°에 있는 1루와 3루가 딱 2° 차이로 잘려 나갔다
    const camera = catcherCamera(16 / 9);
    for (const base of BASES) {
      const p = project(camera, { x: base.x, y: 0.05, z: base.z })!;
      expect(Math.abs(p.x), base.name).toBeLessThan(1);
    }
  });

  it("마운드 위 투수가 화면 안에 온전히 들어온다", () => {
    const camera = catcherCamera(16 / 9);
    // 발끝(마운드 꼭대기)부터 머리(1.9m)까지
    for (const y of [0.25, 1.9]) {
      const p = project(camera, { x: -0.35, y, z: MOUND_CENTER.z })!;
      expect(Math.abs(p.y)).toBeLessThan(1);
    }
  });
});
