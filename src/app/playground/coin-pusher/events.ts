import { randRange, pick, type Rng } from "./random";
import {
  NEUTRAL_RADII,
  PLATE_MAX_Y,
  PLATE_MIN_Y,
  centerX,
  halfWidthAt,
  type World,
} from "./physics";

/** 이 시각(초)부터 막판 스퍼트에 들어간다 */
export const FINAL_SPURT_AT = 30;

const EVENT_TYPES = ["shake", "tilt", "rush", "catapult", "burst"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface ActiveEvent {
  type: EventType;
  /** 남은 지속 시간(초) */
  remaining: number;
  /** 시작 시점의 지속 시간. 연출 진행도를 구하는 데 쓴다. */
  duration: number;
  magnitude: number;
  /** burst·catapult 이벤트가 일어나는 지점 (판 크기 대비 0~1 비율) */
  x: number;
  y: number;
  /** 한 번만 일어나야 하는 이벤트(투석)가 이미 실행됐는지 */
  fired: boolean;
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
 * 이벤트 추첨 가중치. 순위를 실제로 뒤집는 쪽(융기 1순위, 투석 2순위)을 무겁게 준다.
 * 균등 추첨이면 판을 흔들기만 하고 순서는 그대로인 이벤트가 절반을 넘는다.
 */
const EVENT_WEIGHTS: Record<EventType, number> = {
  burst: 4,
  catapult: 3,
  shake: 2,
  tilt: 2,
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
  if (type === "tilt") return randRange(rng, 90, 200) * (rng() < 0.5 ? -1 : 1);
  if (type === "burst") return randRange(rng, 900, 1500);
  if (type === "catapult") return 0; // 세기 개념이 없다 — 반경 안을 전부 뒤로 보낸다
  return randRange(rng, 1.7, 2.4);
}

function rollDuration(type: EventType, rng: Rng): number {
  if (type === "shake") return randRange(rng, 0.4, 0.9);
  if (type === "tilt") return randRange(rng, 1.5, 3.0);
  if (type === "catapult") return CATAPULT_SECONDS;
  if (type === "burst") return BURST_SECONDS;
  return randRange(rng, 2.5, 4.5);
}

/** 융기 이벤트가 코인을 밀어내는 반경과 지속 시간 */
export const BURST_RADIUS = 130;
export const BURST_SECONDS = 0.45;

/** 투석 이벤트가 걷어가는 반경과 연출 지속 시간 */
export const CATAPULT_RADIUS = 105;
export const CATAPULT_SECONDS = 0.6;
/** 한 번에 뒤로 보낼 수 있는 최대 코인 수. 판 위쪽이 감당 못 할 만큼 몰리지 않게 한다. */
export const CATAPULT_MAX_COINS = 16;

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
 * 투석 — 반경 안의 코인을 판 뒤쪽(미는 판 위)으로 되돌려 보낸다.
 *
 * 융기가 코인을 사방으로 "밀어낸다"면 투석은 아예 출발선으로 "돌려보낸다". 앞줄에 나와
 * 있던 코인이 한 번에 원점으로 가므로 순위가 가장 크게 요동친다. 반경 안을 전부 보내면
 * 판 뒤쪽이 감당 못 하므로 가까운 순으로 CATAPULT_MAX_COINS개까지만 보낸다.
 *
 * bornAt을 현재 시각으로 갱신해 렌더의 낙하 진입 연출이 다시 재생된다 — 화면에서는
 * 코인이 위에서 다시 떨어지는 것처럼 보인다.
 */
function catapultCoins(world: World, rng: Rng, cx: number, cy: number): void {
  const hit = world.coins
    .map((coin) => ({ coin, d: Math.hypot(coin.x - cx, coin.y - cy) }))
    .filter((e) => e.d <= CATAPULT_RADIUS)
    .sort((a, b) => a.d - b.d || a.coin.id - b.coin.id)
    .slice(0, CATAPULT_MAX_COINS);

  for (const { coin } of hit) {
    const y = randRange(rng, PLATE_MIN_Y, PLATE_MAX_Y);
    const limit = Math.max(1, halfWidthAt(world.board, y) - coin.radius);
    coin.x = centerX(world.board) + randRange(rng, -limit, limit);
    coin.y = y;
    coin.vx = randRange(rng, -30, 30);
    coin.vy = randRange(rng, 10, 60);
    coin.bornAt = world.elapsed;
  }
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
  s.active = { type, remaining: duration, duration, magnitude, x, y, fired: false };
  return type;
}

/** 진행 중인 이벤트를 월드에 반영한다. 이벤트가 없으면 기본값으로 되돌린다.
 * 유지보수 주의: 이벤트가 건드릴 수 있는 모든 필드는 여기서 반드시 리셋해야 한다.
 * 새로운 EventType을 추가할 때는 대응하는 리셋 라인을 여기에 추가해야 한다. */
export function applyScheduler(world: World, s: Scheduler, dtScale = 1): void {
  world.burst = null;
  world.catapult = null;
  world.tiltAx = 0;
  world.pusher.speedScale = 1;

  const active = s.active;
  if (!active) return;

  if (active.type === "tilt") {
    world.tiltAx = active.magnitude;
    return;
  }
  if (active.type === "catapult") {
    const spot = eventSpot(world, active);
    world.catapult = { x: spot.x, y: spot.y, t: active.duration - active.remaining };
    // 걷어가는 것은 이벤트가 시작된 한 프레임에만 일어난다. 이후 지속 시간은 연출용이다.
    if (!active.fired) {
      active.fired = true;
      catapultCoins(world, s.rng, spot.x, spot.y);
    }
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

/** 중립 코인의 반지름을 3종 중에서 뽑는다. */
export function rollNeutralRadius(rng: Rng): number {
  return pick(rng, NEUTRAL_RADII);
}

/** 질량은 넓이(반지름²)에 비례한다. 기준 크기 코인이 1. */
export function radiusMass(radius: number): number {
  return (radius / NEUTRAL_RADII[1]) ** 2;
}

/** 모든 코인의 반발계수는 같다. 코인 종류로 유불리가 갈리지 않게 하기 위한 것이다. */
export const COIN_RESTITUTION = 0.15;
