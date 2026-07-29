import { randRange, type Rng } from "./random";
import { COIN_RADIUS, NEUTRAL_RADII, centerX, halfWidthAt, type World } from "./physics";

/** 이 시각(초)부터 막판 스퍼트에 들어간다 */
export const FINAL_SPURT_AT = 30;

const EVENT_TYPES = ["shake", "tilt", "rush", "burst"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface ActiveEvent {
  type: EventType;
  /** 남은 지속 시간(초) */
  remaining: number;
  /** 시작 시점의 지속 시간. 연출 진행도를 구하는 데 쓴다. */
  duration: number;
  magnitude: number;
  /** burst 이벤트가 일어나는 지점 (판 크기 대비 0~1 비율) */
  x: number;
  y: number;
}

export interface Scheduler {
  rng: Rng;
  /** 다음 이벤트가 시작될 시각(초) */
  nextAt: number;
  active: ActiveEvent | null;
}

const GAP_MIN = 2.2;
const GAP_MAX = 5;

/**
 * 이벤트 추첨 가중치. 순위를 실제로 뒤집는 쪽(융기 1순위, 좌우 기울기 2순위)을 무겁게 준다.
 * 균등 추첨이면 판을 흔들기만 하고 순서는 그대로인 이벤트가 절반을 넘는다.
 */
const EVENT_WEIGHTS: Record<EventType, number> = {
  burst: 5,
  tilt: 3,
  shake: 2,
  rush: 1,
};

function pickEvent(rng: Rng): EventType {
  const total = EVENT_TYPES.reduce((sum, t) => sum + EVENT_WEIGHTS[t], 0);
  let r = rng() * total;
  for (const type of EVENT_TYPES) {
    r -= EVENT_WEIGHTS[type];
    if (r < 0) return type;
  }
  return EVENT_TYPES[EVENT_TYPES.length - 1];
}

function rollMagnitude(type: EventType, rng: Rng): number {
  if (type === "shake") return randRange(rng, 120, 260);
  // 부호는 어느 쪽으로 먼저 기우는지만 정한다. 이후 좌우로 번갈아 기운다.
  if (type === "tilt") return randRange(rng, 120, 240) * (rng() < 0.5 ? -1 : 1);
  if (type === "burst") return randRange(rng, 900, 1500);
  return randRange(rng, 1.7, 2.4);
}

function rollDuration(type: EventType, rng: Rng): number {
  if (type === "shake") return randRange(rng, 0.4, 0.9);
  if (type === "tilt") return randRange(rng, 2.4, 4.2);
  if (type === "burst") return BURST_SECONDS;
  return randRange(rng, 2.5, 4.5);
}

/** 융기 이벤트가 코인을 밀어내는 반경과 지속 시간 */
export const BURST_RADIUS = 130;
export const BURST_SECONDS = 0.45;

/** 기울기 한 주기(한쪽 끝 → 반대쪽 끝 → 제자리)에 걸리는 시간(초).
 * 지속 시간(2.4~4.2초)이 이보다 길어 한 이벤트 안에서 좌우로 여러 번 넘나든다. */
export const TILT_PERIOD = 1.6;

export function createScheduler(rng: Rng, startAt?: number): Scheduler {
  return {
    rng,
    nextAt: startAt ?? randRange(rng, GAP_MIN, GAP_MAX),
    active: null,
  };
}

/** 이벤트의 0~1 비율 좌표를 판 위 실제 좌표로 옮긴다. */
function eventSpot(world: World, active: ActiveEvent): { x: number; y: number } {
  const y = active.y * world.board.fallLine;
  const half = halfWidthAt(world.board, y);
  return { x: centerX(world.board) + (active.x - 0.5) * 2 * half, y };
}

/**
 * 기울기 — 판이 왼쪽으로 기울었다가 오른쪽으로 넘어가기를 반복한다.
 *
 * 한 방향으로만 기울면 더미 전체가 그쪽 벽에 붙어버릴 뿐 앞뒤 순서는 그대로다. 좌우로
 * 번갈아 기울여야 더미가 벽을 오가며 무너지고, 벽에 밀렸던 코인이 반대쪽으로 쏟아지면서
 * 순위가 섞인다. 사인파라 방향이 바뀌는 순간 가속도가 0을 지나 부드럽게 넘어간다.
 */
function tiltAt(magnitude: number, elapsedInEvent: number): number {
  return magnitude * Math.cos((elapsedInEvent / TILT_PERIOD) * Math.PI * 2);
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

  const type = pickEvent(s.rng);
  const duration = rollDuration(type, s.rng);
  const magnitude = rollMagnitude(type, s.rng);
  // burst는 터질 지점이 필요하다. 더미가 몰려 있는 앞쪽 절반에서 고른다.
  const x = randRange(s.rng, 0, 1);
  const y = randRange(s.rng, 0.45, 0.95);
  s.active = { type, remaining: duration, duration, magnitude, x, y };
  return type;
}

/** 진행 중인 이벤트를 월드에 반영한다. 이벤트가 없으면 기본값으로 되돌린다.
 * 유지보수 주의: 이벤트가 건드릴 수 있는 모든 필드는 여기서 반드시 리셋해야 한다.
 * 새로운 EventType을 추가할 때는 대응하는 리셋 라인을 여기에 추가해야 한다. */
export function applyScheduler(world: World, s: Scheduler, dtScale = 1): void {
  world.burst = null;
  world.tiltAx = 0;
  world.pusher.speedScale = 1;

  const active = s.active;
  if (!active) return;

  if (active.type === "tilt") {
    world.tiltAx = tiltAt(active.magnitude, active.duration - active.remaining);
    return;
  }
  if (active.type === "rush") {
    world.pusher.speedScale = active.magnitude;
    return;
  }
  if (active.type === "burst") {
    // 융기 — 판 한 지점이 솟구쳐 주변 코인을 바깥으로 날린다. 더미의 순서를 실제로
    // 뒤섞는 유일한 힘이라, 이게 없으면 더미가 통째로 밀려가 출발 순서가 그대로 결과가 된다.
    const { x: bx, y: by } = eventSpot(world, active);
    world.burst = { x: bx, y: by, t: active.duration - active.remaining };
    for (const coin of world.coins) {
      const dx = coin.x - bx;
      const dy = coin.y - by;
      const dist = Math.hypot(dx, dy);
      if (dist > BURST_RADIUS) continue;
      const nx = dist === 0 ? 0 : dx / dist;
      const ny = dist === 0 ? 1 : dy / dist;
      // 지속 시간 동안 나눠서 밀어 한 프레임에 튕겨나가지 않게 한다
      const falloff = 1 - dist / BURST_RADIUS;
      const power = (active.magnitude * falloff * dtScale) / coin.mass;
      coin.vx += nx * power;
      coin.vy += ny * power;
    }
    return;
  }

  // shake — 모든 코인에 무작위 방향 임펄스
  // 코인 개수만큼 RNG를 소비하므로 이벤트 시퀀스는 코인 개수에 의존하지만, 같은 입력이면 결정론적이다.
  for (const coin of world.coins) {
    const angle = s.rng() * Math.PI * 2;
    const power = active.magnitude * 0.06;
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

/**
 * 크기별 추첨 가중치. 기준 크기(14)가 가장 흔하고, 거기서 멀어질수록 급격히 드물어진다.
 * `1 / (1 + (d/4)²)` 꼴이라 d=0에서 1, d=3에서 0.64, d=11에서 0.12로 떨어진다.
 * 결과 분포는 14가 34%, 11·17이 각각 22%, 8이 10%, 21이 8%, 25가 4%다.
 */
const RADIUS_FALLOFF = 4;
const NEUTRAL_RADIUS_WEIGHTS: readonly number[] = NEUTRAL_RADII.map(
  (r) => 1 / (1 + ((r - COIN_RADIUS) / RADIUS_FALLOFF) ** 2),
);
const NEUTRAL_WEIGHT_TOTAL = NEUTRAL_RADIUS_WEIGHTS.reduce((a, b) => a + b, 0);

/** 중립 코인의 반지름을 뽑는다. 기준 크기에서 멀수록 덜 나온다. */
export function rollNeutralRadius(rng: Rng): number {
  let r = rng() * NEUTRAL_WEIGHT_TOTAL;
  for (let i = 0; i < NEUTRAL_RADII.length; i++) {
    r -= NEUTRAL_RADIUS_WEIGHTS[i];
    // 부동소수 오차로 마지막까지 안 걸리는 경우를 대비해 아래에서 마지막 값을 돌려준다
    if (r < 0) return NEUTRAL_RADII[i];
  }
  return NEUTRAL_RADII[NEUTRAL_RADII.length - 1];
}

/** 질량은 넓이(반지름²)에 비례한다. 참가자 코인 크기가 기준이라 그 질량이 1. */
export function radiusMass(radius: number): number {
  return (radius / COIN_RADIUS) ** 2;
}

/** 모든 코인의 반발계수는 같다. 코인 종류로 유불리가 갈리지 않게 하기 위한 것이다. */
export const COIN_RESTITUTION = 0.15;
