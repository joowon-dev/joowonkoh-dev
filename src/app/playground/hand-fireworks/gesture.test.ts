import { describe, it, expect } from "vitest";
import {
  COOLDOWN_MS,
  CURLED_RATIO,
  EXTENDED_RATIO,
  handOpenness,
  palmCenter,
  powerFromHeight,
  stepHands,
  type HandState,
  type Point,
} from "./gesture";

/**
 * 펼침도가 `open`이 되도록 만든 가짜 손.
 *
 * 손목에서 손가락 끝까지를 손바닥 길이의 몇 배로 둘지만 정하면 되므로,
 * 손을 곧게 편 모양 하나로 21개 점을 채운다. `scale`은 카메라와의 거리 —
 * 이걸 바꿔도 펼침도가 안 변해야 한다는 것이 이 판정의 요점이다.
 */
function makeHand(open: number, { x = 0.5, y = 0.8, scale = 1 } = {}): Point[] {
  const palm = 0.1 * scale;
  const ratio = CURLED_RATIO + open * (EXTENDED_RATIO - CURLED_RATIO);
  const wrist = { x, y };
  const lm: Point[] = Array.from({ length: 21 }, () => ({ ...wrist }));
  // 손바닥 마디들은 손목 바로 위에 모아 둔다
  for (const i of [5, 9, 13, 17]) lm[i] = { x, y: y - palm };
  for (const tip of [8, 12, 16, 20]) lm[tip] = { x, y: y - palm * ratio };
  return lm;
}

describe("handOpenness", () => {
  it("주먹은 0, 쫙 편 손은 1", () => {
    expect(handOpenness(makeHand(0))).toBeCloseTo(0, 5);
    expect(handOpenness(makeHand(1))).toBeCloseTo(1, 5);
  });

  it("카메라에서 멀어져 손이 작아져도 같은 값이 나온다", () => {
    const near = handOpenness(makeHand(0.7, { scale: 1 }));
    const far = handOpenness(makeHand(0.7, { scale: 0.25 }));
    expect(far).toBeCloseTo(near, 5);
  });

  it("손바닥이 한 점으로 뭉개진 프레임에서도 터지지 않는다", () => {
    const degenerate: Point[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }));
    expect(handOpenness(degenerate)).toBe(0);
  });
});

describe("palmCenter", () => {
  it("손목과 손바닥 마디들의 한가운데", () => {
    const c = palmCenter(makeHand(1, { x: 0.4, y: 0.9 }));
    expect(c.x).toBeCloseTo(0.4, 5);
    // 손목 0.9 하나와 마디 0.8 넷의 평균
    expect(c.y).toBeCloseTo(0.82, 5);
  });
});

describe("powerFromHeight", () => {
  it("손을 높이 들수록 세다", () => {
    expect(powerFromHeight(0)).toBeCloseTo(1, 5);
    expect(powerFromHeight(1)).toBeCloseTo(0.45, 5);
    expect(powerFromHeight(0.2)).toBeGreaterThan(powerFromHeight(0.8));
  });
});

/** 같은 손을 프레임 여러 개에 걸쳐 흘려보내고 나간 발사를 모은다 */
function play(opennessByFrame: number[], dtMs = 50) {
  let hands: HandState[] = [];
  const fired: number[] = [];
  opennessByFrame.forEach((open, i) => {
    const next = stepHands(hands, [{ key: "Right", landmarks: makeHand(open) }], dtMs);
    hands = next.hands;
    if (next.launches.length > 0) fired.push(i);
  });
  return { hands, fired };
}

describe("stepHands", () => {
  it("쥐었다 펴면 딱 한 번 나간다", () => {
    const { fired } = play([0.1, 0.1, 0.4, 0.9, 0.95, 1]);
    expect(fired).toEqual([3]);
  });

  it("편 채로 시작하면 나가지 않는다 — 잠그는 동작이 먼저다", () => {
    const { fired } = play([0.9, 1, 1, 1]);
    expect(fired).toEqual([]);
  });

  it("두 문턱 사이에서 떨리는 것만으로는 안 나간다", () => {
    const { fired } = play([0.1, 0.3, 0.5, 0.3, 0.55, 0.4, 0.5]);
    expect(fired).toEqual([]);
  });

  it("쿨다운이 끝나기 전에는 다시 안 나간다", () => {
    // 50ms 프레임으로 쥠→폄을 곧바로 반복한다. 쿨다운이 없으면 두 번 나간다.
    const frames = [0.1, 0.9, 0.1, 0.9];
    const { fired } = play(frames, 50);
    expect(fired).toEqual([1]);
  });

  it("쿨다운이 지나면 다시 나간다", () => {
    const { fired } = play([0.1, 0.9, 0.1, 0.9], COOLDOWN_MS);
    expect(fired).toEqual([1, 3]);
  });

  it("좌우를 뒤집어 화면 좌표로 준다 — 거울에 비친 손과 겹쳐야 한다", () => {
    const { hands } = stepHands([], [{ key: "Right", landmarks: makeHand(1, { x: 0.2 }) }], 16);
    expect(hands[0].palm.x).toBeCloseTo(0.8, 5);
  });

  it("두 손이 각자 따로 잠기고 따로 나간다", () => {
    let hands: HandState[] = [];
    const both = (l: number, r: number) =>
      stepHands(
        hands,
        [
          { key: "Left", landmarks: makeHand(l) },
          { key: "Right", landmarks: makeHand(r) },
        ],
        50,
      );

    hands = both(0.1, 0.1).hands;
    const step = both(0.9, 0.1);
    hands = step.hands;
    expect(step.launches.map((l) => l.key)).toEqual(["Left"]);

    const step2 = both(0.9, 0.9);
    expect(step2.launches.map((l) => l.key)).toEqual(["Right"]);
  });

  it("손이 프레임에서 사라지면 상태도 같이 사라진다", () => {
    let hands = stepHands([], [{ key: "Right", landmarks: makeHand(0.1) }], 50).hands;
    expect(hands).toHaveLength(1);
    hands = stepHands(hands, [], 50).hands;
    expect(hands).toEqual([]);
  });

  it("이전 상태를 건드리지 않는다", () => {
    const before = stepHands([], [{ key: "Right", landmarks: makeHand(0.1) }], 50).hands;
    const snapshot = structuredClone(before);
    stepHands(before, [{ key: "Right", landmarks: makeHand(1) }], 50);
    expect(before).toEqual(snapshot);
  });

  it("펼침도가 EXTENDED_RATIO를 넘겨도 1을 안 넘는다", () => {
    const lm = makeHand(0);
    for (const tip of [8, 12, 16, 20]) lm[tip] = { x: 0.5, y: 0.8 - 0.1 * (EXTENDED_RATIO + 1) };
    expect(handOpenness(lm)).toBe(1);
  });
});
