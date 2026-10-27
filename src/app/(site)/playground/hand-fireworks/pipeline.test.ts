import { describe, it, expect } from "vitest";
import { stepHands, type HandObservation, type HandState, type Point } from "./gesture";
import { createWorld, launchShell, randomShot, type Shell, type World } from "./firework";
import { nextShot, type Program } from "./program";
import { toWorld, coverRect } from "./viewport";

/**
 * 손 판정 → 프로그램 → 발사로 이어지는 배선 검증.
 *
 * 세 모듈은 각자 테스트돼 있지만 실제로 붙는 곳은 컴포넌트의 rAF 루프 안이라
 * 단위 테스트가 닿지 않는다. 그 사이의 계산을 여기서 같은 순서로 재현한다.
 * 특히 **커서를 양손이 하나로 나눠 쓴다**는 것이 이 파일이 지키는 규칙이다.
 */

const STAGE = { w: 600, h: 400 };
const RECT = coverRect(STAGE.w, STAGE.h, 4 / 3);
/** 무작위 자리를 고정해 «프로그램이 없을 때» 경로도 결정적으로 본다 */
const fixedRng = () => 0.5;

function makeHand(open: number, x = 0.5): Point[] {
  const y = 0.8;
  const palm = 0.1;
  // gesture.ts의 CURLED(1.15)~EXTENDED(1.95) 사이를 open으로 보간한다
  const ratio = 1.15 + open * 0.8;
  const lm: Point[] = Array.from({ length: 21 }, () => ({ x, y }));
  for (const i of [5, 9, 13, 17]) lm[i] = { x, y: y - palm };
  for (const tip of [8, 12, 16, 20]) lm[tip] = { x, y: y - palm * ratio };
  return lm;
}

/** 컴포넌트 루프 한 프레임과 같은 순서로 계산한다 */
function frame(
  state: { hands: HandState[]; cursor: number; world: World },
  observed: HandObservation[],
  program: Program,
) {
  const step = stepHands(state.hands, observed, 50);

  let cursor = state.cursor;
  const shells: Shell[] = [];
  for (const launch of step.launches) {
    const picked = nextShot(program, cursor);
    cursor = picked.index;
    const at = toWorld(launch, RECT, STAGE.h);
    shells.push(launchShell(at, launch.power, picked.shot ?? randomShot(fixedRng), fixedRng));
  }

  return {
    hands: step.hands,
    cursor,
    world: { ...state.world, shells: [...state.world.shells, ...shells] },
  };
}

const both = (left: number, right: number): HandObservation[] => [
  { key: "Left", landmarks: makeHand(left, 0.3) },
  { key: "Right", landmarks: makeHand(right, 0.7) },
];

const PROGRAM: Program = [
  { kind: "peony", hue: 48 },
  { kind: "ring", hue: 210 },
  { kind: "willow", hue: 8 },
];

/** 쏜 불꽃을 «모양/색» 문자열로 늘어놓는다 */
const fired = (world: World) => world.shells.map((s) => `${s.kind}/${s.hue}`);

describe("손 → 프로그램 → 발사", () => {
  it("한 손으로 쏘면 짠 순서대로 나가고 끝나면 처음으로 돌아온다", () => {
    let s = { hands: [] as HandState[], cursor: 0, world: createWorld() };
    // 쥠 → 폄을 네 번 반복. 쿨다운(380ms)을 넘기려고 프레임을 넉넉히 둔다
    for (let i = 0; i < 4; i += 1) {
      for (const open of [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.95]) {
        s = frame(s, [{ key: "Right", landmarks: makeHand(open) }], PROGRAM);
      }
    }
    expect(fired(s.world)).toEqual(["peony/48", "ring/210", "willow/8", "peony/48"]);
  });

  it("양손이 커서를 나눠 쓴다 — 번갈아 쏴도 순서가 안 꼬인다", () => {
    let s = { hands: [] as HandState[], cursor: 0, world: createWorld() };
    // 둘 다 장전
    s = frame(s, both(0.1, 0.1), PROGRAM);
    // 왼손만 폄 → 1번
    s = frame(s, both(0.95, 0.1), PROGRAM);
    // 오른손만 폄 → 2번
    s = frame(s, both(0.95, 0.95), PROGRAM);
    // 왼손을 다시 쥐었다 폄 → 3번
    s = frame(s, both(0.1, 0.95), PROGRAM);
    for (let i = 0; i < 9; i += 1) s = frame(s, both(0.1, 0.95), PROGRAM);
    s = frame(s, both(0.95, 0.95), PROGRAM);

    // 손마다 커서를 따로 셌다면 왼손이 1·1번, 오른손이 1번을 쏴서 순서가 깨진다
    expect(fired(s.world)).toEqual(["peony/48", "ring/210", "willow/8"]);
  });

  it("한 프레임에 두 손이 동시에 펴지면 두 발이 순서대로 소비된다", () => {
    let s = { hands: [] as HandState[], cursor: 0, world: createWorld() };
    s = frame(s, both(0.1, 0.1), PROGRAM);
    s = frame(s, both(0.95, 0.95), PROGRAM);
    expect(fired(s.world)).toEqual(["peony/48", "ring/210"]);
  });

  it("프로그램이 비어 있으면 무작위로 나간다 — 페이지가 멈추지 않는다", () => {
    let s = { hands: [] as HandState[], cursor: 0, world: createWorld() };
    s = frame(s, [{ key: "Right", landmarks: makeHand(0.1) }], []);
    s = frame(s, [{ key: "Right", landmarks: makeHand(0.95) }], []);
    expect(s.world.shells).toHaveLength(1);
    expect(s.cursor).toBe(0);
  });

  it("발사점이 무대 좌표로 옮겨진다 — 거울로 뒤집힌 채", () => {
    let s = { hands: [] as HandState[], cursor: 0, world: createWorld() };
    s = frame(s, [{ key: "Right", landmarks: makeHand(0.1, 0.2) }], PROGRAM);
    s = frame(s, [{ key: "Right", landmarks: makeHand(0.95, 0.2) }], PROGRAM);
    // 영상 왼쪽(0.2)에 잡힌 손은 거울에서 오른쪽(0.8)이고, 무대 폭은 높이의 1.5배다
    expect(s.world.shells[0].x).toBeCloseTo(0.8 * (STAGE.w / STAGE.h), 5);
  });
});
