/**
 * 자세를 선 목록으로 바꾼다. 좌표는 골반을 원점으로 한 몸 공간이고 y는 위가 +다.
 * 잉크를 어떻게 얹을지는 draw.ts가 정하고, 여기서는 무엇을 그릴지만 정한다.
 *
 * 자세는 관절 각도가 아니라 끝점(머리·손·발)으로 들어온다. 원본 영상에서 읽어낼 수
 * 있었던 것이 끝점이기 때문이다. 팔꿈치와 무릎은 여기서 역기구학으로 채운다.
 */

export interface Pt {
  x: number;
  y: number;
}

export interface Pose {
  /** 골반 기준 머리 중심 */
  head: Pt;
  /** 머리 회전(rad, +가 시계방향) */
  roll: number;
  handL: Pt;
  handR: Pt;
  footL: Pt;
  footR: Pt;
}

export type Stroke =
  | { kind: "path"; pts: Pt[]; width: number; closed?: boolean }
  | { kind: "circle"; c: Pt; r: number; width: number };

const SHOULDER_HALF = 5.5;
/** 원본 프레임에서 잰 머리 반지름. 이 인형은 머리가 몸에 비해 크다. */
const HEAD_R = 17.5;
/**
 * 어깨는 턱 바로 아래에 붙인다. 골반→머리 거리의 몇 %로 잡으면 그녀가 목을 길게
 * 빼는 자세에서 어깨가 같이 내려가 버리고, 그러면 얼굴 옆으로 든 손까지 팔이
 * 위로 비스듬히 뻗은 발레 자세처럼 그려진다.
 */
const NECK = 3;
/** 치마 밑단은 골반보다 살짝 아래에 있다 */
const HEM_DROP = 1;
const HEM_HALF = 19;
const LEG_ATTACH = 4.5;
const FOOT_R = 3.5;
const UPPER_ARM = 13;
const FOREARM = 12;
const FINGER = 4.5;
const THIGH = 16;
const SHIN = 15;

/**
 * 몸 공간에서 그림이 차지하는 상자. 카메라가 이 범위를 화면에 맞춘다.
 * 모든 자세를 실제로 그려 재어 본 범위(x -63.4~52.0, y -42.9~86.9)에 여유를 조금 더한 값이다.
 * 넓게 잡으면 인물이 화면에서 작아지고 한쪽으로 쏠려 보인다.
 * 원본 안무에서 그녀는 왼쪽으로 훨씬 멀리 손을 뻗기 때문에 좌우가 대칭이 아니다.
 * 테스트가 모든 자세가 이 상자 안에 있는지 확인한다.
 */
export const FIGURE_LEFT = -66;
export const FIGURE_RIGHT = 55;
export const FIGURE_TOP = 90;
export const FIGURE_BOTTOM = -46;

const LINE = 2.1;
const THIN = 1.5;

function add(a: Pt, b: Pt): Pt {
  return { x: a.x + b.x, y: a.y + b.y };
}

function sub(a: Pt, b: Pt): Pt {
  return { x: a.x - b.x, y: a.y - b.y };
}

function mul(a: Pt, s: number): Pt {
  return { x: a.x * s, y: a.y * s };
}

function len(a: Pt): number {
  return Math.hypot(a.x, a.y);
}

function norm(a: Pt): Pt {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
}

/** 각 a로 기운 "위" 방향. a가 +면 오른쪽으로 기운다. */
function up(a: number): Pt {
  return { x: Math.sin(a), y: Math.cos(a) };
}

/** 각 a로 기운 "오른쪽" 방향 */
function right(a: number): Pt {
  return { x: Math.cos(a), y: -Math.sin(a) };
}

/** 각 a로 기운 국소 좌표(lx, ly)를 몸 공간으로 옮긴다 */
function local(origin: Pt, a: number, lx: number, ly: number): Pt {
  return add(origin, add(mul(right(a), lx), mul(up(a), ly)));
}

/**
 * a에서 b까지 두 마디로 잇는 중간 관절 위치. side는 관절이 꺾이는 쪽(+1/-1).
 * 두 마디를 이어도 b에 닿지 못하면 마디를 늘여서라도 닿게 한다 — 팔 길이를 지키는
 * 것보다 손이 원본이 가리킨 자리에 있는 것이 중요하다.
 */
function joint(a: Pt, b: Pt, l1: number, l2: number, side: number): Pt {
  const d = len(sub(b, a));
  let s1 = l1;
  let s2 = l2;
  if (d > s1 + s2) {
    const k = d / (s1 + s2);
    s1 *= k;
    s2 *= k;
  } else if (d < Math.abs(s1 - s2) + 0.001) {
    const k = (Math.abs(s1 - s2) + 0.001) / Math.max(0.001, d);
    s1 /= k;
    s2 /= k;
  }
  const dir = norm(sub(b, a));
  const cos = Math.max(-1, Math.min(1, (d * d + s1 * s1 - s2 * s2) / (2 * Math.max(0.001, d) * s1)));
  const angle = Math.acos(cos) * side;
  const rotated = {
    x: dir.x * Math.cos(angle) - dir.y * Math.sin(angle),
    y: dir.x * Math.sin(angle) + dir.y * Math.cos(angle),
  };
  return add(a, mul(rotated, s1));
}

/** 한쪽 팔. 팔꿈치는 몸 바깥으로 꺾는다. */
function arm(shoulder: Pt, hand: Pt, side: number): Stroke[] {
  const elbow = joint(shoulder, hand, UPPER_ARM, FOREARM, -side);
  const dir = norm(sub(hand, elbow));
  // 손끝은 팔뚝을 조금 더 이어 그린 짧은 선. 원본의 가리키는 손가락.
  const finger = add(hand, mul(dir, FINGER));
  return [
    { kind: "path", pts: [shoulder, elbow, hand], width: LINE },
    { kind: "path", pts: [hand, finger], width: THIN },
  ];
}

/** 한쪽 다리. 무릎은 몸 바깥으로 꺾는다. */
function leg(hipPt: Pt, foot: Pt, side: number): Stroke[] {
  const knee = joint(hipPt, foot, THIGH, SHIN, -side);
  const ankleDir = norm(sub(foot, knee));
  const ankle = sub(foot, mul(ankleDir, FOOT_R));
  return [
    { kind: "path", pts: [hipPt, knee, ankle], width: LINE },
    { kind: "circle", c: foot, r: FOOT_R, width: THIN },
  ];
}

/** 양갈래 한 쪽. 머리 옆에 붙은 둥근 덩이 하나. */
function pigtail(head: Pt, roll: number, side: number): Stroke[] {
  const a = roll + side * 1.25;
  const attach = add(head, mul(up(a), HEAD_R - 0.5));
  const center = add(attach, mul(up(a), 5.5));
  const lobe: Pt[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = (i / 14) * Math.PI * 2;
    lobe.push(add(center, add(mul(up(a), Math.cos(t) * 5), mul(right(a), Math.sin(t) * 4.2))));
  }
  return [
    { kind: "path", pts: [attach, add(attach, mul(up(a), 2.5))], width: THIN },
    { kind: "path", pts: lobe, width: THIN, closed: true },
  ];
}

/** 감은 눈 하나. 아래로 살짝 휜 짧은 선. */
function eye(head: Pt, a: number, lx: number): Stroke {
  return {
    kind: "path",
    pts: [local(head, a, lx - 2.6, 2.6), local(head, a, lx, 1.4), local(head, a, lx + 2.6, 2.6)],
    width: THIN,
  };
}

export function figureStrokes(pose: Pose): Stroke[] {
  const hip: Pt = { x: 0, y: 0 };
  const headC = pose.head;
  // 몸통 축은 골반에서 머리로 향하는 선. 원본에서 그녀는 이 축을 크게 눕히며 춘다.
  const axis = norm(headC);
  const lean = Math.atan2(axis.x, axis.y);
  const perp = right(lean);

  const shoulderMid = sub(headC, mul(axis, HEAD_R + NECK));
  const shoulderL = add(shoulderMid, mul(perp, -SHOULDER_HALF));
  const shoulderR = add(shoulderMid, mul(perp, SHOULDER_HALF));
  const neckTop = sub(headC, mul(axis, HEAD_R - 0.5));

  const hemMid = add(hip, mul(axis, -HEM_DROP));
  const hemL = add(hemMid, mul(perp, -HEM_HALF));
  const hemR = add(hemMid, mul(perp, HEM_HALF));
  // 밑단은 직선이 아니라 아래로 조금 처진다
  const hemSag = add(hemMid, mul(axis, -2.5));

  const roll = pose.roll;
  return [
    { kind: "circle", c: headC, r: HEAD_R, width: LINE },
    // 앞머리: 머리 안쪽을 지나는 동심 호. 현이 부풀어도 윤곽선을 넘지 않게
    // 반지름을 넉넉히 줄여 둔다.
    {
      kind: "path",
      pts: [-1.25, -0.8, -0.35, 0.15, 0.6, 1.15].map((t) =>
        add(headC, mul(up(roll + t), HEAD_R - 3.5)),
      ),
      width: THIN,
    },
    eye(headC, roll, -5.5),
    eye(headC, roll, 5.5),
    // 입: 아주 짧은 선
    {
      kind: "path",
      pts: [local(headC, roll, -2.5, -6), local(headC, roll, 2.5, -6.5)],
      width: THIN,
    },
    ...pigtail(headC, roll, -1),
    ...pigtail(headC, roll, 1),
    { kind: "path", pts: [neckTop, shoulderMid], width: LINE },
    // 원피스 외곽선
    { kind: "path", pts: [shoulderL, hemL, hemSag, hemR, shoulderR], width: LINE },
    // 목선
    { kind: "path", pts: [shoulderL, shoulderMid, shoulderR], width: THIN },
    ...arm(shoulderL, pose.handL, -1),
    ...arm(shoulderR, pose.handR, 1),
    ...leg(add(hemMid, mul(perp, -LEG_ATTACH)), pose.footL, -1),
    ...leg(add(hemMid, mul(perp, LEG_ATTACH)), pose.footR, 1),
  ];
}
