/**
 * 한 투구의 시간표.
 *
 * 와인드업 → 실시간 → 미트 → 슬로모션 리플레이 → 잠깐 쉼. 이 순서와 길이를
 * 컴포넌트 안에 두면 «지금 몇 초인가»를 눈으로 확인할 방법이 없어서 따로 뺐다.
 *
 * 실시간 구간에는 자막을 안 띄운다. 0.4초짜리 공에 글씨를 얹으면 글씨를 읽다
 * 공을 놓친다 — 설명은 리플레이가 한다.
 */

export type Phase = "windup" | "live" | "mitt" | "replay" | "rest";

/** 리플레이 배속. 0.4초를 2.7초로 늘려 본다 */
export const REPLAY_SPEED = 0.15;

const WINDUP = 0.9;
const MITT = 0.5;
const REST = 1.1;

export interface Timeline {
  windupEnd: number;
  liveEnd: number;
  mittEnd: number;
  replayEnd: number;
  /** 다음 공까지 */
  total: number;
  /** 이 공의 실제 비행 시간 */
  flightDuration: number;
}

export function makeTimeline(flightDuration: number): Timeline {
  const windupEnd = WINDUP;
  const liveEnd = windupEnd + flightDuration;
  const mittEnd = liveEnd + MITT;
  const replayEnd = mittEnd + flightDuration / REPLAY_SPEED;
  return { windupEnd, liveEnd, mittEnd, replayEnd, total: replayEnd + REST, flightDuration };
}

export interface StageState {
  phase: Phase;
  /**
   * 궤적에서 공 위치를 뽑을 비행 시각(s). null이면 공을 안 그린다 —
   * 아직 손을 안 떠났거나 이미 포수 뒤로 갔다.
   */
  flightTime: number | null;
  /** 투수 팔 0(준비) → 1(릴리스) */
  armPhase: number;
  /** 공 불투명도. 미트 직후 사라진다 */
  ballFade: number;
  /** 리플레이 진행도 0~1. 자막을 띄우는 구간에서만 0보다 크다 */
  replayProgress: number;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function stageAt(t: number, timeline: Timeline): StageState {
  const { windupEnd, liveEnd, mittEnd, replayEnd, total, flightDuration } = timeline;

  if (t < windupEnd) {
    return {
      phase: "windup",
      flightTime: null,
      armPhase: clamp01(t / windupEnd),
      ballFade: 0,
      replayProgress: 0,
    };
  }

  if (t < liveEnd) {
    return {
      phase: "live",
      flightTime: t - windupEnd,
      armPhase: 1,
      ballFade: 1,
      replayProgress: 0,
    };
  }

  if (t < mittEnd) {
    // 미트에 박힌 채로 잠깐 멈췄다가 사라진다
    return {
      phase: "mitt",
      flightTime: flightDuration,
      armPhase: 1,
      ballFade: 1 - clamp01((t - liveEnd) / (mittEnd - liveEnd)),
      replayProgress: 0,
    };
  }

  if (t < replayEnd) {
    const elapsed = t - mittEnd;
    return {
      phase: "replay",
      flightTime: Math.min(flightDuration, elapsed * REPLAY_SPEED),
      armPhase: 1,
      ballFade: 1,
      replayProgress: clamp01(elapsed / (replayEnd - mittEnd)),
    };
  }

  return {
    phase: "rest",
    flightTime: null,
    armPhase: clamp01(1 - (t - replayEnd) / Math.max(1e-6, total - replayEnd)),
    ballFade: 0,
    replayProgress: 1,
  };
}

/** 궤적 표본에서 그 시각의 위치와 회전각을 뽑는다 */
export function sampleAt<T extends { t: number }>(samples: readonly T[], t: number): [T, T, number] {
  if (samples.length === 1) return [samples[0], samples[0], 0];

  let hi = 1;
  while (hi < samples.length - 1 && samples[hi].t < t) hi++;
  const lo = hi - 1;
  const span = samples[hi].t - samples[lo].t;
  const f = span <= 0 ? 0 : clamp01((t - samples[lo].t) / span);
  return [samples[lo], samples[hi], f];
}
