import { describe, it, expect } from "vitest";
import {
  MIN_SELF_AGE,
  createTracker,
  intruderTrack,
  selfTrack,
  stepTracker,
  type Box,
  type TrackerState,
} from "./detect";
import { createGlareState, stepGlare, type GlareLevel, type GlareState } from "./state";

/**
 * 트래킹과 상태 머신을 잇는 배선 검증.
 *
 * 두 모듈은 각자 테스트돼 있지만, 실제로 붙는 곳(GlareGame의 루프)은 컴포넌트 안이라
 * 단위 테스트가 닿지 않는다. 그 사이의 계산 — 침입자 박스 높이를 상태 머신에 넘기는 —
 * 을 여기서 같은 순서로 재현한다.
 */
function frame(tracker: TrackerState, glare: GlareState, boxes: Box[]) {
  const nextTracker = stepTracker(tracker, boxes);
  const me = selfTrack(nextTracker);
  const intruder = me ? intruderTrack(nextTracker) : null;
  return {
    tracker: nextTracker,
    glare: stepGlare(glare, intruder?.box.h ?? null, 1),
  };
}

/** 60cm 앞의 내 얼굴. 화면 높이의 40% 정도를 차지한다. */
const ME: Box = { x: 0.35, y: 0.25, w: 0.28, h: 0.4 };

/** 거리에 따른 침입자 박스. h가 곧 거리 신호다. */
const intruderAt = (h: number): Box => ({ x: 0.05, y: 0.3, w: h * 0.75, h });

function run(boxesPerFrame: Box[][]): { levels: GlareLevel[]; last: GlareLevel } {
  let tracker = createTracker();
  let glare = createGlareState();
  const levels: GlareLevel[] = [];
  for (const boxes of boxesPerFrame) {
    ({ tracker, glare } = frame(tracker, glare, boxes));
    levels.push(glare.level);
  }
  return { levels, last: levels[levels.length - 1] };
}

/** 같은 장면을 n프레임 반복하는 배열 */
const hold = (boxes: Box[], n: number): Box[][] => Array.from({ length: n }, () => boxes);

describe("검출 → 개바리 배선", () => {
  it("나 혼자 앉아 있으면 끝까지 평온하다", () => {
    // 내 얼굴은 0.4로 glare 임계값(0.22)의 두 배지만, 나는 침입자가 아니다
    const { levels } = run(hold([ME], MIN_SELF_AGE + 60));
    expect(new Set(levels)).toEqual(new Set(["idle"]));
  });

  it("사람이 다가오면 단계가 차례로 올라간다", () => {
    let tracker = createTracker();
    let glare = createGlareState();

    // 내가 먼저 3초 앉아 있어야 나로 확정된다
    for (const boxes of hold([ME], MIN_SELF_AGE)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }
    expect(glare.level).toBe("idle");

    const seen: GlareLevel[] = [];
    // 4m → 1m 쯤까지 천천히 다가온다
    for (let h = 0.04; h <= 0.3; h += 0.004) {
      for (let i = 0; i < 3; i += 1) {
        ({ tracker, glare } = frame(tracker, glare, [ME, intruderAt(h)]));
      }
      seen.push(glare.level);
    }

    // 건너뛰거나 되돌아가는 일 없이 순서대로 올라가야 한다
    const order: GlareLevel[] = ["idle", "glance", "stare", "glare"];
    const path = seen.filter((l, i) => i === 0 || l !== seen[i - 1]);
    expect(path).toEqual(order);
  });

  it("멀어지면 다시 평온해진다", () => {
    let tracker = createTracker();
    let glare = createGlareState();
    for (const boxes of hold([ME], MIN_SELF_AGE)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }
    for (const boxes of hold([ME, intruderAt(0.3)], 10)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }
    expect(glare.level).toBe("glare");

    // 자리를 뜬다 — 하강 지연 때문에 한 단계씩 천천히 내려온다
    for (const boxes of hold([ME], 80)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }
    expect(glare.level).toBe("idle");
  });

  it("코앞의 사람이 잠깐 안 잡혀도 바로 평온해지지 않는다", () => {
    let tracker = createTracker();
    let glare = createGlareState();
    for (const boxes of hold([ME], MIN_SELF_AGE)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }
    for (const boxes of hold([ME, intruderAt(0.3)], 10)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }

    // 상대가 고개를 돌려 0.4초 미검출 → 다시 잡힘
    for (const boxes of hold([ME], 4)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }
    expect(glare.level).toBe("glare");
  });

  it("내가 자리를 비우면 아무도 째려보지 않는다", () => {
    let tracker = createTracker();
    let glare = createGlareState();
    for (const boxes of hold([ME], MIN_SELF_AGE)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }
    // 내가 나가고 다른 사람만 코앞에 남는다. 그 사람을 나로 오인해 째려보면 안 된다.
    for (const boxes of hold([intruderAt(0.3)], 60)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }
    expect(glare.level).toBe("idle");
  });

  it("두 사람이 오면 가까운 쪽 거리로 판단한다", () => {
    let tracker = createTracker();
    let glare = createGlareState();
    for (const boxes of hold([ME], MIN_SELF_AGE)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }
    const far = { ...intruderAt(0.07), x: 0.8 };
    for (const boxes of hold([ME, far, intruderAt(0.26)], 10)) {
      ({ tracker, glare } = frame(tracker, glare, boxes));
    }
    expect(glare.level).toBe("glare");
  });
});
