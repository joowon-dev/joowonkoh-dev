export const COIN_RADIUS = 14;
export const FIXED_DT = 1 / 120;
export const FRICTION = 3.2; // 속도 감쇠 계수 (1/s)
export const PUSHER_BACK_Y = -20; // 푸셔 앞면이 가장 뒤로 물러났을 때의 y
export const PUSHER_STROKE = 90; // 푸셔가 앞으로 나오는 거리
export const PUSHER_SPEED = 70; // 푸셔 이동 속도 (unit/s)
export const WALL_RESTITUTION = 0.4;

export type CoinKind = "player" | "neutral" | "gold" | "spring";

export interface Coin {
  id: number;
  /** 참가자 코인이면 참가자 인덱스, 중립 코인이면 -1 */
  ownerIndex: number;
  kind: CoinKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  restitution: number;
  /** 월드에 투입된 시각(초). 렌더의 낙하 연출에 쓴다. */
  bornAt: number;
}

export interface Board {
  width: number;
  /** 코인 중심이 이 값을 넘으면 판 앞으로 떨어진다 */
  fallLine: number;
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
    mass: 1,
    restitution: 0.15,
    bornAt: 0,
    ...init,
  };
}

/** 겹친 두 코인을 밀어내고 충돌 임펄스를 적용한다. 두 인자를 직접 수정한다. */
export function resolvePair(a: Coin, b: Coin): void {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let dist = Math.hypot(dx, dy);
  const minDist = COIN_RADIUS * 2;

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

/** 좌우 벽 밖으로 나간 코인을 되돌린다. 인자를 직접 수정한다. */
export function clampToWalls(coin: Coin, board: Board): void {
  if (coin.x < COIN_RADIUS) {
    coin.x = COIN_RADIUS;
    coin.vx = Math.abs(coin.vx) * WALL_RESTITUTION;
  } else if (coin.x > board.width - COIN_RADIUS) {
    coin.x = board.width - COIN_RADIUS;
    coin.vx = -Math.abs(coin.vx) * WALL_RESTITUTION;
  }
}
