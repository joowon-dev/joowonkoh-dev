/**
 * 얼굴 박스 트래킹과 "누가 나인가" 판정.
 *
 * 이 파일은 카메라도 DOM도 모른다. 정규화된 박스 배열과 이전 상태만 받아 다음 상태를 낸다.
 * 신원 식별은 하지 않는다 — 다루는 값은 좌표와 개수뿐이다.
 */

/** 프레임 크기로 나눈 정규화 좌표(0~1). 좌상단 기준. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Track {
  id: number;
  box: Box;
  /** 연속으로 살아 있던 프레임 수. 미검출로 끊긴 동안에도 리셋하지 않는다. */
  age: number;
  /** 연속 미검출 프레임 수 */
  misses: number;
}

export interface TrackerState {
  tracks: Track[];
  nextId: number;
  /** 나로 확정된 트랙 id. 확정 전이거나 그 트랙이 사라지면 null */
  selfId: number | null;
}

/** 이 값을 넘으면 같은 사람으로 본다 */
export const IOU_MATCH = 0.3;
/** 이만큼 연속 미검출이면 트랙을 지운다. 검출이 한두 프레임 비는 건 흔하다. */
export const MAX_MISSES = 5;
/** 나로 인정받는 데 필요한 최소 age(프레임). 10fps 기준 3초. */
export const MIN_SELF_AGE = 30;

export function createTracker(): TrackerState {
  return { tracks: [], nextId: 1, selfId: null };
}

export function iou(a: Box, b: Box): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  if (inter <= 0) return 0;
  const union = a.w * a.h + b.w * b.h - inter;
  return union > 0 ? inter / union : 0;
}

/**
 * 이번 프레임 박스들로 트래커를 한 스텝 진행시킨다. 이전 상태를 건드리지 않고 새 상태를 만든다.
 *
 * 매칭은 IoU 그리디 — 사람은 10fps 사이에 몇 픽셀밖에 못 움직여서 박스가 충분히 겹친다.
 * 칼만 필터 같은 것은 필요 없다.
 */
export function stepTracker(prev: TrackerState, boxes: Box[]): TrackerState {
  const usedBox = new Set<number>();
  const next: Track[] = [];

  // age가 큰 트랙부터 짝을 고른다. 오래 있던 사람(=나)이 먼저 자기 박스를 가져가야
  // 새로 들어온 사람과 박스가 겹칠 때 주인이 안 바뀐다.
  const ordered = [...prev.tracks].sort((a, b) => b.age - a.age);

  for (const track of ordered) {
    let best = -1;
    let bestIou = IOU_MATCH;
    for (let i = 0; i < boxes.length; i += 1) {
      if (usedBox.has(i)) continue;
      const score = iou(track.box, boxes[i]);
      if (score > bestIou) {
        bestIou = score;
        best = i;
      }
    }

    if (best >= 0) {
      usedBox.add(best);
      next.push({ id: track.id, box: boxes[best], age: track.age + 1, misses: 0 });
      continue;
    }

    // 미검출. age는 그대로 둔다 — 여기서 리셋하면 고개 한 번 돌릴 때마다
    // "누가 나인가"가 흔들린다.
    const misses = track.misses + 1;
    if (misses <= MAX_MISSES) {
      next.push({ id: track.id, box: track.box, age: track.age, misses });
    }
  }

  let nextId = prev.nextId;
  for (let i = 0; i < boxes.length; i += 1) {
    if (usedBox.has(i)) continue;
    next.push({ id: nextId, box: boxes[i], age: 1, misses: 0 });
    nextId += 1;
  }

  return { tracks: next, nextId, selfId: pickSelfId(prev.selfId, next) };
}

/**
 * 나를 고르는 규칙. 크기가 아니라 지속성으로 고른다 —
 * 등받이에 기대면 내 박스가 작아지고, 상대가 화면 쪽으로 숙이면 상대가 더 커진다.
 * 기대든 숙이든 프레임에 계속 있었던 건 나뿐이므로 age는 항상 내가 최대다.
 */
function pickSelfId(prevSelfId: number | null, tracks: Track[]): number | null {
  // 한번 정해지면 그 트랙이 살아 있는 동안 고정. 매 프레임 age를 다시 비교하면
  // 검출이 한 번 튈 때마다 주인이 바뀐다.
  if (prevSelfId !== null && tracks.some((t) => t.id === prevSelfId)) return prevSelfId;

  let best: Track | null = null;
  for (const t of tracks) {
    if (t.age < MIN_SELF_AGE) continue;
    if (!best || t.age > best.age) best = t;
  }
  return best ? best.id : null;
}

/** 나로 확정된 트랙. MIN_SELF_AGE를 넘긴 트랙이 아직 없으면 null. */
export function selfTrack(s: TrackerState): Track | null {
  if (s.selfId === null) return null;
  return s.tracks.find((t) => t.id === s.selfId) ?? null;
}

/** 눈이 보는 곳. 가운데가 0, 좌우·위아래 끝이 ±1인 연속값. */
export interface Gaze {
  x: number;
  y: number;
}

export const CENTER_GAZE: Gaze = { x: 0, y: 0 };

/**
 * 프레임 끝까지 안 가도 눈이 끝까지 돌게 하는 배율. 1이면 화면 가장자리에
 * 붙어야 눈이 다 돌아가는데, 실제로는 그 전에 프레임을 벗어난다.
 */
export const GAZE_GAIN = 1.35;

/**
 * 한 프레임에 목표 지점으로 다가가는 비율. 1이면 검출 박스가 떠는 대로 눈도 떤다.
 * 10fps에서 0.45면 두세 프레임 만에 따라붙으면서 떨림은 눌린다.
 */
export const GAZE_SMOOTHING = 0.45;

/** 눈이 다 돌아간 뒤로는 더 갈 곳이 없다 */
const clamp1 = (v: number): number => Math.min(1, Math.max(-1, v));

/**
 * 침입자를 눈으로 따라간다. 매 프레임 목표 지점 쪽으로 조금씩 다가가므로,
 * 사람이 움직이면 눈이 끊기지 않고 쫓아간다.
 *
 * 웹캠 원본 프레임은 거울이 아니다 — 내 오른쪽에 선 사람은 프레임 왼쪽에 찍힌다.
 * 눈은 나를 마주 보고 있으므로, 내 오른쪽을 보려면 화면에서는 왼쪽을 봐야 한다.
 * 결국 프레임에서의 좌표가 그대로 화면에서의 좌표가 된다. 위아래는 뒤집을 것이 없다.
 *
 * @param prev 직전 시선. 대상이 없으면 그대로 둔다 — 잠깐 안 잡혔다고 눈이
 *             정면으로 되돌아가면 하강 지연을 둔 의미가 없다.
 */
export function trackGaze(prev: Gaze, intruder: Track | null): Gaze {
  if (!intruder) return prev;
  const b = intruder.box;
  const tx = clamp1((b.x + b.w / 2 - 0.5) * 2 * GAZE_GAIN);
  const ty = clamp1((b.y + b.h / 2 - 0.5) * 2 * GAZE_GAIN);
  return {
    x: prev.x + (tx - prev.x) * GAZE_SMOOTHING,
    y: prev.y + (ty - prev.y) * GAZE_SMOOTHING,
  };
}

/**
 * 째려볼 대상 — 나를 제외한 트랙 중 박스가 가장 큰 것.
 * 여기서는 크기를 써도 된다. "나"라는 기준점이 이미 고정돼 있으므로,
 * 남은 사람들 중 가까운 쪽이 곧 나에게 볼일이 있는 쪽이다.
 *
 * 나가 확정되지 않았으면 아무도 고르지 않는다 — 틀린 대상을 째려보느니 가만히 있는 게 낫다.
 */
export function intruderTrack(s: TrackerState): Track | null {
  if (s.selfId === null) return null;

  let best: Track | null = null;
  for (const t of s.tracks) {
    if (t.id === s.selfId) continue;
    // 미검출 중인 트랙은 대상에서 뺀다. 이미 화면 밖으로 나간 사람일 수 있다.
    if (t.misses > 0) continue;
    if (!best || t.box.h > best.box.h) best = t;
  }
  return best;
}

/**
 * 째려볼 대상.
 *
 * 원래 규칙은 얼굴이 1개 이하면 아무 판단도 하지 않는 것이다 — 내가 자리를 비운 사이
 * 남은 사람을 나로 오인해 째려보느니 가만히 있는 쪽이 낫다. 다만 혼자 시험해 볼 때는
 * 그 규칙 때문에 아무 일도 안 일어나므로, solo면 나를 대상으로 삼는다.
 */
export function targetTrack(s: TrackerState, solo: boolean): Track | null {
  const other = intruderTrack(s);
  if (other) return other;
  return solo ? selfTrack(s) : null;
}
