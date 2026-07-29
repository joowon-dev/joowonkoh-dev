import { createRng, randRange, type Rng } from "./random";
import {
  radiusMass,
  kindRestitution,
  rollFuse,
  rollNeutralKind,
  rollNeutralRadius,
} from "./events";
import {
  COIN_RADIUS,
  PUSHER_BACK_Y,
  centerX,
  createCoin,
  createPusher,
  halfWidthAt,
  type Coin,
  type World,
} from "./physics";

/** 낙하선 쪽(앞) 판 폭 — 가장 넓다 */
export const BOARD_WIDTH = 300;
/** 푸셔 쪽(뒤) 판 폭 — 여기서부터 앞으로 서서히 넓어진다 */
export const BOARD_BACK_WIDTH = 170;
export const FALL_LINE = 420;

/** 코인이 쏟아지는 구간 — 미는 판 위 */
const PLATE_MIN_Y = PUSHER_BACK_Y + 4;
const PLATE_MAX_Y = PUSHER_BACK_Y + 70;

/** 처음 깔리는 중립 코인이 전부 쏟아지는 데 걸리는 시간(초) */
export const INITIAL_POUR_SECONDS = 7;
/** 참가자 코인이 전부 쏟아지는 데 걸리는 시간(초) */
export const PLAYER_POUR_SECONDS = 2.2;

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

const board = { width: BOARD_WIDTH, backWidth: BOARD_BACK_WIDTH, fallLine: FALL_LINE };

/** 미는 판 위의 무작위 투입 지점. 벽 안쪽으로 반지름만큼 여유를 둔다. */
function plateSpot(rng: Rng, radius: number): { x: number; y: number } {
  const y = randRange(rng, PLATE_MIN_Y, PLATE_MAX_Y);
  const limit = Math.max(1, halfWidthAt(board, y) - radius);
  return { x: centerX(board) + randRange(rng, -limit, limit), y };
}

/** 미는 판 위로 쏟아지는 중립 코인 하나를 만든다. */
function makeNeutral(rng: Rng, id: number, bornAt: number): Coin {
  const kind = rollNeutralKind(rng);
  const radius = rollNeutralRadius(kind, rng);
  const spot = plateSpot(rng, radius);
  return createCoin({
    id,
    ...spot,
    kind,
    radius,
    mass: radiusMass(radius),
    restitution: kindRestitution(kind),
    fuse: rollFuse(kind, rng),
    vx: randRange(rng, -30, 30),
    vy: randRange(rng, 10, 70),
    bornAt,
  });
}

/** 처음 깔릴 중립 코인 수. 인원에 비례하되 상·하한을 둔다. */
export function initialCoinCount(playerCount: number): number {
  return Math.min(170, Math.max(80, Math.round(playerCount * 3)));
}

export function createGame(names: string[], seed: number): Game {
  const rng = createRng(seed);
  const world: World = {
    board: { ...board },
    coins: [],
    pusher: createPusher(),
    tiltAx: 0,
    fallen: [],
    elapsed: 0,
  };

  let nextCoinId = 0;
  const queue: QueuedCoin[] = [];

  // 1단계 — 판을 채울 중립 코인이 미는 판 위로 우르르 쏟아진다
  const initialCount = initialCoinCount(names.length);
  for (let i = 0; i < initialCount; i++) {
    const at = (i / initialCount) * INITIAL_POUR_SECONDS + randRange(rng, 0, 0.05);
    queue.push({ at, coin: makeNeutral(rng, nextCoinId++, at) });
  }

  // 2단계 — 참가자 코인. 낙하 순서를 섞고 지점·시각·초기 속도를 무작위로 준다
  const order = names.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  order.forEach((ownerIndex, i) => {
    const at =
      INITIAL_POUR_SECONDS +
      0.4 +
      (order.length <= 1 ? 0 : (i / (order.length - 1)) * PLAYER_POUR_SECONDS) +
      randRange(rng, 0, 0.06);
    const spot = plateSpot(rng, COIN_RADIUS);
    queue.push({
      at,
      coin: createCoin({
        id: nextCoinId++,
        ownerIndex,
        kind: "player",
        ...spot,
        radius: COIN_RADIUS,
        mass: radiusMass(COIN_RADIUS),
        restitution: kindRestitution("player"),
        vx: randRange(rng, -30, 30),
        vy: randRange(rng, 10, 70),
      }),
    });
  });

  queue.sort((a, b) => a.at - b.at);
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

/** 중립 코인을 미는 판 위에 추가로 투입한다. */
export function spawnNeutral(game: Game, count: number): void {
  for (let i = 0; i < count; i++) {
    game.world.coins.push(makeNeutral(game.rng, game.nextCoinId++, game.world.elapsed));
  }
}

/** 참가자 코인이 전부 투입됐는지 */
export function allDropped(game: Game): boolean {
  return game.queue.length === 0;
}
