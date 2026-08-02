/**
 * 타자 농구의 규칙 전부.
 *
 * React도 캔버스도 모른다. 시간은 이벤트에 실린 `now`(ms)로만 들어오므로,
 * 실제로 1.2초를 기다리지 않고 "1.2초 만에 쳤을 때 뭐가 되는지"를 테스트할 수 있다.
 *
 * ── 핵심 아이디어 ──────────────────────────────────────────────
 * 타자 속도가 곧 슛 파워다. 거리가 멀수록 더 빨리 쳐야 한다.
 * 즉 가까운 슛은 "천천히 정확하게", 먼 슛은 "빠르게"가 된다.
 * 빨리 치는 게 늘 이득이 아니라는 점이 이 게임의 전부다.
 */

import { keystrokesOf, isOnTrack } from "./hangul";
import { createRng, randRange, type Rng } from "../_shared/random";
import { WORDS } from "./words";

export type Phase = "ready" | "typing" | "flying" | "result" | "done";

/**
 * 슛 하나의 결말. 성공 넷(클린/앞링/뒤링/백보드)과 실패 둘(짧음/넘김).
 *
 * 앞링·뒤링·백보드는 실제 농구에서 나오는 순서 그대로다 —
 * 약하면 앞 링, 조금 세면 뒤 링, 더 세면 백보드를 맞고 떨어진다.
 */
export type Outcome = "clean" | "frontRim" | "backRim" | "bank" | "short" | "long";

/** 들어간 결말 넷 */
export type MadeOutcome = Exclude<Outcome, "short" | "long">;
/** 못 넣은 결말 둘 */
export type MissOutcome = Extract<Outcome, "short" | "long">;

export const SHOTS_PER_GAME = 10;

/** 3점 라인. 이 밖에서 넣으면 3점 */
export const THREE_POINT_M = 6.75;

/** 거리 스케줄. 1번 슛은 골밑, 마지막은 롱슛 */
export const FIRST_SHOT_M = 3.2;
export const LAST_SHOT_M = 8.0;
/** 매 슛 거리에 섞는 흔들림. 같은 자리를 열 번 던지면 금방 외워진다 */
export const DISTANCE_JITTER_M = 0.4;

/**
 * 파워 0과 100에 해당하는 타속(타/초).
 *
 * 1.5타/초 = 90타/분(아주 느림), 10타/초 = 600타/분(아주 빠름).
 * 이 두 점을 잡고 그 사이를 직선으로 편다.
 */
export const SPEED_AT_ZERO = 1.5;
export const SPEED_AT_HUNDRED = 10.0;

/**
 * 가장 가까운 슛과 가장 먼 슛에 필요한 파워.
 *
 * 바닥을 24로 올려 둔 이유가 있다. 파워는 0 아래로 안 내려가는데(그 아래는
 * 물리적으로 손이 멈춘 상태다) 요구치가 15쯤이면 아무리 느리게 쳐도 diff가
 * -15까지밖에 안 벌어져서, 근거리에서는 "짧았어요"가 나올 수 없었다.
 * 아래쪽에도 빠질 구멍이 있어야 "천천히"가 조절이 되는 실력이 된다.
 */
export const POWER_AT_NEAR = 24;
export const POWER_AT_FAR = 85;

/**
 * 파워가 요구치에서 얼마나 빗나갔는지(diff)로 결말이 갈린다.
 *
 * 위에서부터 훑어 처음 들어맞는 칸이 결과다. 경계는 닫힌 구간의 하한만 본다.
 * 클린 폭(±5)이 좁아 보이지만, 8타짜리 단어에서 파워 10은 대략 0.1초다 —
 * 손끝으로 조절할 수 있는 크기여야 게임이 된다.
 */
export const BANDS: readonly { outcome: Outcome; min: number; max: number }[] = [
  { outcome: "short", min: -Infinity, max: -14 },
  { outcome: "frontRim", min: -14, max: -5 },
  { outcome: "clean", min: -5, max: 5 },
  { outcome: "backRim", min: 5, max: 12 },
  { outcome: "bank", min: 12, max: 20 },
  { outcome: "long", min: 20, max: Infinity },
];

export const OUTCOME_LABEL: Record<Outcome, string> = {
  clean: "클린샷!",
  frontRim: "앞 링 맞고 들어감",
  backRim: "뒤 링 맞고 들어감",
  bank: "백보드 맞고 들어감",
  short: "짧았어요",
  long: "너무 셌어요",
};

/** 실패했을 때만 띄우는 한마디. 다음 슛에서 뭘 고쳐야 하는지 알려준다 */
export const MISS_HINT: Record<MissOutcome, string> = {
  short: "더 빠르게 쳐보세요",
  long: "조금 천천히 쳐보세요",
};

export interface Shot {
  word: string;
  /** 이 단어를 치는 데 필요한 타수. 파워의 분자다 */
  keystrokes: number;
  distanceM: number;
  /** 이 거리에서 클린샷이 나오는 파워의 한가운데 */
  required: number;
  /** 첫 글자를 친 시각. 아직 안 쳤으면 null — 여기부터 시간을 잰다 */
  startedAt: number | null;
  /** 지금 입력창에 들어 있는 값 */
  typed: string;
  /** 목표 단어에서 벗어난 횟수. 정확도 표시에만 쓴다 */
  mistakes: number;
}

/** 던지고 나서 남는 기록 한 줄 */
export interface ShotResult {
  word: string;
  distanceM: number;
  required: number;
  power: number;
  elapsedMs: number;
  keystrokes: number;
  mistakes: number;
  outcome: Outcome;
  points: number;
}

export interface Game {
  phase: Phase;
  /** 0부터. SHOTS_PER_GAME번째를 던지면 끝난다 */
  shotIndex: number;
  shot: Shot;
  score: number;
  combo: number;
  bestCombo: number;
  history: ShotResult[];
  /** 방금 던진 슛의 결과. flying·result에서만 채워져 있다 */
  last: ShotResult | null;
  rng: Rng;
}

export type GameEvent =
  | { type: "start" }
  /** 입력창 값이 바뀌었다. IME 조합 중간값도 그대로 들어온다 */
  | { type: "type"; value: string; now: number }
  /** 공이 다 날아가 바닥에 닿았다 */
  | { type: "landed" }
  /** 다음 슛으로 */
  | { type: "next" };

/** 타속(타/초) → 파워. 아래로만 자른다 — 위를 자르면 먼 슛에서 오버가 사라진다 */
export function powerFromSpeed(strokesPerSecond: number): number {
  const t = (strokesPerSecond - SPEED_AT_ZERO) / (SPEED_AT_HUNDRED - SPEED_AT_ZERO);
  return Math.max(0, t * 100);
}

/** 타수와 걸린 시간으로 파워를 낸다. 0ms면 아직 아무것도 안 친 것이라 0이다 */
export function powerOf(keystrokes: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return powerFromSpeed(keystrokes / (elapsedMs / 1000));
}

/** 타/분. 결과 화면에 보여주는 익숙한 단위 */
export function strokesPerMinute(keystrokes: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return (keystrokes / elapsedMs) * 60000;
}

/** 거리 → 필요한 파워. 가까운 슛과 먼 슛 사이를 직선으로 잇는다 */
export function requiredPower(distanceM: number): number {
  const t = (distanceM - FIRST_SHOT_M) / (LAST_SHOT_M - FIRST_SHOT_M);
  return POWER_AT_NEAR + t * (POWER_AT_FAR - POWER_AT_NEAR);
}

/** 몇 번째 슛인지에 따라 거리가 멀어진다. 흔들림이 있어 같은 자리가 반복되지 않는다 */
export function distanceForShot(index: number, rng: Rng): number {
  const t = SHOTS_PER_GAME > 1 ? index / (SHOTS_PER_GAME - 1) : 0;
  const base = FIRST_SHOT_M + t * (LAST_SHOT_M - FIRST_SHOT_M);
  const jitter = randRange(rng, -DISTANCE_JITTER_M, DISTANCE_JITTER_M);
  return Math.round((base + jitter) * 10) / 10;
}

export function outcomeFor(diff: number): Outcome {
  const band = BANDS.find((b) => diff >= b.min && diff < b.max);
  // BANDS가 -∞~∞를 빈틈없이 덮으므로 여기까지 오지 않는다. 표를 잘못 고쳤을 때의 그물이다.
  return band ? band.outcome : "clean";
}

/** 타입 가드다. 이걸로 걸러야 실패 쪽에서 MISS_HINT를 안전하게 꺼낼 수 있다 */
export function isMade(outcome: Outcome): outcome is MadeOutcome {
  return outcome !== "short" && outcome !== "long";
}

/**
 * 점수. 3점 라인 밖이면 3점, 안이면 2점, 클린샷이면 1점을 더 얹는다.
 *
 * 클린 보너스가 있어야 "그냥 넣기"와 "잘 넣기"가 갈린다 — 보너스가 없으면
 * 백보드로 대충 맞히는 게 제일 이득인 전략이 되어버린다.
 */
export function pointsFor(outcome: Outcome, distanceM: number): number {
  if (!isMade(outcome)) return 0;
  const base = distanceM >= THREE_POINT_M ? 3 : 2;
  return outcome === "clean" ? base + 1 : base;
}

function makeShot(index: number, rng: Rng): Shot {
  const word = WORDS[Math.floor(rng() * WORDS.length)];
  const distanceM = distanceForShot(index, rng);
  return {
    word,
    keystrokes: keystrokesOf(word),
    distanceM,
    required: requiredPower(distanceM),
    startedAt: null,
    typed: "",
    mistakes: 0,
  };
}

export function createGame(seed: number): Game {
  const rng = createRng(seed);
  return {
    phase: "ready",
    shotIndex: 0,
    shot: makeShot(0, rng),
    score: 0,
    combo: 0,
    bestCombo: 0,
    history: [],
    last: null,
    rng,
  };
}

/**
 * 지금 이 순간 손을 떼면 나올 파워. 화면의 움직이는 바늘이 이 값이다.
 *
 * 아직 첫 글자를 안 쳤으면 null이다 — 시간이 안 흐르고 있으니 보여줄 값이 없다.
 * 치기 시작하면 시간이 갈수록 값이 줄어든다. 그래서 바늘은 오른쪽에서
 * 왼쪽으로 내려온다. 가까운 슛은 바늘이 목표 칸에 들어올 때까지 기다렸다
 * 마지막 글자를 완성하는 게 정석이다.
 */
export function livePower(shot: Shot, now: number): number | null {
  if (shot.startedAt === null) return null;
  return powerOf(shot.keystrokes, now - shot.startedAt);
}

/**
 * 한 슛에 인정하는 최소 시간.
 *
 * 사람 손으로는 자모 대여섯 개를 0.12초에 못 친다. 이 바닥이 없으면 붙여넣기나
 * 자동 입력이 1ms짜리 기록을 남기고, 결과 화면에 480000타/분 같은 값이 뜬다.
 * 판정은 어차피 "너무 셌어요"라 게임에는 영향이 없고, 기록만 멀쩡해진다.
 */
export const MIN_SHOT_MS = 120;

function finishShot(game: Game, now: number): Game {
  const { shot } = game;
  const elapsedMs = Math.max(MIN_SHOT_MS, now - (shot.startedAt ?? now));
  const power = powerOf(shot.keystrokes, elapsedMs);
  const outcome = outcomeFor(power - shot.required);
  const points = pointsFor(outcome, shot.distanceM);
  const made = isMade(outcome);
  const combo = made ? game.combo + 1 : 0;

  const result: ShotResult = {
    word: shot.word,
    distanceM: shot.distanceM,
    required: shot.required,
    power,
    elapsedMs,
    keystrokes: shot.keystrokes,
    mistakes: shot.mistakes,
    outcome,
    points,
  };

  return {
    ...game,
    phase: "flying",
    shot: { ...shot, typed: shot.word },
    score: game.score + points,
    combo,
    bestCombo: Math.max(game.bestCombo, combo),
    history: [...game.history, result],
    last: result,
  };
}

export function step(game: Game, event: GameEvent): Game {
  switch (event.type) {
    case "start":
      return game.phase === "ready" ? { ...game, phase: "typing" } : game;

    case "type": {
      if (game.phase !== "typing") return game;
      const { shot } = game;
      const value = event.value;

      // 첫 입력에서 시계를 켠다. 단어가 뜬 순간부터 재면 반응 속도가 파워를
      // 좌우해서, 느리게 치는 근거리 슛이 그냥 운이 된다.
      const startedAt = shot.startedAt ?? (value.length > 0 ? event.now : null);

      // 길 위에 있다가 벗어난 순간에만 한 번 센다. 벗어난 채로 계속 치는 동안
      // 매 글자마다 세면 오타 하나가 열 개로 불어난다.
      const wasOk = isOnTrack(shot.typed, shot.word);
      const nowOk = isOnTrack(value, shot.word);
      const mistakes = shot.mistakes + (wasOk && !nowOk ? 1 : 0);

      const next: Game = { ...game, shot: { ...shot, typed: value, startedAt, mistakes } };
      return value === shot.word ? finishShot(next, event.now) : next;
    }

    case "landed":
      return game.phase === "flying" ? { ...game, phase: "result" } : game;

    case "next": {
      if (game.phase !== "result") return game;
      const shotIndex = game.shotIndex + 1;
      if (shotIndex >= SHOTS_PER_GAME) return { ...game, phase: "done" };
      return {
        ...game,
        phase: "typing",
        shotIndex,
        shot: makeShot(shotIndex, game.rng),
        last: null,
      };
    }
  }
}

export interface Summary {
  score: number;
  made: number;
  attempts: number;
  cleans: number;
  bestCombo: number;
  /** 평균 타/분. 던진 슛 전체의 타수 합 ÷ 시간 합이라 긴 단어가 더 반영된다 */
  spm: number;
  mistakes: number;
  /** 실제로 친 시간의 합. 공이 날아간 시간과 결과를 보던 시간은 안 센다 */
  totalMs: number;
}

export function summarize(game: Game): Summary {
  const h = game.history;
  const strokes = h.reduce((s, r) => s + r.keystrokes, 0);
  const ms = h.reduce((s, r) => s + r.elapsedMs, 0);
  return {
    totalMs: ms,
    score: game.score,
    made: h.filter((r) => isMade(r.outcome)).length,
    attempts: h.length,
    cleans: h.filter((r) => r.outcome === "clean").length,
    bestCombo: game.bestCombo,
    spm: strokesPerMinute(strokes, ms),
    mistakes: h.reduce((s, r) => s + r.mistakes, 0),
  };
}

/** 마지막 화면에 띄울 한 줄 평 */
export function grade(summary: Summary): string {
  const rate = summary.attempts > 0 ? summary.made / summary.attempts : 0;
  if (summary.cleans >= 7) return "슛폼이 교과서입니다";
  if (rate >= 0.9) return "이 정도면 주전입니다";
  if (rate >= 0.7) return "벤치에서 바로 투입";
  if (rate >= 0.4) return "연습하면 됩니다";
  return "일단 손목부터 풀고 오세요";
}
