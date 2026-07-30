import { describe, expect, it } from "vitest";
import { CHOREO, CHOREO_SECONDS } from "./choreo";
import { FIGURE_BOTTOM, FIGURE_LEFT, FIGURE_RIGHT, FIGURE_TOP, figureStrokes } from "./figure";
import { createTracker, decaySpeed, driveOf, onLeave, onMove, type Drive } from "./input";
import { createPlayer, frameIndexAt, poseAt, stepPlayer } from "./play";

const STILL: Drive = { x: 0, y: 0, speed: 0, active: false };
const DANCING: Drive = { x: 0, y: 0, speed: 1, active: true };

function run(drive: Drive, seconds: number) {
  const player = createPlayer();
  for (let i = 0; i < Math.round(seconds * 60); i++) stepPlayer(player, drive, 1 / 60);
  return player;
}

describe("안무 데이터", () => {
  it("원본 길이만큼 담겨 있다", () => {
    expect(CHOREO.length).toBeGreaterThan(60);
    expect(CHOREO_SECONDS).toBeGreaterThan(10);
    expect(CHOREO_SECONDS).toBeLessThan(16);
  });

  it("모든 키프레임이 유한하고 몸 크기 안에 있다", () => {
    for (const k of CHOREO) {
      expect(k.d).toBeGreaterThan(0);
      for (const p of [k.head, k.hl, k.hr, k.fl, k.fr]) {
        expect(Number.isFinite(p[0]) && Number.isFinite(p[1])).toBe(true);
        expect(p[0]).toBeGreaterThan(FIGURE_LEFT);
        expect(p[0]).toBeLessThan(FIGURE_RIGHT);
      }
      // 머리는 골반 위, 발은 골반 아래
      expect(k.head[1]).toBeGreaterThan(30);
      expect(k.fl[1]).toBeLessThan(0);
      expect(k.fr[1]).toBeLessThan(0);
    }
  });

  it("원본처럼 크게 눕는 자세가 들어 있다 — 스프링으로 흉내 낸 ±0.4rad보다 깊다", () => {
    const leans = CHOREO.map((k) => Math.atan2(k.head[0], k.head[1]));
    expect(Math.min(...leans)).toBeLessThan(-0.5);
    expect(Math.max(...leans)).toBeGreaterThan(0.3);
  });

  it("한 발을 크게 드는 자세가 들어 있다", () => {
    const gaps = CHOREO.map((k) => Math.abs(k.fl[1] - k.fr[1]));
    expect(Math.max(...gaps)).toBeGreaterThan(15);
  });
});

describe("재생", () => {
  it("커서를 빠르게 움직이면 놓았을 때보다 훨씬 멀리 진행한다", () => {
    expect(run(DANCING, 3).t).toBeGreaterThan(run(STILL, 3).t * 4);
  });

  it("손을 멈춰도 한 박자 더 흐르고 잦아든다", () => {
    const player = createPlayer();
    for (let i = 0; i < 120; i++) stepPlayer(player, DANCING, 1 / 60);
    const hot = player.rate;
    expect(hot).toBeGreaterThan(1.4);
    for (let i = 0; i < 6; i++) stepPlayer(player, { ...DANCING, speed: 0 }, 1 / 60);
    expect(player.rate).toBeGreaterThan(0.6);
    for (let i = 0; i < 180; i++) stepPlayer(player, { ...DANCING, speed: 0 }, 1 / 60);
    expect(player.rate).toBeLessThan(0.2);
  });

  it("안무 끝에서 처음으로 돌아간다", () => {
    const player = createPlayer();
    player.t = CHOREO_SECONDS - 0.01;
    for (let i = 0; i < 60; i++) stepPlayer(player, DANCING, 1 / 60);
    expect(player.t).toBeGreaterThanOrEqual(0);
    expect(player.t).toBeLessThan(CHOREO_SECONDS);
  });

  it("보간하지 않고 자세를 딱딱 넘긴다 — 원본이 손그림 프레임이라 중간이 없다", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 400; i++) seen.add(frameIndexAt((i / 400) * CHOREO_SECONDS));
    expect(seen.size).toBe(CHOREO.length);
    // 같은 그림이 걸린 구간 안에서는 자세가 한 치도 움직이지 않는다
    const a = createPlayer();
    const b = createPlayer();
    b.t = 0.001;
    expect(poseAt(a).head).toEqual(poseAt(b).head);
  });

  it("커서가 오른쪽이면 몸 전체가 오른쪽으로 더 기운다", () => {
    const base = poseAt(createPlayer());
    const right = run({ x: 1, y: 0, speed: 0, active: true }, 1.5);
    right.t = 0;
    expect(poseAt(right).head.x).toBeGreaterThan(base.head.x + 4);
  });

  it("커서가 위면 손이 올라간다", () => {
    const low = run({ x: 0, y: -1, speed: 0, active: true }, 1.5);
    const high = run({ x: 0, y: 1, speed: 0, active: true }, 1.5);
    low.t = high.t = 0;
    expect(poseAt(high).handL.y).toBeGreaterThan(poseAt(low).handL.y + 5);
  });

  it("dt가 크게 튀거나 이상해도 발산하지 않는다", () => {
    const player = createPlayer();
    for (let i = 0; i < 20; i++) stepPlayer(player, { x: 1, y: 1, speed: 1, active: true }, 3);
    stepPlayer(player, DANCING, Number.NaN);
    stepPlayer(player, DANCING, 0);
    expect(Number.isFinite(player.t)).toBe(true);
    expect(player.t).toBeLessThan(CHOREO_SECONDS);
    expect(Math.abs(player.tilt)).toBeLessThan(1);
  });
});

describe("그림 만들기", () => {
  it("모든 자세에서 선이 유한하고 카메라 범위 안에 있다", () => {
    const player = createPlayer();
    for (let i = 0; i < CHOREO.length * 3; i++) {
      player.t = (i / (CHOREO.length * 3)) * CHOREO_SECONDS;
      player.tilt = ((i % 3) - 1) * 0.13;
      player.lift = ((i % 3) - 1) * 5;
      for (const stroke of figureStrokes(poseAt(player))) {
        const pts = stroke.kind === "circle"
          ? [{ x: stroke.c.x, y: stroke.c.y + stroke.r }, { x: stroke.c.x, y: stroke.c.y - stroke.r }]
          : stroke.pts;
        for (const p of pts) {
          expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
          expect(p.y).toBeLessThanOrEqual(FIGURE_TOP);
          expect(p.y).toBeGreaterThanOrEqual(FIGURE_BOTTOM);
          expect(p.x).toBeGreaterThanOrEqual(FIGURE_LEFT);
          expect(p.x).toBeLessThanOrEqual(FIGURE_RIGHT);
        }
      }
    }
  });

  it("손과 발은 안무가 지정한 자리에 정확히 놓인다 — 팔 길이보다 이게 우선이다", () => {
    const player = createPlayer();
    for (let i = 0; i < CHOREO.length; i++) {
      player.t = CHOREO.slice(0, i).reduce((s, k) => s + k.d, 0) + 0.001;
      const pose = poseAt(player);
      const strokes = figureStrokes(pose);
      const ends = strokes.filter((s) => s.kind === "path" && s.pts.length === 3).map((s) => {
        if (s.kind !== "path") throw new Error("unreachable");
        return s.pts[2];
      });
      for (const target of [pose.handL, pose.handR]) {
        expect(ends.some((e) => Math.hypot(e.x - target.x, e.y - target.y) < 0.01)).toBe(true);
      }
      const feet = strokes.filter((s) => s.kind === "circle" && s.c.y < 0);
      expect(feet).toHaveLength(2);
    }
  });

  it("팔꿈치는 몸 바깥으로 꺾인다", () => {
    const player = createPlayer();
    let checked = 0;
    for (let i = 0; i < CHOREO.length; i++) {
      player.t = CHOREO.slice(0, i).reduce((s, k) => s + k.d, 0) + 0.001;
      const pose = poseAt(player);
      const arms = figureStrokes(pose).filter((s) => s.kind === "path" && s.pts.length === 3);
      // 팔 두 개 + 다리 두 개가 3점 경로다. 앞의 둘이 팔.
      const [left, rightArm] = arms.slice(0, 2);
      if (left.kind !== "path" || rightArm.kind !== "path") continue;
      const axis = Math.atan2(pose.head.x, pose.head.y);
      // 몸통 축을 기준으로 왼팔 팔꿈치는 왼쪽, 오른팔 팔꿈치는 오른쪽에 있어야 한다
      const side = (p: { x: number; y: number }) => p.x * Math.cos(axis) - p.y * -Math.sin(axis);
      expect(side(left.pts[1])).toBeLessThan(side(rightArm.pts[1]));
      checked++;
    }
    expect(checked).toBeGreaterThan(60);
  });
});

describe("포인터 추적", () => {
  it("첫 이벤트만으로는 속도가 생기지 않는다 — 커서를 올려놓기만 해도 춤이 튀면 안 된다", () => {
    const tracker = createTracker();
    onMove(tracker, 0.9, 0.9, 1000);
    expect(tracker.speed).toBe(0);
    expect(tracker.active).toBe(true);
  });

  it("빨리 움직이면 speed가 오르고 1을 넘지 않는다", () => {
    const tracker = createTracker();
    onMove(tracker, -1, 0, 0);
    for (let i = 1; i <= 10; i++) onMove(tracker, i % 2 === 0 ? -1 : 1, 0, i * 16);
    expect(tracker.speed).toBeGreaterThan(0.5);
    expect(tracker.speed).toBeLessThanOrEqual(1);
  });

  it("move가 끊기면 speed가 잦아든다", () => {
    const tracker = createTracker();
    onMove(tracker, -1, 0, 0);
    onMove(tracker, 1, 0, 16);
    expect(tracker.speed).toBeGreaterThan(0);
    for (let i = 0; i < 120; i++) decaySpeed(tracker, 1000 + i * 16, 1 / 60);
    expect(tracker.speed).toBe(0);
  });

  it("판을 벗어나면 조종을 놓는다", () => {
    const tracker = createTracker();
    onMove(tracker, 0.5, 0.5, 0);
    onLeave(tracker);
    expect(driveOf(tracker).active).toBe(false);
  });
});
