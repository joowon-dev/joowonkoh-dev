/** 참가자 코인의 반지름. 중립 코인은 NEUTRAL_RADII 중 하나를 쓴다. */
export const COIN_RADIUS = 14;
/** 중립 코인 크기 6종. 참가자 코인 크기(COIN_RADIUS=14)를 가운데 끼고 위아래로 벌어진다.
 * 크기가 다양할수록 더미가 고르게 쌓이지 않아 밀리는 모양이 매번 달라진다. */
export const NEUTRAL_RADII = [8, 11, 14, 17, 21, 25] as const;
/** 공간 해시 셀 크기의 하한. 가장 큰 코인의 지름 이상이어야 충돌이 누락되지 않는다.
 * NEUTRAL_RADII를 늘릴 때 이 값도 같이 올려야 한다. */
export const MAX_COIN_RADIUS = 25;

export const FIXED_DT = 1 / 120;
export const FRICTION = 3.2; // 속도 감쇠 계수 (1/s)
export const PUSHER_BACK_Y = -20; // 푸셔 앞면이 가장 뒤로 물러났을 때의 y
export const PUSHER_STROKE = 130; // 푸셔가 앞으로 나오는 거리
export const PUSHER_SPEED = 78; // 푸셔 이동 속도 (unit/s)
export const WALL_RESTITUTION = 0.4;

export type CoinKind = "player" | "neutral";

export interface Coin {
  id: number;
  /** 참가자 코인이면 참가자 인덱스, 중립 코인이면 -1 */
  ownerIndex: number;
  kind: CoinKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  restitution: number;
  /** 월드에 투입된 시각(초). 렌더의 낙하 연출에 쓴다. */
  bornAt: number;
  /** 렌더 전용 회전각(rad). 물리에는 영향을 주지 않는다. */
  spin: number;
}

export interface Board {
  /** 낙하선(가장 앞)에서의 판 폭 — 가장 넓은 쪽 */
  width: number;
  /** 푸셔 뒤(PUSHER_BACK_Y)에서의 판 폭 — 가장 좁은 쪽 */
  backWidth: number;
  /** 코인 중심이 이 값을 넘으면 판 앞으로 떨어진다 */
  fallLine: number;
}

/** 판은 뒤에서 앞으로 갈수록 서서히 넓어진다. 해당 깊이에서의 반쪽 폭. */
export function halfWidthAt(board: Board, y: number): number {
  const span = board.fallLine - PUSHER_BACK_Y;
  const t = span <= 0 ? 1 : Math.min(1, Math.max(0, (y - PUSHER_BACK_Y) / span));
  return (board.backWidth + (board.width - board.backWidth) * t) / 2;
}

/** 코인이 쏟아져 들어오는 구간 — 미는 판(푸셔 상판) 위. */
export const PLATE_MIN_Y = PUSHER_BACK_Y + 4;
export const PLATE_MAX_Y = PUSHER_BACK_Y + 70;

/** 판의 좌우 가운데. x 좌표계는 0..width이고 가운데가 기준선이다. */
export function centerX(board: Board): number {
  return board.width / 2;
}

export interface Pusher {
  /** 푸셔 앞면의 y. 이 면이 뒤쪽 벽 역할을 한다. */
  y: number;
  dir: 1 | -1;
  /** 이벤트로 조절되는 속도 배율 */
  speedScale: number;
  /** 막판 스퍼트에서 늘어나는 행정 배율 */
  strokeScale: number;
}

export type CoinInit = { id: number; x: number; y: number } & Partial<Omit<Coin, "id" | "x" | "y">>;

export function createCoin(init: CoinInit): Coin {
  return {
    ownerIndex: -1,
    kind: "neutral",
    vx: 0,
    vy: 0,
    radius: COIN_RADIUS,
    mass: 1,
    restitution: 0.15,
    bornAt: 0,
    spin: 0,
    ...init,
  };
}

/** 겹친 두 코인을 밀어내고 충돌 임펄스를 적용한다. 두 인자를 직접 수정한다. */
export function resolvePair(a: Coin, b: Coin): void {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let dist = Math.hypot(dx, dy);
  const minDist = a.radius + b.radius;

  if (dist >= minDist) return;

  // 완전히 겹쳐 방향을 정할 수 없으면 임의로 한 축을 벌린다
  if (dist === 0) {
    dx = 0.01;
    dy = 0;
    dist = 0.01;
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const invA = 1 / a.mass;
  const invB = 1 / b.mass;
  const invSum = invA + invB;

  // 위치 보정 — 질량 역수 비율로 나눠 민다
  const overlap = minDist - dist;
  a.x -= nx * overlap * (invA / invSum);
  a.y -= ny * overlap * (invA / invSum);
  b.x += nx * overlap * (invB / invSum);
  b.y += ny * overlap * (invB / invSum);

  // 법선 방향 상대 속도가 음수(다가오는 중)일 때만 임펄스
  const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (vn > 0) return;

  const e = Math.max(a.restitution, b.restitution);
  const j = (-(1 + e) * vn) / invSum;
  a.vx -= j * nx * invA;
  a.vy -= j * ny * invA;
  b.vx += j * nx * invB;
  b.vy += j * ny * invB;
}

/** 좌우 벽 밖으로 나간 코인을 되돌린다. 벽은 깊이에 따라 벌어진다. 인자를 직접 수정한다. */
export function clampToWalls(coin: Coin, board: Board): void {
  const cx = centerX(board);
  const limit = halfWidthAt(board, coin.y) - coin.radius;
  // 판 뒤쪽이 코인 하나보다 좁아지는 극단적 설정이면 가운데로 모은다
  if (limit <= 0) {
    coin.x = cx;
    coin.vx = 0;
    return;
  }
  if (coin.x < cx - limit) {
    coin.x = cx - limit;
    coin.vx = Math.abs(coin.vx) * WALL_RESTITUTION;
  } else if (coin.x > cx + limit) {
    coin.x = cx + limit;
    coin.vx = -Math.abs(coin.vx) * WALL_RESTITUTION;
  }
}

export interface FallEvent {
  coin: Coin;
  /** 낙하선을 얼마나 넘어섰는지 */
  overshoot: number;
  /** 낙하한 시각(초) */
  at: number;
}

export interface World {
  board: Board;
  coins: Coin[];
  pusher: Pusher;
  /** 기울기 이벤트가 주는 x축 가속도. 이벤트 진행 중 좌우로 부호가 바뀐다. */
  tiltAx: number;
  /** 진행 중인 융기 이벤트의 지점과 경과 시간. 렌더 연출에만 쓴다. */
  burst: { x: number; y: number; t: number } | null;
  fallen: FallEvent[];
  elapsed: number;
}

export function createPusher(): Pusher {
  return { y: PUSHER_BACK_Y, dir: 1, speedScale: 1, strokeScale: 1 };
}

export function stepPusher(pusher: Pusher, dt: number): void {
  const front = PUSHER_BACK_Y + PUSHER_STROKE * pusher.strokeScale;
  pusher.y += pusher.dir * PUSHER_SPEED * pusher.speedScale * dt;
  if (pusher.y >= front) {
    pusher.y = front;
    pusher.dir = -1;
  } else if (pusher.y <= PUSHER_BACK_Y) {
    pusher.y = PUSHER_BACK_Y;
    pusher.dir = 1;
  }
}

/** 푸셔 앞면보다 뒤에 있는 코인을 앞으로 밀어낸다. 후퇴 중에는 밀지 않는다. */
export function applyPusher(coin: Coin, pusher: Pusher): void {
  const limit = pusher.y + coin.radius;
  if (coin.y >= limit) return;
  coin.y = limit;
  if (pusher.dir === 1) {
    coin.vy = Math.max(coin.vy, PUSHER_SPEED * pusher.speedScale);
  } else if (coin.vy < 0) {
    coin.vy = 0;
  }
}

/**
 * 공간 해시로 충돌 후보 쌍을 뽑는다. 항상 i < j 이고 같은 쌍이 두 번 나오지 않는다.
 * 전제조건: cellSize는 MAX_COIN_RADIUS * 2 이상이어야 한다. 이보다 작으면 인접하지 않은
 * 셀에 걸친 충돌 쌍이 조용히 누락될 수 있다.
 */
export function candidatePairs(coins: Coin[], cellSize: number): Array<[number, number]> {
  const grid = new Map<string, number[]>();
  for (let i = 0; i < coins.length; i++) {
    const key = `${Math.floor(coins[i].x / cellSize)},${Math.floor(coins[i].y / cellSize)}`;
    const bucket = grid.get(key);
    if (bucket) bucket.push(i);
    else grid.set(key, [i]);
  }

  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < coins.length; i++) {
    const cx = Math.floor(coins[i].x / cellSize);
    const cy = Math.floor(coins[i].y / cellSize);
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const bucket = grid.get(`${cx + ox},${cy + oy}`);
        if (!bucket) continue;
        for (const j of bucket) {
          if (j <= i) continue;
          const dx = coins[j].x - coins[i].x;
          const dy = coins[j].y - coins[i].y;
          const reach = coins[i].radius + coins[j].radius;
          if (dx * dx + dy * dy <= reach * reach) pairs.push([i, j]);
        }
      }
    }
  }
  return pairs;
}

/** 낙하선을 넘은 코인을 월드에서 제거하고 fallen에 기록한다. */
export function collectFallen(world: World): void {
  const remaining: Coin[] = [];
  const dropped: FallEvent[] = [];
  for (const coin of world.coins) {
    if (coin.y > world.board.fallLine) {
      dropped.push({ coin, overshoot: coin.y - world.board.fallLine, at: world.elapsed });
    } else {
      remaining.push(coin);
    }
  }
  if (dropped.length === 0) return;

  // 같은 스텝에 여러 개면 더 많이 넘어간 쪽이 먼저, 같으면 id가 작은 쪽이 먼저
  dropped.sort((a, b) => b.overshoot - a.overshoot || a.coin.id - b.coin.id);
  world.coins = remaining;
  world.fallen.push(...dropped);
}

export function stepWorld(world: World, dt: number): void {
  world.elapsed += dt;
  stepPusher(world.pusher, dt);

  const damp = Math.max(0, 1 - FRICTION * dt);
  for (const coin of world.coins) {
    coin.vx += world.tiltAx * dt;
    coin.vx *= damp;
    coin.vy *= damp;
    coin.x += coin.vx * dt;
    coin.y += coin.vy * dt;
    // 굴러가는 느낌을 주는 렌더용 회전 — 이동 거리에 비례한다
    coin.spin += (Math.hypot(coin.vx, coin.vy) * dt) / coin.radius;
  }

  const pairs = candidatePairs(world.coins, MAX_COIN_RADIUS * 2);
  for (const [i, j] of pairs) resolvePair(world.coins[i], world.coins[j]);

  for (const coin of world.coins) {
    applyPusher(coin, world.pusher);
    clampToWalls(coin, world.board);
  }

  collectFallen(world);
}

/** 가장 먼저 떨어진 참가자 코인. 아직 없으면 null. */
export function winnerOf(world: World): FallEvent | null {
  for (const event of world.fallen) {
    if (event.coin.ownerIndex >= 0) return event;
  }
  return null;
}
