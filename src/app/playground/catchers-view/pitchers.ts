/**
 * KBO 투수 프리셋.
 *
 * **구속과 구종 배합은 공개된 기록이다. 회전수와 회전축은 추정치다.**
 *
 * KBO에는 MLB Statcast 같은 공개 트래킹 데이터가 없다. 구단 안에는 있어도
 * 밖으로 안 나온다. 그래서 rpm·efficiency·tiltHours는 그 구종의 통상값에서
 * 가져와 투수별로 조금씩 조정한 값이고, 화면에도 그렇게 적어 둔다.
 * 이걸 숨기고 숫자만 띄우면 없는 데이터를 있는 척하는 게 된다.
 */

import { RUBBER_Z, kmhToMs, throwPitch, type PitchThrow, type ThrownPitch, type Vec3 } from "./flight";
import { randRange, type Rng } from "../_shared/random";

export type Handedness = "R" | "L";
export type PitchKind = "fastball" | "slider" | "curve" | "changeup";

/** 스트라이크존. 홈플레이트 폭 43.2cm, 높이는 평균 체격 기준 */
export const ZONE = { halfWidth: 0.216, bottom: 0.5, top: 1.1 } as const;

export interface PitchType {
  kind: PitchKind;
  label: string;
  /** 평균 구속 */
  kmh: number;
  rpm: number;
  /** 유효 회전 비율. 자이로 성분이 클수록 낮다 */
  efficiency: number;
  /** **우투 기준** 마그누스 방향(시계 문자판). 좌투는 mirrorTilt로 뒤집는다 */
  tiltHours: number;
  /** 배합 비중. 한 투수 안에서 합이 1이 되게 적는다 */
  share: number;
}

export interface Pitcher {
  id: string;
  name: string;
  team: string;
  hand: Handedness;
  blurb: string;
  /** 투구판에서 손이 앞으로 나오는 거리(m) */
  extension: number;
  /** 릴리스 높이(m) */
  releaseHeight: number;
  pitches: PitchType[];
}

/** 궤적선 색. 구종을 겹쳐 놓고 볼 때 이 색으로 구분한다 */
export const PITCH_COLOR: Record<PitchKind, [number, number, number]> = {
  fastball: [1.0, 0.36, 0.3],
  slider: [0.3, 0.76, 1.0],
  curve: [0.69, 0.42, 1.0],
  changeup: [1.0, 0.79, 0.3],
};

export const PITCH_COLOR_CSS: Record<PitchKind, string> = {
  fastball: "#ff5c4d",
  slider: "#4dc3ff",
  curve: "#b06cff",
  changeup: "#ffc94d",
};

/**
 * 좌투는 같은 구종이 좌우만 뒤집혀 휜다. 12시(위)와 6시(아래)는 그대로다.
 */
export function mirrorTilt(tiltHours: number): number {
  return (12 - tiltHours) % 12;
}

/**
 * 릴리스 지점.
 *
 * 투수는 포수를 마주 보므로 투수의 오른손은 포수가 볼 때 왼쪽(-x)에 있다.
 * 우투 포심이 우타자 쪽으로 흐르는 것과 부호가 맞아떨어진다.
 */
export function releasePoint(pitcher: Pitcher): Vec3 {
  const side = 0.35;
  return {
    x: pitcher.hand === "R" ? -side : side,
    y: pitcher.releaseHeight,
    z: RUBBER_Z - pitcher.extension,
  };
}

export const PITCHERS: Pitcher[] = [
  {
    id: "an-woojin",
    name: "안우진",
    team: "키움",
    hand: "R",
    blurb: "국내 최고 구속과 각 큰 슬라이더. 포심만 봐도 손이 안 나간다.",
    extension: 2.0,
    releaseHeight: 1.9,
    pitches: [
      { kind: "fastball", label: "포심", kmh: 152, rpm: 2350, efficiency: 0.95, tiltHours: 11, share: 0.5 },
      { kind: "slider", label: "슬라이더", kmh: 140, rpm: 2450, efficiency: 0.35, tiltHours: 4, share: 0.28 },
      { kind: "curve", label: "커브", kmh: 126, rpm: 2650, efficiency: 0.6, tiltHours: 6.5, share: 0.1 },
      { kind: "changeup", label: "체인지업", kmh: 137, rpm: 1800, efficiency: 0.75, tiltHours: 10, share: 0.12 },
    ],
  },
  {
    id: "moon-dongju",
    name: "문동주",
    team: "한화",
    hand: "R",
    blurb: "2023년 160.1km/h. 국내 투수 공식 최고 구속을 찍은 팔이다.",
    extension: 2.05,
    releaseHeight: 1.88,
    pitches: [
      { kind: "fastball", label: "포심", kmh: 153, rpm: 2300, efficiency: 0.94, tiltHours: 11, share: 0.55 },
      { kind: "curve", label: "커브", kmh: 130, rpm: 2600, efficiency: 0.62, tiltHours: 6.5, share: 0.27 },
      { kind: "slider", label: "슬라이더", kmh: 143, rpm: 2350, efficiency: 0.34, tiltHours: 4, share: 0.18 },
    ],
  },
  {
    id: "ko-wooseok",
    name: "고우석",
    team: "마무리",
    hand: "R",
    blurb: "9회에 나와 두 개만 던진다. 빠른 공과 슬라이더, 그게 전부다.",
    extension: 1.9,
    releaseHeight: 1.78,
    pitches: [
      { kind: "fastball", label: "포심", kmh: 152, rpm: 2400, efficiency: 0.95, tiltHours: 11.2, share: 0.62 },
      { kind: "slider", label: "슬라이더", kmh: 140, rpm: 2500, efficiency: 0.33, tiltHours: 4, share: 0.38 },
    ],
  },
  {
    id: "won-taein",
    name: "원태인",
    team: "삼성",
    hand: "R",
    blurb: "구속으로 누르지 않는다. 같은 팔에서 네 가지가 나온다.",
    extension: 1.95,
    releaseHeight: 1.8,
    pitches: [
      { kind: "fastball", label: "포심", kmh: 145, rpm: 2280, efficiency: 0.94, tiltHours: 11, share: 0.42 },
      { kind: "changeup", label: "체인지업", kmh: 133, rpm: 1750, efficiency: 0.72, tiltHours: 10, share: 0.24 },
      { kind: "slider", label: "슬라이더", kmh: 135, rpm: 2350, efficiency: 0.36, tiltHours: 4, share: 0.22 },
      { kind: "curve", label: "커브", kmh: 122, rpm: 2600, efficiency: 0.6, tiltHours: 6.5, share: 0.12 },
    ],
  },
  {
    id: "kim-kwanghyun",
    name: "김광현",
    team: "SSG",
    hand: "L",
    blurb: "좌투. 슬라이더가 포수 기준 반대로 휜다 — 좌우가 뒤집히는 걸 보라.",
    extension: 1.98,
    releaseHeight: 1.75,
    pitches: [
      { kind: "fastball", label: "포심", kmh: 144, rpm: 2320, efficiency: 0.93, tiltHours: 11, share: 0.48 },
      { kind: "slider", label: "슬라이더", kmh: 133, rpm: 2450, efficiency: 0.38, tiltHours: 4, share: 0.36 },
      { kind: "curve", label: "커브", kmh: 120, rpm: 2600, efficiency: 0.6, tiltHours: 6.5, share: 0.16 },
    ],
  },
  {
    id: "yang-hyeonjong",
    name: "양현종",
    team: "KIA",
    hand: "L",
    blurb: "좌투. 구속은 셋 중 가장 느린데 체인지업이 그 차이를 만든다.",
    extension: 1.92,
    releaseHeight: 1.72,
    pitches: [
      { kind: "fastball", label: "포심", kmh: 142, rpm: 2250, efficiency: 0.92, tiltHours: 11, share: 0.44 },
      { kind: "changeup", label: "체인지업", kmh: 128, rpm: 1700, efficiency: 0.72, tiltHours: 10, share: 0.28 },
      { kind: "slider", label: "슬라이더", kmh: 133, rpm: 2300, efficiency: 0.36, tiltHours: 4, share: 0.18 },
      { kind: "curve", label: "커브", kmh: 118, rpm: 2550, efficiency: 0.58, tiltHours: 6.5, share: 0.1 },
    ],
  },
];

export function findPitcher(id: string): Pitcher {
  return PITCHERS.find((p) => p.id === id) ?? PITCHERS[0];
}

/**
 * 배합 비중대로 구종을 뽑되 **같은 구종이 세 번 연속 나오지 않게** 한다.
 * 포심 비중이 절반을 넘는 투수는 그냥 뽑으면 포심만 다섯 개가 이어진다.
 */
export function pickSequence(pitcher: Pitcher, count: number, rng: Rng): PitchType[] {
  const sequence: PitchType[] = [];
  const total = pitcher.pitches.reduce((sum, p) => sum + p.share, 0);

  while (sequence.length < count) {
    const blocked =
      sequence.length >= 2 &&
      sequence.at(-1)!.kind === sequence.at(-2)!.kind &&
      pitcher.pitches.length > 1
        ? sequence.at(-1)!.kind
        : null;

    const pool = pitcher.pitches.filter((p) => p.kind !== blocked);
    const poolTotal = blocked === null ? total : pool.reduce((sum, p) => sum + p.share, 0);

    let roll = rng() * poolTotal;
    let chosen = pool[pool.length - 1];
    for (const pitch of pool) {
      roll -= pitch.share;
      if (roll <= 0) {
        chosen = pitch;
        break;
      }
    }
    sequence.push(chosen);
  }

  return sequence;
}

/**
 * 조준점. 존 안이 기본이지만 가장자리를 물고 살짝 빠지기도 한다 —
 * 전부 한가운데로 오면 변화구가 왜 무서운지가 안 보인다.
 */
export function pickTarget(pitch: PitchType, hand: Handedness, rng: Rng): { x: number; y: number } {
  // 변화구는 존 아래쪽, 포심은 위쪽을 겨눈다
  const high = pitch.kind === "fastball";
  const y = high
    ? randRange(rng, ZONE.top - 0.15, ZONE.top + 0.12)
    : randRange(rng, ZONE.bottom - 0.1, ZONE.bottom + 0.25);

  // 휘어 나가는 쪽 가장자리를 문다. 우투는 글러브 쪽이 포수 기준 오른쪽
  const away = hand === "R" ? 1 : -1;
  const bias = pitch.kind === "fastball" ? 0 : away * 0.12;
  const x = bias + randRange(rng, -ZONE.halfWidth, ZONE.halfWidth);

  return { x, y };
}

export interface PitchPlan {
  pitcher: Pitcher;
  type: PitchType;
  /** 이번 공의 실제 구속(km/h). 평균에서 조금 흔들린다 */
  kmh: number;
  rpm: number;
  target: { x: number; y: number };
}

/** 평균값을 그대로 반복하면 기계 같다. 매 공마다 조금씩 흔든다 */
export function planPitch(pitcher: Pitcher, type: PitchType, rng: Rng): PitchPlan {
  return {
    pitcher,
    type,
    kmh: Math.round(type.kmh + randRange(rng, -2.5, 2.5)),
    rpm: Math.round(type.rpm + randRange(rng, -120, 120)),
    target: pickTarget(type, pitcher.hand, rng),
  };
}

export function toThrow(plan: PitchPlan): PitchThrow {
  const tilt =
    plan.pitcher.hand === "R" ? plan.type.tiltHours : mirrorTilt(plan.type.tiltHours);
  return {
    release: releasePoint(plan.pitcher),
    speed: kmhToMs(plan.kmh),
    target: plan.target,
    spin: { rpm: plan.rpm, efficiency: plan.type.efficiency, tiltHours: tilt },
  };
}

export function throwPlan(plan: PitchPlan): ThrownPitch {
  return throwPitch(toThrow(plan));
}
