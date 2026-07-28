import { createRng, randRange, type Rng } from "./random";
import { kindMass, kindRestitution, rollNeutralKind } from "./events";
import {
  COIN_RADIUS,
  createCoin,
  createPusher,
  type Coin,
  type World,
} from "./physics";

export const BOARD_WIDTH = 420;
export const FALL_LINE = 150;

/** 중립 코인이 처음 깔리는 구간 (푸셔 앞 ~ 낙하선 직전) */
const PRESET_MIN_Y = 40;
const PRESET_MAX_Y = FALL_LINE - COIN_RADIUS * 2;

/** 참가자 코인이 우르르 떨어지는 구간 */
const DROP_MIN_Y = 10;
const DROP_MAX_Y = 120;

export interface QueuedCoin {
  coin: Coin;
  /** 이 시각(초)이 되면 월드에 투입된다 */
  at: number;
}

export interface Game {
  world: World;
  names: string[];
  queue: QueuedCoin[];
  seed: number;
  rng: Rng;
  nextCoinId: number;
}

/** 줄바꿈 또는 쉼표로 구분된 이름을 정리한다. 공백 제거, 빈 값 제외, 중복 제거. */
export function parseNames(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of raw.split(/[\n,]/)) {
    const name = token.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

function randomX(rng: Rng): number {
  return randRange(rng, COIN_RADIUS, BOARD_WIDTH - COIN_RADIUS);
}

export function createGame(names: string[], seed: number): Game {
  const rng = createRng(seed);
  const world: World = {
    board: { width: BOARD_WIDTH, fallLine: FALL_LINE },
    coins: [],
    pusher: createPusher(),
    tiltAx: 0,
    shakeImpulse: 0,
    fallen: [],
    elapsed: 0,
  };

  let nextCoinId = 0;

  // 미리 깔려 있는 중립 코인 — 인원에 비례하되 상·하한을 둔다
  const presetCount = Math.min(120, Math.max(14, Math.round(names.length * 1.6)));
  for (let i = 0; i < presetCount; i++) {
    const kind = rollNeutralKind(rng);
    world.coins.push(
      createCoin({
        id: nextCoinId++,
        x: randomX(rng),
        y: randRange(rng, PRESET_MIN_Y, PRESET_MAX_Y),
        kind,
        mass: kindMass(kind),
        restitution: kindRestitution(kind),
      }),
    );
  }

  // 참가자 코인 — 낙하 순서를 섞고, 지점·시각·초기 속도를 무작위로 준다
  const order = names.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const queue: QueuedCoin[] = [];
  let at = 0;
  for (const ownerIndex of order) {
    at += randRange(rng, 0.06, 0.2);
    queue.push({
      at,
      coin: createCoin({
        id: nextCoinId++,
        ownerIndex,
        kind: "player",
        x: randomX(rng),
        y: randRange(rng, DROP_MIN_Y, DROP_MAX_Y),
        vx: randRange(rng, -40, 40),
        vy: randRange(rng, -10, 60),
        mass: kindMass("player"),
        restitution: kindRestitution("player"),
      }),
    });
  }

  return { world, names, queue, seed, rng, nextCoinId };
}

/** 투입 시각이 된 큐 코인을 월드로 옮기고, 옮긴 코인들을 반환한다. */
export function releaseDue(game: Game): Coin[] {
  const released: Coin[] = [];
  const still: QueuedCoin[] = [];
  for (const q of game.queue) {
    if (q.at <= game.world.elapsed) {
      q.coin.bornAt = game.world.elapsed;
      game.world.coins.push(q.coin);
      released.push(q.coin);
    } else {
      still.push(q);
    }
  }
  game.queue = still;
  return released;
}

/** 중립 코인을 판 뒤쪽에 추가로 투입한다. */
export function spawnNeutral(game: Game, count: number): void {
  for (let i = 0; i < count; i++) {
    const kind = rollNeutralKind(game.rng);
    game.world.coins.push(
      createCoin({
        id: game.nextCoinId++,
        x: randomX(game.rng),
        y: randRange(game.rng, DROP_MIN_Y, DROP_MAX_Y),
        vy: randRange(game.rng, 0, 40),
        kind,
        mass: kindMass(kind),
        restitution: kindRestitution(kind),
        bornAt: game.world.elapsed,
      }),
    );
  }
}

/** 참가자 코인이 전부 투입됐는지 */
export function allDropped(game: Game): boolean {
  return game.queue.length === 0;
}
