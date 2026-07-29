import { randRange, pick, type Rng } from "./random";
import {
  NEUTRAL_RADII,
  centerX,
  halfWidthAt,
  type Coin,
  type CoinKind,
  type World,
} from "./physics";

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

const BOMB_CHANCE = 0.1;
const WARP_CHANCE = 0.08;

/** 중립 코인의 종류를 뽑는다. 참가자 코인은 절대 나오지 않는다. */
export function rollNeutralKind(rng: Rng): CoinKind {
  const r = rng();
  if (r < BOMB_CHANCE) return "bomb";
  if (r < BOMB_CHANCE + WARP_CHANCE) return "warp";
  return "neutral";
}

/** 중립 코인의 반지름을 3종 중에서 뽑는다. 이벤트 코인은 눈에 띄도록 항상 큰 쪽. */
export function rollNeutralRadius(kind: CoinKind, rng: Rng): number {
  if (kind === "bomb" || kind === "warp") return NEUTRAL_RADII[2];
  return pick(rng, NEUTRAL_RADII);
}

/** 질량은 넓이(반지름²)에 비례한다. 참가자 코인이 기준값 1. */
export function radiusMass(radius: number): number {
  return (radius / NEUTRAL_RADII[1]) ** 2;
}

export function kindRestitution(kind: CoinKind): number {
  return kind === "warp" ? 0.5 : 0.15;
}

/** 이벤트 코인이 터지기까지의 시간(초). 평범한 코인은 null. */
export function rollFuse(kind: CoinKind, rng: Rng): number | null {
  if (kind === "bomb") return randRange(rng, 3.5, 9);
  if (kind === "warp") return randRange(rng, 4, 10);
  return null;
}

export const BOMB_RADIUS = 110;
const BOMB_POWER = 420;
const WARP_TARGETS = 6;

/** 터진 이벤트 코인이 남기는 연출 정보. 물리에는 영향을 주지 않는다. */
export interface CoinEffect {
  type: "bomb" | "warp";
  x: number;
  y: number;
  /** 연출 경과 시간(초) */
  t: number;
}

/** 판 안의 무작위 좌표 하나. 벽 안쪽으로 코인 반지름만큼 여유를 둔다. */
function randomSpot(world: World, coin: Coin, rng: Rng): { x: number; y: number } {
  const board = world.board;
  const y = randRange(rng, coin.radius, board.fallLine - coin.radius * 2);
  const limit = Math.max(0, halfWidthAt(board, y) - coin.radius);
  return { x: centerX(board) + randRange(rng, -limit, limit), y };
}

/**
 * 이벤트 코인의 도화선을 진행시키고, 터진 코인의 효과를 월드에 적용한다.
 * 터진 코인은 월드에서 사라지며, 연출용 CoinEffect 배열을 반환한다.
 *
 * - 폭탄: 주변 코인을 바깥으로 날린다 (거리에 반비례하는 임펄스)
 * - 순간이동: 자기 주변 코인 몇 개를 판 위 무작위 지점으로 보낸다
 */
export function tickCoinEvents(world: World, rng: Rng, dt: number): CoinEffect[] {
  const effects: CoinEffect[] = [];
  const detonated: Coin[] = [];

  for (const coin of world.coins) {
    if (coin.fuse === null) continue;
    coin.fuse -= dt;
    if (coin.fuse <= 0) detonated.push(coin);
  }
  if (detonated.length === 0) return effects;

  const exploded = new Set(detonated);
  world.coins = world.coins.filter((c) => !exploded.has(c));

  for (const coin of detonated) {
    if (coin.kind === "bomb") {
      for (const other of world.coins) {
        const dx = other.x - coin.x;
        const dy = other.y - coin.y;
        const dist = Math.hypot(dx, dy);
        if (dist > BOMB_RADIUS) continue;
        // 완전히 겹친 코인은 방향을 정할 수 없으므로 앞쪽으로 밀어낸다
        const nx = dist === 0 ? 0 : dx / dist;
        const ny = dist === 0 ? 1 : dy / dist;
        const falloff = 1 - dist / BOMB_RADIUS;
        const power = (BOMB_POWER * falloff) / other.mass;
        other.vx += nx * power;
        other.vy += ny * power;
      }
    } else {
      // warp — 가까운 코인부터 몇 개를 무작위 지점으로 보낸다
      const nearby = world.coins
        .map((c) => ({ c, d: Math.hypot(c.x - coin.x, c.y - coin.y) }))
        .sort((a, b) => a.d - b.d || a.c.id - b.c.id)
        .slice(0, WARP_TARGETS);
      for (const { c } of nearby) {
        const spot = randomSpot(world, c, rng);
        c.x = spot.x;
        c.y = spot.y;
        c.vx = 0;
        c.vy = 0;
      }
    }
    effects.push({ type: coin.kind === "bomb" ? "bomb" : "warp", x: coin.x, y: coin.y, t: 0 });
  }

  return effects;
}
