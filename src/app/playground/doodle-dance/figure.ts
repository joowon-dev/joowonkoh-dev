import type { Pose } from "./pose";

/**
 * 자세를 선 목록으로 바꾼다. 좌표는 골반을 원점으로 한 몸 공간이고 y는 위가 +다.
 * 잉크를 어떻게 얹을지는 draw.ts가 정하고, 여기서는 무엇을 그릴지만 정한다.
 */

export interface Pt {
  x: number;
  y: number;
}

export type Stroke =
  | { kind: "path"; pts: Pt[]; width: number; closed?: boolean }
  | { kind: "circle"; c: Pt; r: number; width: number };

const TORSO = 34;
const SHOULDER_HALF = 5.5;
const NECK = 6;
const HEAD_R = 15;
/** 치마 밑단은 골반보다 살짝 아래에 있다 */
const HEM_DROP = 1;
const HEM_HALF = 17;
const LEG = 30;
const FOOT_R = 3.5;
const UPPER_ARM = 11.5;
const FOREARM = 10.5;
const FINGER = 4.5;

/**
 * 몸 공간에서 그림이 차지하는 위·아래 한계. 카메라가 이 범위를 화면에 맞춘다.
 * 골반이 들썩이는 폭까지 더해 둬야 신나게 뛸 때 발이 화면 밖으로 나가지 않는다.
 */
const BOUNCE_ROOM = 5;
export const FIGURE_TOP = TORSO + NECK + HEAD_R * 2 + BOUNCE_ROOM + 5;
export const FIGURE_BOTTOM = -(HEM_DROP + LEG + FOOT_R * 2 + BOUNCE_ROOM);

const LINE = 2.1;
const THIN = 1.5;

function add(a: Pt, b: Pt): Pt {
  return { x: a.x + b.x, y: a.y + b.y };
}

function mul(a: Pt, s: number): Pt {
  return { x: a.x * s, y: a.y * s };
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

/** 한쪽 팔. side는 오른쪽이 +1. */
function arm(shoulder: Pt, lean: number, side: number, raise: number, elbowBend: number): Stroke[] {
  // 팔은 몸통 아래 방향에서 시작해 벌어진 각만큼 바깥으로 돈다
  const a = lean + side * (Math.PI - raise);
  const elbow = add(shoulder, mul(up(a), UPPER_ARM));
  const aF = a - side * elbowBend;
  const hand = add(elbow, mul(up(aF), FOREARM));
  // 손끝은 팔뚝의 굽은 방향을 조금 더 이어 그린 짧은 선. 원본의 가리키는 손가락.
  const finger = add(hand, mul(up(aF - side * elbowBend * 0.6), FINGER));
  return [
    { kind: "path", pts: [shoulder, elbow, hand], width: LINE },
    { kind: "path", pts: [hand, finger], width: THIN },
  ];
}

/** 한쪽 다리. side는 오른쪽이 +1, lift는 0~1. */
function leg(top: Pt, tilt: number, side: number, lift: number): Stroke[] {
  const down = mul(up(tilt), -1);
  const out = mul(right(tilt), side);
  const length = LEG * (1 - lift * 0.3);
  const knee = add(add(top, mul(down, length * 0.55)), mul(out, 2 + lift * 5));
  const ankle = add(add(knee, mul(down, length * 0.45)), mul(out, lift * 5));
  const foot = add(ankle, mul(down, FOOT_R));
  return [
    { kind: "path", pts: [top, knee, ankle], width: LINE },
    { kind: "circle", c: foot, r: FOOT_R, width: THIN },
  ];
}

/**
 * 양갈래 한 쪽. 머리 옆에 붙은 둥근 덩이 하나로 그린다.
 * 표본점이 적으면 곡선이 눌려 잎사귀처럼 보이므로 넉넉히 찍는다.
 */
function pigtail(head: Pt, headAngle: number, side: number, swing: number): Stroke[] {
  // 정수리에서 70° 정도 내려온, 거의 옆통수에 묶는다
  const attachA = headAngle + side * 1.25;
  const attach = add(head, mul(up(attachA), HEAD_R - 0.5));
  const a = attachA + swing * 1.2;
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
    pts: [
      local(head, a, lx - 2.6, 2.6),
      local(head, a, lx, 1.4),
      local(head, a, lx + 2.6, 2.6),
    ],
    width: THIN,
  };
}

export function figureStrokes(pose: Pose): Stroke[] {
  const hip: Pt = { x: pose.hipX, y: pose.hipY };
  const lean = pose.lean;
  const hemTilt = lean + pose.skirtSwing;
  const headAngle = lean + pose.headTilt;

  const shoulderMid = add(hip, mul(up(lean), TORSO));
  const shoulderL = add(shoulderMid, mul(right(lean), -SHOULDER_HALF));
  const shoulderR = add(shoulderMid, mul(right(lean), SHOULDER_HALF));
  const neckTop = add(shoulderMid, mul(up(lean), NECK));
  const headC = add(neckTop, mul(up(headAngle), HEAD_R));

  const hemMid = add(hip, mul(up(hemTilt), -HEM_DROP));
  const hemL = add(hemMid, mul(right(hemTilt), -HEM_HALF));
  const hemR = add(hemMid, mul(right(hemTilt), HEM_HALF));
  // 밑단은 직선이 아니라 아래로 조금 처진다
  const hemSag = add(hemMid, mul(up(hemTilt), -2.5));

  const strokes: Stroke[] = [
    { kind: "circle", c: headC, r: HEAD_R, width: LINE },
    // 앞머리: 머리 안쪽을 지나는 동심 호. 현이 부풀어도 윤곽선을 넘지 않게
    // 반지름을 넉넉히 줄여 둔다.
    {
      kind: "path",
      pts: [-1.25, -0.8, -0.35, 0.15, 0.6, 1.15].map((t) =>
        add(headC, mul(up(headAngle + t), HEAD_R - 3.5)),
      ),
      width: THIN,
    },
    eye(headC, headAngle, -5.5),
    eye(headC, headAngle, 5.5),
    // 입: 아주 짧은 선
    {
      kind: "path",
      pts: [local(headC, headAngle, -2.5, -6), local(headC, headAngle, 2.5, -6.5)],
      width: THIN,
    },
    ...pigtail(headC, headAngle, -1, pose.tailL),
    ...pigtail(headC, headAngle, 1, pose.tailR),
    { kind: "path", pts: [neckTop, shoulderMid], width: LINE },
    // 원피스 외곽선
    { kind: "path", pts: [shoulderL, hemL, hemSag, hemR, shoulderR], width: LINE },
    // 목선
    { kind: "path", pts: [shoulderL, shoulderMid, shoulderR], width: THIN },
    ...arm(shoulderL, lean, -1, pose.armL, pose.elbowL),
    ...arm(shoulderR, lean, 1, pose.armR, pose.elbowR),
  ];

  const liftR = Math.max(0, pose.legLift);
  const liftL = Math.max(0, -pose.legLift);
  strokes.push(...leg(add(hemMid, mul(right(hemTilt), -4.5)), hemTilt, -1, liftL));
  strokes.push(...leg(add(hemMid, mul(right(hemTilt), 4.5)), hemTilt, 1, liftR));
  return strokes;
}
