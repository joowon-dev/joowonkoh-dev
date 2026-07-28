import { randRange, pick, type Rng } from "./random";
import { type CoinKind, type World } from "./physics";

/** 이 시각(초)부터 막판 스퍼트에 들어간다 */
export const FINAL_SPURT_AT = 45;

const EVENT_TYPES = ["shake", "tilt", "rush"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface ActiveEvent {
  type: EventType;
  /** 남은 지속 시간(초) */
  remaining: number;
  magnitude: number;
}

export interface Scheduler {
  rng: Rng;
  /** 다음 이벤트가 시작될 시각(초) */
  nextAt: number;
  active: ActiveEvent | null;
}

const GAP_MIN = 5;
const GAP_MAX = 11;

function rollMagnitude(type: EventType, rng: Rng): number {
  if (type === "shake") return randRange(rng, 120, 260);
  if (type === "tilt") return randRange(rng, 90, 200) * (rng() < 0.5 ? -1 : 1);
  return randRange(rng, 1.7, 2.4);
}

function rollDuration(type: EventType, rng: Rng): number {
  if (type === "shake") return randRange(rng, 0.4, 0.9);
  if (type === "tilt") return randRange(rng, 1.5, 3.0);
  return randRange(rng, 2.5, 4.5);
}

export function createScheduler(rng: Rng, startAt?: number): Scheduler {
  return {
    rng,
    nextAt: startAt ?? randRange(rng, GAP_MIN, GAP_MAX),
    active: null,
  };
}

/** 이벤트를 진행시킨다. 이번 호출에 새로 시작한 이벤트가 있으면 그 종류를 반환한다. */
export function updateScheduler(s: Scheduler, elapsed: number, dt: number): EventType | null {
  if (s.active) {
    s.active.remaining -= dt;
    if (s.active.remaining <= 0) {
      s.active = null;
      s.nextAt = elapsed + randRange(s.rng, GAP_MIN, GAP_MAX);
    }
    return null;
  }

  if (elapsed < s.nextAt) return null;

  const type = pick(s.rng, EVENT_TYPES);
  s.active = {
    type,
    remaining: rollDuration(type, s.rng),
    magnitude: rollMagnitude(type, s.rng),
  };
  return type;
}

/** 진행 중인 이벤트를 월드에 반영한다. 이벤트가 없으면 기본값으로 되돌린다.
 * 유지보수 주의: 이벤트가 건드릴 수 있는 모든 필드는 여기서 반드시 리셋해야 한다.
 * 새로운 EventType을 추가할 때는 대응하는 리셋 라인을 여기에 추가해야 한다. */
export function applyScheduler(world: World, s: Scheduler): void {
  world.tiltAx = 0;
  world.pusher.speedScale = 1;

  const active = s.active;
  if (!active) return;

  if (active.type === "tilt") {
    world.tiltAx = active.magnitude;
    return;
  }
  if (active.type === "rush") {
    world.pusher.speedScale = active.magnitude;
    return;
  }
  // shake — 모든 코인에 무작위 방향 임펄스
  // 코인 개수만큼 RNG를 소비하므로 이벤트 시퀀스는 코인 개수에 의존하지만, 같은 입력이면 결정론적이다.
  for (const coin of world.coins) {
    const angle = s.rng() * Math.PI * 2;
    const power = active.magnitude * 0.02;
    coin.vx += Math.cos(angle) * power;
    coin.vy += Math.sin(angle) * power;
  }
}

export function isFinalSpurt(elapsed: number): boolean {
  return elapsed >= FINAL_SPURT_AT;
}

/** 막판 스퍼트에 들어가면 푸셔 행정을 늘린다. 낙하선은 건드리지 않는다. */
export function applyFinalSpurt(world: World, elapsed: number): void {
  if (!isFinalSpurt(elapsed)) return;
  const over = elapsed - FINAL_SPURT_AT;
  // 15초에 걸쳐 1.0 → 1.8배까지 늘어난다
  world.pusher.strokeScale = 1 + Math.min(0.8, (over / 15) * 0.8);
}

const GOLD_CHANCE = 0.12;
const SPRING_CHANCE = 0.1;

/** 중립 코인의 종류를 뽑는다. 참가자 코인은 절대 나오지 않는다. */
export function rollNeutralKind(rng: Rng): CoinKind {
  const r = rng();
  if (r < GOLD_CHANCE) return "gold";
  if (r < GOLD_CHANCE + SPRING_CHANCE) return "spring";
  return "neutral";
}

export function kindMass(kind: CoinKind): number {
  return kind === "gold" ? 2.5 : 1;
}

export function kindRestitution(kind: CoinKind): number {
  return kind === "spring" ? 0.75 : 0.15;
}
