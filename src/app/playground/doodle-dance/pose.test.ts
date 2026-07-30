import { describe, expect, it } from "vitest";
import { FIGURE_BOTTOM, FIGURE_TOP, figureStrokes } from "./figure";
import { createTracker, decaySpeed, driveOf, onLeave, onMove } from "./input";
import { createBody, stepBody, toPose, type Drive } from "./pose";

const STILL: Drive = { x: 0, y: 0, speed: 0, active: false };

/** dt초 동안 같은 입력을 물린다 */
function hold(drive: Drive, seconds: number) {
  const body = createBody();
  for (let i = 0; i < Math.round(seconds * 60); i++) stepBody(body, drive, 1 / 60);
  return body;
}

describe("자세 스프링", () => {
  it("커서가 오른쪽이면 몸통이 오른쪽으로 기운다", () => {
    const pose = toPose(hold({ x: 1, y: 0, speed: 0, active: true }, 1.5));
    expect(pose.lean).toBeGreaterThan(0.15);
  });

  it("커서가 왼쪽이면 반대로 기운다", () => {
    const pose = toPose(hold({ x: -1, y: 0, speed: 0, active: true }, 1.5));
    expect(pose.lean).toBeLessThan(-0.15);
  });

  it("머리는 몸통과 반대로 갸웃한다 — 이게 없으면 통나무가 기울는 것처럼 보인다", () => {
    const pose = toPose(hold({ x: 1, y: 0, speed: 0, active: true }, 1.5));
    expect(Math.sign(pose.headTilt)).toBe(-Math.sign(pose.lean));
  });

  it("머리는 몸통보다 늦게 따라온다", () => {
    const body = createBody();
    const drive: Drive = { x: 1, y: 0, speed: 0, active: true };
    // 기울기가 목표의 절반을 넘은 시점에도 머리는 아직 덜 돌아가 있어야 한다
    let checked = false;
    for (let i = 0; i < 60; i++) {
      stepBody(body, drive, 1 / 60);
      const pose = toPose(body);
      if (!checked && pose.lean > 0.15) {
        expect(Math.abs(pose.headTilt)).toBeLessThan(Math.abs(pose.lean));
        checked = true;
      }
    }
    expect(checked).toBe(true);
  });

  it("커서를 올리면 양팔이 함께 올라간다", () => {
    const low = toPose(hold({ x: 0, y: -1, speed: 0, active: true }, 2));
    const high = toPose(hold({ x: 0, y: 1, speed: 0, active: true }, 2));
    expect(high.armL).toBeGreaterThan(low.armL + 0.3);
    expect(high.armR).toBeGreaterThan(low.armR + 0.3);
    // 위팔만이 아니라 팔꿈치도 더 젖혀져야 "만세"로 읽힌다
    expect(high.elbowL).toBeGreaterThan(low.elbowL + 0.15);
  });

  it("커서가 향한 쪽 팔이 더 뻗는다", () => {
    const pose = toPose(hold({ x: 1, y: 0, speed: 0, active: true }, 2));
    expect(pose.armR).toBeGreaterThan(pose.armL);
  });

  it("빠르게 움직이면 격렬해지고, 멈추면 여운을 남기고 잦아든다", () => {
    const body = createBody();
    for (let i = 0; i < 90; i++) stepBody(body, { x: 0, y: 0, speed: 1, active: true }, 1 / 60);
    const hot = toPose(body).energy;
    expect(hot).toBeGreaterThan(0.7);

    for (let i = 0; i < 6; i++) stepBody(body, { x: 0, y: 0, speed: 0, active: true }, 1 / 60);
    expect(toPose(body).energy).toBeGreaterThan(0.3); // 즉시 0이 되지 않는다
    for (let i = 0; i < 180; i++) stepBody(body, { x: 0, y: 0, speed: 0, active: true }, 1 / 60);
    expect(toPose(body).energy).toBeLessThan(0.05);
  });

  it("커서를 놓아도 혼자 좌우로 흔들린다", () => {
    const body = createBody();
    const leans: number[] = [];
    for (let i = 0; i < 60 * 6; i++) {
      stepBody(body, STILL, 1 / 60);
      leans.push(toPose(body).lean);
    }
    expect(Math.max(...leans)).toBeGreaterThan(0.05);
    expect(Math.min(...leans)).toBeLessThan(-0.05);
  });

  it("다리는 번갈아 들린다", () => {
    const body = createBody();
    let sawLeft = false;
    let sawRight = false;
    for (let i = 0; i < 60 * 4; i++) {
      stepBody(body, { x: 0, y: 0, speed: 1, active: true }, 1 / 60);
      const lift = toPose(body).legLift;
      if (lift > 0.3) sawRight = true;
      if (lift < -0.3) sawLeft = true;
    }
    expect(sawLeft && sawRight).toBe(true);
  });

  it("dt가 크게 튀어도 발산하지 않는다 — 탭에서 돌아왔을 때 몸이 터지면 안 된다", () => {
    const body = createBody();
    for (let i = 0; i < 20; i++) stepBody(body, { x: 1, y: 1, speed: 1, active: true }, 3);
    const pose = toPose(body);
    for (const value of Object.values(pose)) {
      expect(Number.isFinite(value)).toBe(true);
    }
    expect(Math.abs(pose.lean)).toBeLessThan(1);
  });

  it("dt가 0이나 NaN이면 아무 일도 없다", () => {
    const body = createBody();
    stepBody(body, { x: 1, y: 1, speed: 1, active: true }, 0);
    stepBody(body, { x: 1, y: 1, speed: 1, active: true }, Number.NaN);
    expect(toPose(body).lean).toBe(0);
  });
});

describe("포인터 추적", () => {
  it("첫 이벤트만으로는 속도가 생기지 않는다 — 커서를 올려놓기만 해도 몸이 튀면 안 된다", () => {
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
    const before = tracker.speed;
    expect(before).toBeGreaterThan(0);
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

describe("그림 만들기", () => {
  it("모든 선이 유한한 좌표를 가진다", () => {
    const body = createBody();
    for (let i = 0; i < 200; i++) {
      stepBody(body, { x: Math.sin(i), y: Math.cos(i * 0.7), speed: 1, active: true }, 1 / 60);
      for (const stroke of figureStrokes(toPose(body))) {
        if (stroke.kind === "circle") {
          expect(Number.isFinite(stroke.c.x) && Number.isFinite(stroke.c.y)).toBe(true);
          expect(stroke.r).toBeGreaterThan(0);
          continue;
        }
        expect(stroke.pts.length).toBeGreaterThan(1);
        for (const p of stroke.pts) {
          expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
        }
      }
    }
  });

  it("어떤 자세에서도 그림이 카메라 범위 안에 들어온다", () => {
    const body = createBody();
    for (let i = 0; i < 300; i++) {
      stepBody(body, { x: Math.sin(i * 0.3), y: Math.sin(i * 0.11), speed: 1, active: true }, 1 / 60);
      for (const stroke of figureStrokes(toPose(body))) {
        const ys =
          stroke.kind === "circle"
            ? [stroke.c.y - stroke.r, stroke.c.y + stroke.r]
            : stroke.pts.map((p) => p.y);
        for (const y of ys) {
          expect(y).toBeLessThanOrEqual(FIGURE_TOP);
          expect(y).toBeGreaterThanOrEqual(FIGURE_BOTTOM);
        }
      }
    }
  });

  it("머리는 골반 위에, 발은 아래에 있다", () => {
    const strokes = figureStrokes(toPose(createBody()));
    const head = strokes.find((s) => s.kind === "circle");
    expect(head?.kind === "circle" && head.c.y).toBeGreaterThan(40);
    const feet = strokes.filter((s) => s.kind === "circle" && s.c.y < 0);
    expect(feet).toHaveLength(2);
  });
});
