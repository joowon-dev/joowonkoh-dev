/**
 * 구슬 폭포의 물리. 옆에서 보는 시점이라 **y가 아래로 증가**하고 중력이 +y로 작용한다.
 * (코인 밀기는 위에서 내려다보는 시점이라 y가 깊이였다. 좌표계 의미가 달라 월드를 공유하지 않는다.)
 */

export const WORLD_WIDTH = 100;
export const WORLD_HEIGHT = 178;

export const FIXED_DT = 1 / 120;
/**
 * 구슬 반지름. 작을수록 양동이 하나에 더 많이 들어가고(= 판이 길어지고) 화면에 떠 있는
 * 구슬도 늘어난다. 초당 스폰을 줄여 판을 늘리는 대신 이쪽을 택했다 — 스폰을 줄이면
 * 쏟아지는 맛이 사라진다.
 */
export const MARBLE_RADIUS = 1.0;
export const GRAVITY = 118;
/** 공기 저항 계수(1/s). 없으면 구슬이 아래로 갈수록 계속 빨라져 블록을 뚫고 지나간다. */
export const AIR_DRAG = 0.55;
/**
 * 속도 상한. 한 스텝(1/120초)에 구슬 반지름보다 많이 움직이면 얇은 블록을 그냥 통과한다.
 * MARBLE_RADIUS / FIXED_DT 보다 넉넉히 낮게 잡아 터널링을 막는다.
 */
export const MAX_SPEED = 95;

/** 폭탄 구슬이 들어간 양동이가 잃는 구슬 수 */
export const BOMB_PENALTY = 6;

export const MARBLE_RESTITUTION = 0.3;
/**
 * 좌우 벽의 반발계수. 낮게 두면 벽이 함정이 된다 — 벽에 닿은 구슬이 옆 속도를 잃고
 * 그대로 벽을 타고 내려와 가장자리 양동이로 직행한다. 실측에서 0.28일 때 가장자리
 * 양동이 둘이 전체 구슬의 40%를 먹었다. 되튕겨 나가도록 높게 잡는다.
 */
export const WALL_RESTITUTION = 0.62;
export const BLOCK_RESTITUTION = 0.42;
/** 범퍼는 1을 넘는다 — 들어온 것보다 세게 튕겨낸다. */
export const BUMPER_RESTITUTION = 1.25;
/** 범퍼에 아주 느리게 닿아도 최소 이만큼은 튕겨나간다. 범퍼 위에 구슬이 얹히는 것을 막는다. */
export const BUMPER_MIN_KICK = 34;
/**
 * 마찰 계수. 접선 임펄스는 **법선 임펄스의 이 배수까지만** 걸린다(쿨롱 마찰).
 *
 * 처음에는 접선 상대속도를 매 충돌마다 일정 비율로 깎았는데, 그건 법선력과 무관한
 * 무한히 센 마찰이라 기울어진 블록 위에서 구슬이 미끄러지지 못하고 접착제에 붙은 것처럼
 * 기어내려왔다. 한도를 법선력에 묶으면 경사에서는 중력이 마찰을 이겨 제대로 흘러내리고,
 * 움직이는 표면은 여전히 구슬을 끌고 간다.
 */
export const FRICTION_COEFF = 0.18;

/**
 * 마찰각 — 이 각도보다 가파른 면에서는 중력이 마찰을 이겨 구슬이 미끄러진다.
 * 기울어진 블록의 각도는 반드시 이 값보다 커야 한다. 처음에 판을 7~13도로 기울였더니
 * 마찰각(0.22일 때 12.4도)보다 낮아서 절반은 여전히 붙어 있었다.
 */
export const FRICTION_ANGLE = Math.atan(FRICTION_COEFF);

/**
 * 아래 넷은 코인 밀기에서 얻은 안정화 장치다. 겹침을 매 스텝 완전히 풀면 붙어 있는
 * 구슬들이 "겹쳤다 → 밀어냈다"를 반복하며 제자리에서 떤다.
 * - `PENETRATION_SLOP`: 이만큼의 겹침은 그냥 둔다
 * - `POSITION_CORRECTION`: 남은 겹침도 이 비율만 민다. 대신 여러 번 반복해 결국 풀린다
 * - `RESTING_SPEED`: 이보다 느리게 부딪히면 반발계수를 무시하고 붙는다
 * - `SOLVER_ITERATIONS`: 한 스텝에 충돌을 몇 번 반복해 풀지
 */
export const PENETRATION_SLOP = 0.02;
export const POSITION_CORRECTION = 0.7;
export const RESTING_SPEED = 4;
export const SOLVER_ITERATIONS = 2;

/** 이 시간이 지나도 양동이에 못 들어간 구슬은 회수한다. 어딘가에 낀 구슬이 쌓이는 것을 막는다. */
export const MARBLE_MAX_AGE = 18;

/**
 * 구슬 종류. 물리는 완전히 같고 양동이에 들어갔을 때만 다르다 —
 * 보통 구슬은 하나를 더하고, 폭탄은 `BOMB_PENALTY`만큼 덜어낸다.
 */
export type MarbleKind = "normal" | "bomb";

export interface Marble {
  id: number;
  kind: MarbleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 월드에 투입된 시각(초) */
  bornAt: number;
  /** 렌더 전용 회전각(rad). 물리에는 영향을 주지 않는다. */
  spin: number;
}

export function createMarble(init: {
  id: number;
  x: number;
  y: number;
  kind?: MarbleKind;
  vx?: number;
  vy?: number;
  bornAt?: number;
}): Marble {
  return { kind: "normal", vx: 0, vy: 0, bornAt: 0, spin: 0, ...init };
}

/* ------------------------------------------------------------------ 충돌 도형 */

/**
 * 두께가 있는 선분(캡슐). 회전 바·물레방아·왕복 판·쐐기·양동이 벽이 전부 이걸로 표현된다.
 * `spin`이 있으면 그 중심을 기준으로 회전 중이고, `vx`/`vy`는 평행이동 속도다.
 * 두 값이 접촉점의 표면 속도를 만들고, 그 속도가 구슬에 전달된다.
 */
export interface SolidSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** 두께의 절반 */
  half: number;
  restitution: number;
  spin: { cx: number; cy: number; omega: number } | null;
  vx: number;
  vy: number;
}

export interface SolidCircle {
  cx: number;
  cy: number;
  radius: number;
  restitution: number;
  /** 최소 반발 속도. 범퍼에만 쓴다. */
  minKick: number;
}

export function createSegment(init: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  half: number;
  restitution?: number;
  spin?: { cx: number; cy: number; omega: number } | null;
  vx?: number;
  vy?: number;
}): SolidSegment {
  return { restitution: BLOCK_RESTITUTION, spin: null, vx: 0, vy: 0, ...init };
}

/** 선분 위에서 점 (px, py)에 가장 가까운 점 */
export function closestPointOnSegment(
  px: number,
  py: number,
  s: SolidSegment,
): { x: number; y: number } {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { x: s.x1, y: s.y1 };
  let t = ((px - s.x1) * dx + (py - s.y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return { x: s.x1 + dx * t, y: s.y1 + dy * t };
}

/** 회전+평행이동 하는 도형의 한 점에서의 표면 속도. v = 평행이동 + ω × r */
export function surfaceVelocityAt(s: SolidSegment, px: number, py: number): { x: number; y: number } {
  if (!s.spin) return { x: s.vx, y: s.vy };
  const { cx, cy, omega } = s.spin;
  return { x: s.vx - omega * (py - cy), y: s.vy + omega * (px - cx) };
}

/** 선분의 축 정렬 경계상자. 브로드페이즈 조기 탈락에 쓴다. */
export function segmentBounds(s: SolidSegment): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  return {
    minX: Math.min(s.x1, s.x2) - s.half,
    maxX: Math.max(s.x1, s.x2) + s.half,
    minY: Math.min(s.y1, s.y2) - s.half,
    maxY: Math.max(s.y1, s.y2) + s.half,
  };
}

/* ------------------------------------------------------------------ 충돌 해소 */

/** 겹친 두 구슬을 밀어내고 충돌 임펄스를 적용한다. 질량이 모두 같아 반씩 나눠 민다. */
export function resolvePair(a: Marble, b: Marble): void {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let dist = Math.hypot(dx, dy);
  const minDist = MARBLE_RADIUS * 2;
  if (dist >= minDist) return;

  // 완전히 겹쳐 방향을 정할 수 없으면 임의로 한 축을 벌린다
  if (dist === 0) {
    dx = 0.001;
    dy = 0;
    dist = 0.001;
  }

  const nx = dx / dist;
  const ny = dy / dist;

  const overlap = Math.max(0, minDist - dist - PENETRATION_SLOP) * POSITION_CORRECTION;
  if (overlap > 0) {
    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;
  }

  const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (vn > 0) return;

  const e = -vn < RESTING_SPEED ? 0 : MARBLE_RESTITUTION;
  const j = (-(1 + e) * vn) / 2;
  a.vx -= j * nx;
  a.vy -= j * ny;
  b.vx += j * nx;
  b.vy += j * ny;
}

/**
 * 구슬과 선분 도형의 충돌. 도형은 움직이지만 구슬에 밀리지는 않으므로(무한 질량)
 * 위치 보정과 임펄스를 구슬이 전부 받는다.
 */
export function resolveSegment(m: Marble, s: SolidSegment): void {
  const p = closestPointOnSegment(m.x, m.y, s);
  let dx = m.x - p.x;
  let dy = m.y - p.y;
  let dist = Math.hypot(dx, dy);
  const minDist = MARBLE_RADIUS + s.half;
  if (dist >= minDist) return;

  // 구슬 중심이 선분 위에 정확히 얹힌 경우 — 위로 밀어낸다
  if (dist === 0) {
    dx = 0;
    dy = -1;
    dist = 1;
  }

  const nx = dx / dist;
  const ny = dy / dist;

  const overlap = Math.max(0, minDist - dist - PENETRATION_SLOP) * POSITION_CORRECTION;
  m.x += nx * overlap;
  m.y += ny * overlap;

  // 표면이 움직이면 그 속도를 기준으로 상대 속도를 본다
  const sv = surfaceVelocityAt(s, p.x, p.y);
  const rvx = m.vx - sv.x;
  const rvy = m.vy - sv.y;
  const vn = rvx * nx + rvy * ny;
  if (vn >= 0) return;

  const e = -vn < RESTING_SPEED ? 0 : s.restitution;
  const jn = -(1 + e) * vn;
  m.vx += jn * nx;
  m.vy += jn * ny;

  // 접선 마찰 — 표면 속도를 향해 끌어당기되, 세기는 법선 임펄스에 비례하는 한도 안에서만.
  // 이게 있어야 회전판과 왕복 판이 구슬을 실어 나르고, 한도가 있어야 경사에서 미끄러진다.
  const tx = -ny;
  const ty = nx;
  const vt = rvx * tx + rvy * ty;
  const limit = FRICTION_COEFF * Math.abs(jn);
  const jt = Math.max(-limit, Math.min(limit, -vt));
  m.vx += jt * tx;
  m.vy += jt * ty;
}

/** 구슬과 원 도형(범퍼)의 충돌. */
export function resolveCircle(m: Marble, c: SolidCircle): void {
  let dx = m.x - c.cx;
  let dy = m.y - c.cy;
  let dist = Math.hypot(dx, dy);
  const minDist = MARBLE_RADIUS + c.radius;
  if (dist >= minDist) return;

  if (dist === 0) {
    dx = 0;
    dy = -1;
    dist = 1;
  }

  const nx = dx / dist;
  const ny = dy / dist;

  const overlap = Math.max(0, minDist - dist - PENETRATION_SLOP) * POSITION_CORRECTION;
  m.x += nx * overlap;
  m.y += ny * overlap;

  const vn = m.vx * nx + m.vy * ny;
  if (vn < 0) {
    const j = -(1 + c.restitution) * vn;
    m.vx += j * nx;
    m.vy += j * ny;
  }

  // 반발 후에도 바깥으로 나가는 속도가 모자라면 채워준다. 느리게 굴러와 얹히는 것을 막는다.
  if (c.minKick > 0) {
    const outward = m.vx * nx + m.vy * ny;
    if (outward < c.minKick) {
      m.vx += (c.minKick - outward) * nx;
      m.vy += (c.minKick - outward) * ny;
    }
  }
}

/**
 * 속도를 상한으로 자른다. 한 스텝의 이동 거리를 구슬 반지름 아래로 묶어 얇은 블록을
 * 통과하지 못하게 하는 장치다. **적분 직전과 충돌 해소 직후 둘 다** 적용해야 한다 —
 * 범퍼는 반발계수가 1을 넘어서 충돌 해소 중에 속도를 키우고, 그 속도가 다음 스텝의
 * 이동 거리가 되기 때문이다.
 */
export function clampSpeed(m: Marble): void {
  const speed = Math.hypot(m.vx, m.vy);
  if (speed <= MAX_SPEED) return;
  m.vx = (m.vx / speed) * MAX_SPEED;
  m.vy = (m.vy / speed) * MAX_SPEED;
}

/** 좌우 바깥 벽. 월드 밖으로 나간 구슬을 되돌린다. */
export function clampToWalls(m: Marble): void {
  if (m.x < MARBLE_RADIUS) {
    m.x = MARBLE_RADIUS;
    m.vx = Math.abs(m.vx) * WALL_RESTITUTION;
  } else if (m.x > WORLD_WIDTH - MARBLE_RADIUS) {
    m.x = WORLD_WIDTH - MARBLE_RADIUS;
    m.vx = -Math.abs(m.vx) * WALL_RESTITUTION;
  }
}

/**
 * 공간 해시로 충돌 후보 쌍을 뽑는다. 항상 i < j 이고 같은 쌍이 두 번 나오지 않는다.
 * 전제조건: cellSize는 구슬 지름 이상이어야 인접하지 않은 셀의 쌍이 누락되지 않는다.
 */
export function candidatePairs(marbles: Marble[], cellSize: number): Array<[number, number]> {
  const grid = new Map<string, number[]>();
  for (let i = 0; i < marbles.length; i++) {
    const key = `${Math.floor(marbles[i].x / cellSize)},${Math.floor(marbles[i].y / cellSize)}`;
    const bucket = grid.get(key);
    if (bucket) bucket.push(i);
    else grid.set(key, [i]);
  }

  const pairs: Array<[number, number]> = [];
  const reach = MARBLE_RADIUS * 2;
  for (let i = 0; i < marbles.length; i++) {
    const cx = Math.floor(marbles[i].x / cellSize);
    const cy = Math.floor(marbles[i].y / cellSize);
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        const bucket = grid.get(`${cx + ox},${cy + oy}`);
        if (!bucket) continue;
        for (const j of bucket) {
          if (j <= i) continue;
          const dx = marbles[j].x - marbles[i].x;
          const dy = marbles[j].y - marbles[i].y;
          if (dx * dx + dy * dy <= reach * reach) pairs.push([i, j]);
        }
      }
    }
  }
  return pairs;
}

/* ------------------------------------------------------------------ 양동이 */

export interface Bucket {
  /** 이 양동이의 주인(참가자 인덱스) */
  ownerIndex: number;
  /** 안쪽 좌우 경계 */
  x0: number;
  x1: number;
  /** 입구 높이 */
  top: number;
  /** 이만큼 담기면 가득 찬 것 */
  capacity: number;
  count: number;
  /** 한 줄에 몇 개씩 그릴지 (렌더 전용) */
  perRow: number;
  /** 가득 찬 시각(초). 아직이면 null. */
  filledAt: number | null;
}

/** 이번 스텝에 양동이로 들어간 구슬. 렌더 연출과 폭탄 알림에 쓴다. */
export interface CaptureEvent {
  bucketIndex: number;
  kind: MarbleKind;
  x: number;
  y: number;
  at: number;
}

export interface World {
  marbles: Marble[];
  /** 양동이 벽 등 움직이지 않는 도형. 매 스텝 다시 만들 필요가 없다. */
  staticSolids: SolidSegment[];
  buckets: Bucket[];
  elapsed: number;
  captures: CaptureEvent[];
}

/**
 * 양동이 입구를 넘어선 구슬을 회수해 해당 양동이의 개수를 올린다.
 * 회수된 구슬은 물리에서 완전히 빠진다 — 양동이 안에서 수십 개를 물리로 쌓으면
 * 바닥에서 떨림이 생기고 비용도 무겁다. 개수만 세고 그리기는 격자로 한다.
 */
export function collectIntoBuckets(world: World): void {
  const remaining: Marble[] = [];
  for (const m of world.marbles) {
    let captured = false;
    for (let i = 0; i < world.buckets.length; i++) {
      const b = world.buckets[i];
      if (m.y < b.top + MARBLE_RADIUS) continue;
      if (m.x < b.x0 || m.x > b.x1) continue;

      if (m.kind === "bomb") {
        // 폭탄은 담긴 구슬을 덜어낸다. 어느 자리도 안심할 수 없게 만드는 장치다 —
        // 앞서가는 양동이일수록 잃을 것이 많다.
        b.count = Math.max(0, b.count - BOMB_PENALTY);
        // 같은 스텝에 가득 찼다가 폭탄을 맞을 수 있다. 정원 아래로 내려가면 무효로 돌린다.
        if (b.count < b.capacity) b.filledAt = null;
        world.captures.push({ bucketIndex: i, kind: "bomb", x: m.x, y: m.y, at: world.elapsed });
      } else if (b.count < b.capacity) {
        // 개수는 정원에서 멈춘다. 당첨이 확정된 뒤에도 슬로우모션 연출 동안 구슬이 계속
        // 떨어지므로, 막지 않으면 화면에 "48/46"이 뜨고 쌓인 구슬이 양동이 위로 넘친다.
        b.count++;
        if (b.count >= b.capacity && b.filledAt === null) b.filledAt = world.elapsed;
        world.captures.push({ bucketIndex: i, kind: "normal", x: m.x, y: m.y, at: world.elapsed });
      }
      captured = true;
      break;
    }
    if (!captured) remaining.push(m);
  }
  world.marbles = remaining;
}

export function stepWorld(world: World, dt: number, movingSolids: SolidSegment[], circles: SolidCircle[]): void {
  world.elapsed += dt;

  const drag = Math.max(0, 1 - AIR_DRAG * dt);
  for (const m of world.marbles) {
    m.vy += GRAVITY * dt;
    m.vx *= drag;
    m.vy *= drag;

    clampSpeed(m);

    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.spin += (Math.hypot(m.vx, m.vy) * dt) / MARBLE_RADIUS;
  }

  // 겹침을 한 번에 다 풀지 않으므로 같은 후보 쌍을 여러 번 돈다. 후보 추출은 한 번만 한다 —
  // 한 스텝에 구슬이 셀을 넘어갈 만큼 움직이지 않는다.
  const pairs = candidatePairs(world.marbles, MARBLE_RADIUS * 2);
  const segments = [...movingSolids, ...world.staticSolids];
  const bounds = segments.map(segmentBounds);

  for (let iter = 0; iter < SOLVER_ITERATIONS; iter++) {
    for (const [i, j] of pairs) resolvePair(world.marbles[i], world.marbles[j]);

    for (const m of world.marbles) {
      for (let s = 0; s < segments.length; s++) {
        const bb = bounds[s];
        // 경계상자 조기 탈락 — 도형이 수십 개라 이게 없으면 매 스텝 비용이 크게 는다
        if (
          m.x + MARBLE_RADIUS < bb.minX ||
          m.x - MARBLE_RADIUS > bb.maxX ||
          m.y + MARBLE_RADIUS < bb.minY ||
          m.y - MARBLE_RADIUS > bb.maxY
        ) {
          continue;
        }
        resolveSegment(m, segments[s]);
      }
      for (const c of circles) resolveCircle(m, c);
      clampToWalls(m);
      // 범퍼가 상한 위로 밀어올린 속도를 여기서 되잡는다
      clampSpeed(m);
    }
  }

  collectIntoBuckets(world);

  // 월드 밖으로 새어나갔거나 어딘가에 오래 낀 구슬을 회수한다
  world.marbles = world.marbles.filter(
    (m) => m.y <= WORLD_HEIGHT + 20 && world.elapsed - m.bornAt <= MARBLE_MAX_AGE,
  );
}

/**
 * 가장 먼저 가득 찬 양동이. 아직 없으면 null.
 * 같은 스텝에 둘이 동시에 찼다면 배열 순서가 앞선 쪽이 이긴다 — 양동이 순서는 참가자와
 * 무관하게 섞여 있으므로(setup.ts) 특정 참가자가 유리해지지 않는다.
 */
export function winnerBucket(world: World): Bucket | null {
  let best: Bucket | null = null;
  for (const b of world.buckets) {
    if (b.filledAt === null) continue;
    if (best === null || b.filledAt < best.filledAt!) best = b;
  }
  return best;
}

/**
 * 제한 시간을 넘겼을 때의 강제 종료. 가장 많이 담은 양동이가 이기고,
 * 동수면 배열 순서가 앞선 쪽이 이긴다. 판이 끝나지 않는 경우를 없애기 위한 안전장치다.
 */
export function leadingBucket(world: World): Bucket | null {
  let best: Bucket | null = null;
  for (const b of world.buckets) {
    if (best === null || b.count > best.count) best = b;
  }
  return best;
}
