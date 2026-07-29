import { createRng, randRange, type Rng } from "./random";
import { COIN_RESTITUTION, radiusMass, rollNeutralRadius } from "./events";
import {
  COIN_RADIUS,
  PLATE_MAX_Y,
  PLATE_MIN_Y,
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

/** 처음 깔리는 중립 코인이 전부 쏟아지는 데 걸리는 시간(초) */
export const INITIAL_POUR_SECONDS = 3;
/** 중립 코인 투하가 끝나고 참가자 코인이 한꺼번에 쏟아지기까지의 뜸 (초) */
export const PLAYER_DROP_DELAY = 0.5;

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
  /** 참가자 코인이 다 들어온 뒤 한 번만 도는 무작위 섞기를 이미 했는지 */
  scrambled: boolean;
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

/** 미는 판 위로 쏟아지는 중립 코인 하나를 만든다. 크기 3종 중 하나를 무작위로 받는다. */
function makeNeutral(rng: Rng, id: number, bornAt: number): Coin {
  const radius = rollNeutralRadius(rng);
  const spot = plateSpot(rng, radius);
  return createCoin({
    id,
    ...spot,
    radius,
    mass: radiusMass(radius),
    restitution: COIN_RESTITUTION,
    vx: randRange(rng, -30, 30),
    vy: randRange(rng, 10, 70),
    bornAt,
  });
}

/**
 * 참가자 코인이 한꺼번에 떨어질 자리들. **전원이 같은 깊이(y)** 에 서고 x만 다르다.
 *
 * 깊이를 다르게 주면(격자로 여러 줄을 만들면) 그 줄이 곧 결과가 된다. 더미는 통째로
 * 밀려가는 컨베이어라 시작 깊이 순서가 끝까지 거의 그대로 보존되기 때문이다. 실측으로
 * 20명 격자 배치에서는 뒷줄 출발이 앞줄 출발보다 10배 넘게 이겼다 — 참가자에게 줄을
 * 무작위로 배정하니 "공정"하긴 하지만, 판이 시작 8초 만에 사실상 결정돼 보는 재미가 없다.
 * 같은 깊이에 세우면 구조적인 예측 인자가 사라지고 더미의 혼돈이 승부를 가린다.
 *
 * 자리 i를 누구에게 줄지는 호출부가 섞은 순서로 정한다.
 */
function scatterSpots(rng: Rng, count: number, radius: number): Array<{ x: number; y: number }> {
  const y = PLATE_MIN_Y + 10;
  const limit = Math.max(1, halfWidthAt(board, y) - radius);
  const left = centerX(board) - limit;
  const span = limit * 2;
  const spots: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    // 좌우로 고르게 편 뒤 살짝만 흔든다. 인원이 많으면 서로 겹치지만, 겹침은 x축으로
    // 풀리므로 깊이 우열은 생기지 않는다.
    const x = left + (span * (i + 0.5)) / count;
    spots.push({ x, y: y + randRange(rng, -2, 2) });
  }
  return spots;
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
    burst: null,
    catapult: null,
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

  // 2단계 — 참가자 코인. 전원이 같은 순간에 한꺼번에 쏟아진다.
  //
  // 순차 투입은 공정하지 않다. 실측 결과 20명 기준으로 먼저 투입된 코인이 300판 중
  // 34번 이긴 반면 마지막에 투입된 코인은 한 번도 이기지 못했다(앞 절반 승률 76%).
  // 먼저 들어온 코인이 그만큼 더 오래 밀리기 때문이다. 같은 시각에 넣으면 투입
  // 순서라는 개념 자체가 사라진다.
  //
  // 동시 투입이라고 순서가 사라지는 게 아니다. 같은 시각의 코인들은 큐에 담긴 순서대로
  // world.coins에 들어가고, 충돌 해소는 그 배열 순서대로 돈다. 겹쳐서 시작한 코인 무리에서는
  // 배열 앞쪽 코인이 체계적으로 다르게 밀린다 — 참가자 번호 순으로 넣으면 그대로 편향이 된다.
  // 그래서 참가자 순서를 섞어, 배열 위치와 시작 자리 둘 다 참가자와 무관하게 만든다.
  const order = names.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const at = INITIAL_POUR_SECONDS + PLAYER_DROP_DELAY;
  const spots = scatterSpots(rng, names.length, COIN_RADIUS);
  order.forEach((ownerIndex, i) => {
    queue.push({
      at,
      coin: createCoin({
        id: nextCoinId++,
        ownerIndex,
        kind: "player",
        ...spots[i],
        radius: COIN_RADIUS,
        mass: radiusMass(COIN_RADIUS),
        restitution: COIN_RESTITUTION,
        vx: randRange(rng, -30, 30),
        vy: randRange(rng, 10, 70),
      }),
    });
  });

  queue.sort((a, b) => a.at - b.at);
  return { world, names, queue, seed, rng, nextCoinId, scrambled: false };
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

/**
 * 판 위 모든 코인을 한 번 무작위로 흔들어 섞는다. 참가자 코인이 다 들어온 직후 딱 한 번
 * 돈다. 코인이 줄 맞춰 내려앉은 상태 그대로 밀려가지 않게 하는 것이 목적이다.
 * 세기 분포는 모든 코인이 같으므로 특정 참가자가 유리해지지 않는다.
 */
export function scrambleCoins(game: Game): void {
  for (const coin of game.world.coins) {
    const angle = game.rng() * Math.PI * 2;
    const power = randRange(game.rng, 90, 240);
    coin.vx += Math.cos(angle) * power;
    coin.vy += Math.sin(angle) * power;
  }
  game.scrambled = true;
}

/** 참가자 코인이 전부 투입됐는지 */
export function allDropped(game: Game): boolean {
  return game.queue.length === 0;
}
