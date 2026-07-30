import { describe, it, expect } from "vitest";
import {
  MAX_MISSES,
  MIN_SELF_AGE,
  createTracker,
  intruderTrack,
  iou,
  lookDirection,
  selfTrack,
  stepTracker,
  type Box,
  type TrackerState,
} from "./detect";

const box = (x: number, y: number, w: number, h: number): Box => ({ x, y, w, h });

/** 내 얼굴: 화면 왼쪽, 60cm 거리라 크다 */
const ME = box(0.1, 0.3, 0.25, 0.4);
/** 다가온 사람: 화면 오른쪽 */
const OTHER = box(0.6, 0.3, 0.12, 0.16);

function run(state: TrackerState, frames: Box[][]): TrackerState {
  let s = state;
  for (const boxes of frames) s = stepTracker(s, boxes);
  return s;
}

/** 두 박스 사이를 t(0~1)만큼 보간한다. 사람이 서서히 움직이는 상황을 만든다. */
function lerpBox(a: Box, b: Box, t: number): Box {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    w: a.w + (b.w - a.w) * t,
    h: a.h + (b.h - a.h) * t,
  };
}

/** 같은 박스 배열을 n프레임 먹인다 */
function hold(state: TrackerState, boxes: Box[], n: number): TrackerState {
  return run(
    state,
    Array.from({ length: n }, () => boxes),
  );
}

describe("iou", () => {
  it("자기 자신은 1이다", () => {
    expect(iou(ME, ME)).toBeCloseTo(1, 10);
  });

  it("안 겹치면 0이다", () => {
    expect(iou(ME, OTHER)).toBe(0);
  });

  it("절반 겹치면 1/3이다", () => {
    // 넓이 1인 정사각형 둘이 절반 겹침 → 교집합 0.5, 합집합 1.5
    expect(iou(box(0, 0, 1, 1), box(0.5, 0, 1, 1))).toBeCloseTo(1 / 3, 10);
  });
});

describe("트랙 수명", () => {
  it("같은 자리에 계속 있으면 age가 쌓인다", () => {
    const s = hold(createTracker(), [ME], 10);
    expect(s.tracks).toHaveLength(1);
    expect(s.tracks[0].age).toBe(10);
  });

  it("검출이 몇 프레임 끊겨도 트랙과 age가 유지된다", () => {
    // 고개를 살짝 돌리거나 조명이 바뀌면 한두 프레임이 빈다.
    // 그때마다 트랙을 지우면 age가 리셋되고 누가 나인지가 흔들린다.
    let s = hold(createTracker(), [ME], 20);
    s = hold(s, [], 3);
    expect(s.tracks).toHaveLength(1);
    expect(s.tracks[0].age).toBe(20);

    s = stepTracker(s, [ME]);
    expect(s.tracks[0].age).toBe(21);
    expect(s.tracks[0].misses).toBe(0);
  });

  it("MAX_MISSES를 넘겨 안 잡히면 트랙이 사라진다", () => {
    let s = hold(createTracker(), [ME], 20);
    s = hold(s, [], MAX_MISSES);
    expect(s.tracks).toHaveLength(1);

    s = stepTracker(s, []);
    expect(s.tracks).toHaveLength(0);
  });

  it("겹치지 않는 새 박스는 새 트랙이 된다", () => {
    let s = hold(createTracker(), [ME], 5);
    s = stepTracker(s, [ME, OTHER]);
    expect(s.tracks).toHaveLength(2);
    expect(new Set(s.tracks.map((t) => t.id)).size).toBe(2);
  });
});

describe("누가 나인가", () => {
  it("MIN_SELF_AGE 전에는 아무도 나가 아니다", () => {
    const s = hold(createTracker(), [ME], MIN_SELF_AGE - 1);
    expect(selfTrack(s)).toBeNull();
  });

  it("MIN_SELF_AGE를 채우면 나로 확정된다", () => {
    const s = hold(createTracker(), [ME], MIN_SELF_AGE);
    expect(selfTrack(s)?.age).toBe(MIN_SELF_AGE);
  });

  it("기대도 나가 뒤집히지 않는다", () => {
    // 내가 등받이에 기대 박스가 작아지고, 상대가 화면 가까이 숙여 더 커진 상황.
    // 크기로 골랐다면 여기서 개바리가 나를 째려본다.
    let s = hold(createTracker(), [ME], MIN_SELF_AGE);
    const mine = selfTrack(s)!.id;

    // 기대는 것도 다가오는 것도 한 프레임에 벌어지지 않는다. 10프레임(1초)에 걸쳐 움직인다.
    const leaned = box(0.12, 0.35, 0.14, 0.18);
    const closer = box(0.6, 0.2, 0.3, 0.45);
    for (let i = 1; i <= 10; i += 1) {
      s = stepTracker(s, [lerpBox(ME, leaned, i / 10), lerpBox(OTHER, closer, i / 10)]);
    }
    s = hold(s, [leaned, closer], 10);

    expect(selfTrack(s)?.id).toBe(mine);
    expect(intruderTrack(s)?.box.h).toBe(closer.h);
  });

  it("지나가던 사람이 먼저 잡혀도 결국 내가 나가 된다", () => {
    // 앱을 켜자마자 누가 지나가면 그 사람이 먼저 age를 쌓을 수 있다.
    // MIN_SELF_AGE 자격 조건이 그걸 막는다.
    let s = createTracker();
    const passerby = box(0.6, 0.3, 0.12, 0.16);
    s = hold(s, [passerby], 10);
    s = hold(s, [passerby, ME], 10);
    expect(selfTrack(s)).toBeNull(); // 아직 아무도 자격 미달

    s = hold(s, [ME], MAX_MISSES + 1); // 지나가던 사람은 사라짐
    s = hold(s, [ME], MIN_SELF_AGE);
    expect(selfTrack(s)?.box.x).toBe(ME.x);
  });

  it("나가 자리를 비우면 나가 풀린다", () => {
    let s = hold(createTracker(), [ME], MIN_SELF_AGE);
    expect(selfTrack(s)).not.toBeNull();

    s = hold(s, [], MAX_MISSES + 1);
    expect(s.selfId).toBeNull();
    expect(selfTrack(s)).toBeNull();
  });

  it("한번 정해진 나는 age 비교와 무관하게 고정된다", () => {
    // 매 프레임 age 최대를 다시 뽑으면 검출이 한 번 튈 때마다 주인이 바뀐다.
    let s = hold(createTracker(), [ME], MIN_SELF_AGE);
    const mine = selfTrack(s)!.id;

    // 상대가 아주 오래 머물러 age가 내 트랙을 앞질러도 sticky여야 한다
    s = hold(s, [ME, OTHER], MIN_SELF_AGE * 3);
    expect(s.selfId).toBe(mine);
  });
});

describe("보는 방향", () => {
  const track = (b: Box) => ({ id: 1, box: b, age: 50, misses: 0 });

  it("프레임 왼쪽에 있으면 화면 왼쪽을 본다", () => {
    // 웹캠 원본은 거울이 아니다 — 내 오른쪽에 선 사람이 프레임 왼쪽에 찍히고,
    // 나를 마주 본 개바리가 내 오른쪽을 보려면 화면에서는 왼쪽을 봐야 한다
    expect(lookDirection(1, track(ME), track(box(0.05, 0.3, 0.12, 0.16)))).toBe(-1);
  });

  it("프레임 오른쪽에 있으면 화면 오른쪽을 본다", () => {
    expect(lookDirection(-1, track(ME), track(OTHER))).toBe(1);
  });

  it("바로 뒤에 서 있으면 방향을 안 바꾼다", () => {
    // 좌우로 떨리는 것을 막는 여유구간
    const behind = box(ME.x + 0.02, 0.2, ME.w, ME.h);
    expect(lookDirection(-1, track(ME), track(behind))).toBe(-1);
    expect(lookDirection(1, track(ME), track(behind))).toBe(1);
  });

  it("대상이 없으면 직전 방향을 유지한다", () => {
    // 잠깐 안 잡혔다고 고개를 정면으로 되돌리면 하강 지연을 둔 의미가 없다
    expect(lookDirection(-1, track(ME), null)).toBe(-1);
    expect(lookDirection(-1, null, track(OTHER))).toBe(-1);
  });

  it("경계를 확실히 넘으면 방향이 바뀐다", () => {
    let d = lookDirection(1, track(ME), track(box(0.05, 0.3, 0.12, 0.16)));
    expect(d).toBe(-1);
    d = lookDirection(d, track(ME), track(OTHER));
    expect(d).toBe(1);
  });
});

describe("침입자 선정", () => {
  it("나 혼자면 침입자가 없다", () => {
    const s = hold(createTracker(), [ME], MIN_SELF_AGE);
    expect(intruderTrack(s)).toBeNull();
  });

  it("나가 확정되기 전에는 아무도 째려보지 않는다", () => {
    // 틀린 대상을 째려보느니 아무것도 안 하는 쪽이 낫다
    const s = hold(createTracker(), [ME, OTHER], 5);
    expect(intruderTrack(s)).toBeNull();
  });

  it("나를 뺀 트랙 중 가장 큰 박스를 고른다", () => {
    let s = hold(createTracker(), [ME], MIN_SELF_AGE);
    const near = box(0.55, 0.2, 0.2, 0.3);
    const far = box(0.85, 0.4, 0.06, 0.08);
    s = hold(s, [ME, near, far], 3);
    expect(intruderTrack(s)?.box.h).toBe(near.h);
  });

  it("미검출 중인 트랙은 침입자로 안 뽑는다", () => {
    // 이미 화면 밖으로 나갔는데 유예 기간이라 남아 있는 트랙이다
    let s = hold(createTracker(), [ME], MIN_SELF_AGE);
    s = hold(s, [ME, OTHER], 5);
    expect(intruderTrack(s)).not.toBeNull();

    s = hold(s, [ME], 2);
    expect(intruderTrack(s)).toBeNull();
  });
});
