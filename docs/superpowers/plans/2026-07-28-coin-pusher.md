# 코인 푸셔 추첨기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 참가자 이름을 붙여넣으면 오락실 코인 푸셔 판 위에서 각자의 코인이 밀려나가고, 가장 먼저 앞으로 떨어진 코인의 주인이 당첨되는 추첨기를 `/playground/coin-pusher`에 만든다.

**Architecture:** 물리는 순수 2D 평면 `(x, y)`에서 고정 타임스텝으로 계산하고, 렌더링 단계에서만 y축을 압축해 비스듬한 2.5D 시점을 만든다. 시뮬레이션·이벤트·난수는 DOM에 의존하지 않는 모듈로 분리해 vitest로 검증하고, React 컴포넌트는 상태 머신과 캔버스 렌더만 담당한다. 시드 기반 PRNG를 써서 같은 시드면 결과가 재현된다.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Canvas 2D, Tailwind v4, vitest. **새 런타임 의존성 없음.**

## Global Constraints

- 새 npm 의존성을 추가하지 않는다. 물리 엔진(Matter.js 등)과 3D 라이브러리(Three.js 등)를 도입하지 않는다.
- 시뮬레이션·이벤트·코인 배치의 모든 난수는 `random.ts`의 시드 PRNG를 거친다. `Math.random()`은 게임을 시작할 때 시드 하나를 뽑는 곳에서만 쓴다.
- 물리 고정 타임스텝은 `1/120초`. 렌더 프레임레이트와 분리한다.
- 참가자 1명당 코인 1개. 참가자 코인은 질량·반지름·반발계수가 전부 동일하다.
- 특수 코인(황금·스프링)은 `ownerIndex === -1`인 중립 코인에만 부여한다.
- 서버 저장 없음. Supabase를 쓰지 않는다.
- 테스트 대상은 `random.ts`, `physics.ts`, `setup.ts`, `events.ts`, `render.ts`의 순수 함수뿐이다. Canvas 드로잉과 React 컴포넌트는 단위 테스트하지 않는다.
- 테스트 파일은 `src/**/*.test.ts` 패턴이어야 vitest가 수집한다 (`vitest.config.ts` 참조).
- 색상은 하드코딩하지 말고 `src/app/globals.css`의 토큰(`--color-accent`, `--color-card-bg`, `--color-border`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-accent-soft`)을 Tailwind 클래스(`bg-card-bg`, `text-accent` 등) 또는 `getComputedStyle`로 읽어 쓴다.
- UI 문구는 한국어.
- 각 태스크는 커밋으로 끝난다. 커밋 메시지는 한국어 본문, `feat:` / `test:` / `docs:` 프리픽스.

## 좌표계 규약 (전 태스크 공통)

- `x`: 판의 좌우. `0`(왼쪽 벽) ~ `board.width`(오른쪽 벽).
- `y`: 판의 앞뒤. 값이 **커질수록 화면 앞쪽**(관객 쪽)으로 온다.
- 푸셔는 `y`가 가장 작은 쪽(뒤)에 있고 앞으로 밀었다가 돌아간다. 푸셔의 앞면 `pusher.y`가 곧 뒤쪽 벽 역할을 한다.
- `board.fallLine`: 이 값을 코인 중심이 넘어서면 판 앞으로 떨어진 것으로 본다.

## 파일 구조

```
src/app/playground/coin-pusher/
  random.ts             시드 PRNG (createRng, randRange, randInt, pick)
  random.test.ts
  physics.ts            World/Coin/Pusher 타입, 충돌·벽·푸셔·낙하·stepWorld
  physics.test.ts
  setup.ts              이름 파싱, Game 생성, 코인 투입 스케줄
  setup.test.ts
  events.ts             랜덤 이벤트 스케줄러, 특수 코인 추첨, 막판 스퍼트
  events.test.ts
  render.ts             카메라/투영 계산 + Canvas 드로잉
  render.test.ts
  useGameLoop.ts        rAF 루프 + 고정 타임스텝 누적기
  Stage.tsx             canvas 렌더 컴포넌트
  SetupPanel.tsx        참가자 입력 UI
  WinnerOverlay.tsx     당첨 연출
  CoinPusherGame.tsx    상태 머신 (setup → dropping → pushing → result)
  page.tsx              메타데이터 + 셸
```

수정: `src/lib/projects.ts` (플레이그라운드 카드 1건 추가)

설계 문서(`docs/superpowers/specs/2026-07-28-coin-pusher-design.md`)의 파일 목록에서 두 가지가 달라진다. 월드 생성 로직을 `physics.ts`에서 떼어내 `setup.ts`로 두고, `render.ts`에 테스트가 붙는다. 나머지는 동일하다.

---

### Task 1: 시드 PRNG

**Files:**
- Create: `src/app/playground/coin-pusher/random.ts`
- Test: `src/app/playground/coin-pusher/random.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `type Rng = () => number` — `[0, 1)` 범위의 수를 반환
  - `createRng(seed: number): Rng`
  - `randRange(rng: Rng, min: number, max: number): number`
  - `randInt(rng: Rng, minInclusive: number, maxExclusive: number): number`
  - `pick<T>(rng: Rng, items: readonly T[]): T`

- [ ] **Step 1: 실패하는 테스트를 작성한다**

`src/app/playground/coin-pusher/random.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createRng, randRange, randInt, pick } from "./random";

describe("createRng", () => {
  it("같은 시드는 같은 수열을 만든다", () => {
    const a = createRng(12345);
    const b = createRng(12345);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("다른 시드는 다른 수열을 만든다", () => {
    const a = createRng(1);
    const b = createRng(2);
    expect([a(), a(), a()]).not.toEqual([b(), b(), b()]);
  });

  it("항상 0 이상 1 미만이다", () => {
    const rng = createRng(99);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("같은 값만 반복하지 않는다", () => {
    const rng = createRng(7);
    const values = new Set(Array.from({ length: 100 }, () => rng()));
    expect(values.size).toBeGreaterThan(90);
  });
});

describe("randRange", () => {
  it("min 이상 max 미만을 만든다", () => {
    const rng = createRng(3);
    for (let i = 0; i < 200; i++) {
      const v = randRange(rng, 10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
    }
  });
});

describe("randInt", () => {
  it("정수를 만들고 maxExclusive를 넘지 않는다", () => {
    const rng = createRng(4);
    for (let i = 0; i < 200; i++) {
      const v = randInt(rng, 0, 5);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
    }
  });
});

describe("pick", () => {
  it("배열 안의 원소를 고른다", () => {
    const rng = createRng(5);
    const items = ["a", "b", "c"] as const;
    for (let i = 0; i < 50; i++) {
      expect(items).toContain(pick(rng, items));
    }
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/random.test.ts`
예상: `Failed to resolve import "./random"` 로 실패

- [ ] **Step 3: 구현한다**

`src/app/playground/coin-pusher/random.ts`:

```ts
export type Rng = () => number;

/** mulberry32 — 32비트 시드 PRNG. 같은 시드면 항상 같은 수열. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randRange(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function randInt(rng: Rng, minInclusive: number, maxExclusive: number): number {
  return Math.floor(randRange(rng, minInclusive, maxExclusive));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[randInt(rng, 0, items.length)];
}
```

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/random.test.ts`
예상: 7 tests passed

- [ ] **Step 5: 커밋한다**

```bash
git add src/app/playground/coin-pusher/random.ts src/app/playground/coin-pusher/random.test.ts
git commit -m "feat: 코인 푸셔 시드 PRNG 추가"
```

---

### Task 2: 물리 타입과 코인 충돌·벽 처리

**Files:**
- Create: `src/app/playground/coin-pusher/physics.ts`
- Test: `src/app/playground/coin-pusher/physics.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  - 상수: `COIN_RADIUS = 14`, `FIXED_DT = 1/120`, `FRICTION = 3.2`, `PUSHER_STROKE = 90`, `PUSHER_SPEED = 70`, `PUSHER_BACK_Y = -20`, `WALL_RESTITUTION = 0.4`
  - `type CoinKind = "player" | "neutral" | "gold" | "spring"`
  - `interface Coin { id, ownerIndex, kind, x, y, vx, vy, mass, restitution, bornAt }`
  - `interface Board { width: number; fallLine: number }`
  - `interface Pusher { y: number; dir: 1 | -1; speedScale: number; strokeScale: number }`
  - `createCoin(init): Coin`
  - `resolvePair(a: Coin, b: Coin): void` — 두 코인을 제자리에서 밀어내고 임펄스를 준다 (뮤테이션)
  - `clampToWalls(coin: Coin, board: Board): void`
- 이 모듈의 함수는 인자를 직접 수정한다. 코인이 수백 개라 복사 비용을 피하기 위한 선택이며, DOM 의존이 없으므로 테스트는 그대로 가능하다.

- [ ] **Step 1: 실패하는 테스트를 작성한다**

`src/app/playground/coin-pusher/physics.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  COIN_RADIUS,
  createCoin,
  resolvePair,
  clampToWalls,
  type Board,
} from "./physics";

const board: Board = { width: 400, fallLine: 320 };

describe("createCoin", () => {
  it("기본값은 중립 코인이다", () => {
    const c = createCoin({ id: 1, x: 10, y: 20 });
    expect(c.ownerIndex).toBe(-1);
    expect(c.kind).toBe("neutral");
    expect(c.vx).toBe(0);
    expect(c.vy).toBe(0);
    expect(c.mass).toBe(1);
  });

  it("전달한 값으로 덮어쓴다", () => {
    const c = createCoin({ id: 2, x: 0, y: 0, ownerIndex: 3, kind: "player", mass: 2 });
    expect(c.ownerIndex).toBe(3);
    expect(c.kind).toBe("player");
    expect(c.mass).toBe(2);
  });
});

describe("resolvePair", () => {
  it("겹친 코인을 반지름 두 배까지 밀어낸다", () => {
    const a = createCoin({ id: 1, x: 100, y: 100 });
    const b = createCoin({ id: 2, x: 110, y: 100 });
    resolvePair(a, b);
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(COIN_RADIUS * 2, 5);
  });

  it("떨어져 있으면 아무것도 하지 않는다", () => {
    const a = createCoin({ id: 1, x: 0, y: 0 });
    const b = createCoin({ id: 2, x: 200, y: 0 });
    resolvePair(a, b);
    expect(a.x).toBe(0);
    expect(b.x).toBe(200);
  });

  it("정면 충돌에서 운동량이 보존된다", () => {
    const a = createCoin({ id: 1, x: 100, y: 100, vx: 50 });
    const b = createCoin({ id: 2, x: 120, y: 100, vx: -50 });
    const before = a.mass * a.vx + b.mass * b.vx;
    resolvePair(a, b);
    const after = a.mass * a.vx + b.mass * b.vx;
    expect(after).toBeCloseTo(before, 5);
  });

  it("다가오는 코인끼리는 서로 멀어지는 속도가 된다", () => {
    const a = createCoin({ id: 1, x: 100, y: 100, vx: 50 });
    const b = createCoin({ id: 2, x: 120, y: 100, vx: -50 });
    resolvePair(a, b);
    expect(a.vx).toBeLessThan(0);
    expect(b.vx).toBeGreaterThan(0);
  });

  it("멀어지는 중이면 속도를 바꾸지 않는다", () => {
    const a = createCoin({ id: 1, x: 100, y: 100, vx: -30 });
    const b = createCoin({ id: 2, x: 120, y: 100, vx: 30 });
    resolvePair(a, b);
    expect(a.vx).toBe(-30);
    expect(b.vx).toBe(30);
  });

  it("완전히 같은 위치여도 NaN이 나오지 않는다", () => {
    const a = createCoin({ id: 1, x: 100, y: 100 });
    const b = createCoin({ id: 2, x: 100, y: 100 });
    resolvePair(a, b);
    expect(Number.isFinite(a.x)).toBe(true);
    expect(Number.isFinite(b.x)).toBe(true);
    expect(a.x).not.toBe(b.x);
  });

  it("무거운 코인이 가벼운 코인보다 덜 밀린다", () => {
    const heavy = createCoin({ id: 1, x: 100, y: 100, mass: 2.5 });
    const light = createCoin({ id: 2, x: 110, y: 100, mass: 1 });
    const heavyStart = heavy.x;
    const lightStart = light.x;
    resolvePair(heavy, light);
    expect(Math.abs(heavy.x - heavyStart)).toBeLessThan(Math.abs(light.x - lightStart));
  });
});

describe("clampToWalls", () => {
  it("왼쪽 벽을 뚫지 않는다", () => {
    const c = createCoin({ id: 1, x: -5, y: 100, vx: -40 });
    clampToWalls(c, board);
    expect(c.x).toBe(COIN_RADIUS);
    expect(c.vx).toBeGreaterThan(0);
  });

  it("오른쪽 벽을 뚫지 않는다", () => {
    const c = createCoin({ id: 1, x: 410, y: 100, vx: 40 });
    clampToWalls(c, board);
    expect(c.x).toBe(board.width - COIN_RADIUS);
    expect(c.vx).toBeLessThan(0);
  });

  it("가운데 코인은 건드리지 않는다", () => {
    const c = createCoin({ id: 1, x: 200, y: 100, vx: 40 });
    clampToWalls(c, board);
    expect(c.x).toBe(200);
    expect(c.vx).toBe(40);
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/physics.test.ts`
예상: `Failed to resolve import "./physics"` 로 실패

- [ ] **Step 3: 구현한다**

`src/app/playground/coin-pusher/physics.ts`:

```ts
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
```

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/physics.test.ts`
예상: 13 tests passed

- [ ] **Step 5: 커밋한다**

```bash
git add src/app/playground/coin-pusher/physics.ts src/app/playground/coin-pusher/physics.test.ts
git commit -m "feat: 코인 충돌·벽 처리 물리 모듈 추가"
```

---

### Task 3: 푸셔·낙하 판정·월드 스텝

**Files:**
- Modify: `src/app/playground/coin-pusher/physics.ts` (Task 2 파일 끝에 추가)
- Modify: `src/app/playground/coin-pusher/physics.test.ts` (Task 2 파일 끝에 추가)

**Interfaces:**
- Consumes: Task 2의 `Coin`, `Board`, `Pusher`, `createCoin`, `resolvePair`, `clampToWalls`, 상수 전부
- Produces:
  - `interface FallEvent { coin: Coin; overshoot: number; at: number }`
  - `interface World { board: Board; coins: Coin[]; pusher: Pusher; tiltAx: number; shakeImpulse: number; fallen: FallEvent[]; elapsed: number }`
  - `createPusher(): Pusher`
  - `stepPusher(pusher: Pusher, dt: number): void`
  - `applyPusher(coin: Coin, pusher: Pusher): void`
  - `candidatePairs(coins: Coin[], cellSize: number): Array<[number, number]>`
  - `collectFallen(world: World): void`
  - `stepWorld(world: World, dt: number): void`
  - `winnerOf(world: World): FallEvent | null`

- [ ] **Step 1: 실패하는 테스트를 작성한다**

`src/app/playground/coin-pusher/physics.test.ts` 끝에 추가. 상단 import 문도 아래처럼 늘린다:

```ts
import {
  COIN_RADIUS,
  FIXED_DT,
  PUSHER_BACK_Y,
  PUSHER_STROKE,
  createCoin,
  createPusher,
  resolvePair,
  clampToWalls,
  stepPusher,
  applyPusher,
  candidatePairs,
  collectFallen,
  stepWorld,
  winnerOf,
  type Board,
  type World,
} from "./physics";
```

파일 끝에 붙일 테스트:

```ts
function makeWorld(coins: ReturnType<typeof createCoin>[]): World {
  return {
    board: { width: 400, fallLine: 320 },
    coins,
    pusher: createPusher(),
    tiltAx: 0,
    shakeImpulse: 0,
    fallen: [],
    elapsed: 0,
  };
}

describe("stepPusher", () => {
  it("앞으로 나갔다가 방향을 바꾼다", () => {
    const p = createPusher();
    for (let i = 0; i < 2000; i++) stepPusher(p, FIXED_DT);
    expect(p.y).toBeGreaterThanOrEqual(PUSHER_BACK_Y);
    expect(p.y).toBeLessThanOrEqual(PUSHER_BACK_Y + PUSHER_STROKE + 0.001);
  });

  it("행정 배율을 키우면 더 멀리 나간다", () => {
    const normal = createPusher();
    const long = createPusher();
    long.strokeScale = 2;
    let maxNormal = -Infinity;
    let maxLong = -Infinity;
    for (let i = 0; i < 2000; i++) {
      stepPusher(normal, FIXED_DT);
      stepPusher(long, FIXED_DT);
      maxNormal = Math.max(maxNormal, normal.y);
      maxLong = Math.max(maxLong, long.y);
    }
    expect(maxLong).toBeGreaterThan(maxNormal);
  });
});

describe("applyPusher", () => {
  it("푸셔 뒤로 들어간 코인을 앞면 밖으로 되돌린다", () => {
    const p = createPusher();
    p.y = 0;
    p.dir = 1;
    const c = createCoin({ id: 1, x: 100, y: -50 });
    applyPusher(c, p);
    expect(c.y).toBeCloseTo(COIN_RADIUS, 5);
  });

  it("전진 중이면 코인에 앞으로 가는 속도를 준다", () => {
    const p = createPusher();
    p.y = 0;
    p.dir = 1;
    const c = createCoin({ id: 1, x: 100, y: -50, vy: 0 });
    applyPusher(c, p);
    expect(c.vy).toBeGreaterThan(0);
  });

  it("후퇴 중에는 코인을 끌고 오지 않는다", () => {
    const p = createPusher();
    p.y = 0;
    p.dir = -1;
    const c = createCoin({ id: 1, x: 100, y: 100, vy: 0 });
    applyPusher(c, p);
    expect(c.y).toBe(100);
    expect(c.vy).toBe(0);
  });
});

describe("candidatePairs", () => {
  it("가까운 코인 쌍을 찾는다", () => {
    const coins = [
      createCoin({ id: 1, x: 100, y: 100 }),
      createCoin({ id: 2, x: 110, y: 100 }),
    ];
    expect(candidatePairs(coins, COIN_RADIUS * 2)).toEqual([[0, 1]]);
  });

  it("멀리 떨어진 코인 쌍은 제외한다", () => {
    const coins = [
      createCoin({ id: 1, x: 0, y: 0 }),
      createCoin({ id: 2, x: 300, y: 300 }),
    ];
    expect(candidatePairs(coins, COIN_RADIUS * 2)).toEqual([]);
  });

  it("같은 쌍을 두 번 반환하지 않는다", () => {
    const coins = Array.from({ length: 20 }, (_, i) =>
      createCoin({ id: i, x: 100 + (i % 5) * 5, y: 100 + Math.floor(i / 5) * 5 }),
    );
    const pairs = candidatePairs(coins, COIN_RADIUS * 2);
    const keys = pairs.map(([i, j]) => `${i}-${j}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const [i, j] of pairs) expect(i).toBeLessThan(j);
  });
});

describe("collectFallen", () => {
  it("낙하선을 넘은 코인을 월드에서 빼고 기록한다", () => {
    const c = createCoin({ id: 7, x: 100, y: 400, ownerIndex: 2, kind: "player" });
    const w = makeWorld([c]);
    collectFallen(w);
    expect(w.coins).toHaveLength(0);
    expect(w.fallen).toHaveLength(1);
    expect(w.fallen[0].coin.id).toBe(7);
    expect(w.fallen[0].overshoot).toBeCloseTo(80, 5);
  });

  it("낙하선 안쪽 코인은 남긴다", () => {
    const w = makeWorld([createCoin({ id: 1, x: 100, y: 100 })]);
    collectFallen(w);
    expect(w.coins).toHaveLength(1);
    expect(w.fallen).toHaveLength(0);
  });

  it("같은 프레임에 여러 개가 떨어지면 더 많이 넘어간 코인이 앞에 온다", () => {
    const w = makeWorld([
      createCoin({ id: 1, x: 100, y: 330, ownerIndex: 0, kind: "player" }),
      createCoin({ id: 2, x: 200, y: 360, ownerIndex: 1, kind: "player" }),
    ]);
    collectFallen(w);
    expect(w.fallen.map((f) => f.coin.id)).toEqual([2, 1]);
  });

  it("넘어간 거리가 완전히 같으면 id가 작은 코인이 앞에 온다", () => {
    const w = makeWorld([
      createCoin({ id: 9, x: 100, y: 350, ownerIndex: 0, kind: "player" }),
      createCoin({ id: 3, x: 200, y: 350, ownerIndex: 1, kind: "player" }),
    ]);
    collectFallen(w);
    expect(w.fallen.map((f) => f.coin.id)).toEqual([3, 9]);
  });
});

describe("winnerOf", () => {
  it("가장 먼저 떨어진 참가자 코인을 고른다", () => {
    const w = makeWorld([]);
    w.fallen = [
      { coin: createCoin({ id: 1, x: 0, y: 0 }), overshoot: 5, at: 1 },
      { coin: createCoin({ id: 2, x: 0, y: 0, ownerIndex: 4, kind: "player" }), overshoot: 3, at: 2 },
      { coin: createCoin({ id: 3, x: 0, y: 0, ownerIndex: 6, kind: "player" }), overshoot: 9, at: 3 },
    ];
    expect(winnerOf(w)?.coin.ownerIndex).toBe(4);
  });

  it("중립 코인만 떨어졌으면 당첨자가 없다", () => {
    const w = makeWorld([]);
    w.fallen = [{ coin: createCoin({ id: 1, x: 0, y: 0 }), overshoot: 5, at: 1 }];
    expect(winnerOf(w)).toBeNull();
  });
});

describe("stepWorld", () => {
  it("푸셔가 코인을 앞으로 민다", () => {
    const c = createCoin({ id: 1, x: 200, y: 0 });
    const w = makeWorld([c]);
    for (let i = 0; i < 240; i++) stepWorld(w, FIXED_DT);
    expect(w.coins[0].y).toBeGreaterThan(0);
  });

  it("기울기가 있으면 코인이 그 방향으로 간다", () => {
    const w = makeWorld([createCoin({ id: 1, x: 200, y: 100 })]);
    w.tiltAx = 200;
    for (let i = 0; i < 60; i++) stepWorld(w, FIXED_DT);
    expect(w.coins[0].x).toBeGreaterThan(200);
  });

  it("코인이 판 밖으로 새지 않는다", () => {
    const coins = Array.from({ length: 60 }, (_, i) =>
      createCoin({ id: i, x: 20 + (i % 10) * 30, y: 40 + Math.floor(i / 10) * 26 }),
    );
    const w = makeWorld(coins);
    for (let i = 0; i < 1200; i++) stepWorld(w, FIXED_DT);
    for (const c of w.coins) {
      expect(c.x).toBeGreaterThanOrEqual(COIN_RADIUS - 0.001);
      expect(c.x).toBeLessThanOrEqual(w.board.width - COIN_RADIUS + 0.001);
      expect(Number.isFinite(c.y)).toBe(true);
    }
  });

  it("elapsed가 누적된다", () => {
    const w = makeWorld([]);
    for (let i = 0; i < 120; i++) stepWorld(w, FIXED_DT);
    expect(w.elapsed).toBeCloseTo(1, 5);
  });

  it("같은 초기 상태를 두 번 돌리면 결과가 같다", () => {
    const build = () =>
      makeWorld(
        Array.from({ length: 40 }, (_, i) =>
          createCoin({ id: i, x: 20 + (i % 8) * 40, y: 40 + Math.floor(i / 8) * 30 }),
        ),
      );
    const a = build();
    const b = build();
    for (let i = 0; i < 600; i++) {
      stepWorld(a, FIXED_DT);
      stepWorld(b, FIXED_DT);
    }
    expect(a.coins.map((c) => [c.id, c.x, c.y])).toEqual(
      b.coins.map((c) => [c.id, c.x, c.y]),
    );
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/physics.test.ts`
예상: `createPusher is not exported` 계열 오류로 실패

- [ ] **Step 3: 구현한다**

`src/app/playground/coin-pusher/physics.ts` 끝에 추가:

```ts
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
  /** 기울기 이벤트가 주는 x축 가속도 */
  tiltAx: number;
  /** 진동 이벤트가 이번 스텝에 줄 임펄스 세기. 적용 후 0으로 돌아간다. */
  shakeImpulse: number;
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
  const limit = pusher.y + COIN_RADIUS;
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
          if (dx * dx + dy * dy <= (COIN_RADIUS * 2) ** 2) pairs.push([i, j]);
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
  }

  const pairs = candidatePairs(world.coins, COIN_RADIUS * 2);
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
```

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/physics.test.ts`
예상: 28 tests passed

- [ ] **Step 5: 커밋한다**

```bash
git add src/app/playground/coin-pusher/physics.ts src/app/playground/coin-pusher/physics.test.ts
git commit -m "feat: 푸셔 왕복·낙하 판정·월드 스텝 구현"
```

---

### Task 4: 랜덤 이벤트와 특수 코인

**Files:**
- Create: `src/app/playground/coin-pusher/events.ts`
- Test: `src/app/playground/coin-pusher/events.test.ts`

**Interfaces:**
- Consumes: Task 1의 `Rng`, `createRng`, `randRange`, `pick`; Task 2–3의 `World`, `CoinKind`, `Coin`
- Produces:
  - `const FINAL_SPURT_AT = 45`
  - `type EventType = "shake" | "tilt" | "rush"`
  - `interface ActiveEvent { type: EventType; remaining: number; magnitude: number }`
  - `interface Scheduler { rng: Rng; nextAt: number; active: ActiveEvent | null }`
  - `createScheduler(rng: Rng, startAt?: number): Scheduler`
  - `updateScheduler(s: Scheduler, elapsed: number, dt: number): EventType | null`
  - `applyScheduler(world: World, s: Scheduler): void`
  - `isFinalSpurt(elapsed: number): boolean`
  - `applyFinalSpurt(world: World, elapsed: number): void`
  - `rollNeutralKind(rng: Rng): CoinKind`
  - `kindMass(kind: CoinKind): number`
  - `kindRestitution(kind: CoinKind): number`

- [ ] **Step 1: 실패하는 테스트를 작성한다**

`src/app/playground/coin-pusher/events.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createRng } from "./random";
import {
  FINAL_SPURT_AT,
  createScheduler,
  updateScheduler,
  applyScheduler,
  isFinalSpurt,
  applyFinalSpurt,
  rollNeutralKind,
  kindMass,
  kindRestitution,
} from "./events";
import { FIXED_DT, createCoin, createPusher, type World } from "./physics";

function makeWorld(): World {
  return {
    board: { width: 400, fallLine: 320 },
    coins: [createCoin({ id: 1, x: 200, y: 100 })],
    pusher: createPusher(),
    tiltAx: 0,
    shakeImpulse: 0,
    fallen: [],
    elapsed: 0,
  };
}

function runScheduler(seed: number, seconds: number) {
  const s = createScheduler(createRng(seed));
  const fired: Array<{ type: string; at: number }> = [];
  let elapsed = 0;
  const steps = Math.round(seconds / FIXED_DT);
  for (let i = 0; i < steps; i++) {
    elapsed += FIXED_DT;
    const type = updateScheduler(s, elapsed, FIXED_DT);
    if (type) fired.push({ type, at: Number(elapsed.toFixed(3)) });
  }
  return fired;
}

describe("updateScheduler", () => {
  it("같은 시드는 같은 이벤트 시퀀스를 만든다", () => {
    expect(runScheduler(42, 60)).toEqual(runScheduler(42, 60));
  });

  it("60초 안에 이벤트가 여러 번 발생한다", () => {
    expect(runScheduler(42, 60).length).toBeGreaterThan(2);
  });

  it("세 종류 이벤트만 나온다", () => {
    for (const e of runScheduler(7, 120)) {
      expect(["shake", "tilt", "rush"]).toContain(e.type);
    }
  });

  it("이벤트는 시작했다가 반드시 끝난다", () => {
    const s = createScheduler(createRng(1), 0.1);
    let elapsed = 0;
    let sawActive = false;
    let sawEndedAfterActive = false;
    for (let i = 0; i < Math.round(60 / FIXED_DT); i++) {
      elapsed += FIXED_DT;
      updateScheduler(s, elapsed, FIXED_DT);
      if (s.active) sawActive = true;
      else if (sawActive) sawEndedAfterActive = true;
    }
    expect(sawActive).toBe(true);
    expect(sawEndedAfterActive).toBe(true);
  });

  it("다음 이벤트 예정 시각은 항상 현재보다 뒤다", () => {
    const s = createScheduler(createRng(3), 0.1);
    let elapsed = 0;
    for (let i = 0; i < Math.round(60 / FIXED_DT); i++) {
      elapsed += FIXED_DT;
      updateScheduler(s, elapsed, FIXED_DT);
      if (!s.active) expect(s.nextAt).toBeGreaterThanOrEqual(elapsed - FIXED_DT);
    }
  });
});

describe("applyScheduler", () => {
  it("tilt는 월드에 x 가속도를 준다", () => {
    const w = makeWorld();
    const s = createScheduler(createRng(1));
    s.active = { type: "tilt", remaining: 2, magnitude: 150 };
    applyScheduler(w, s);
    expect(Math.abs(w.tiltAx)).toBeCloseTo(150, 5);
  });

  it("rush는 푸셔 속도 배율을 올린다", () => {
    const w = makeWorld();
    const s = createScheduler(createRng(1));
    s.active = { type: "rush", remaining: 2, magnitude: 2 };
    applyScheduler(w, s);
    expect(w.pusher.speedScale).toBeCloseTo(2, 5);
  });

  it("shake는 코인 속도를 흔든다", () => {
    const w = makeWorld();
    const s = createScheduler(createRng(1));
    s.active = { type: "shake", remaining: 1, magnitude: 200 };
    applyScheduler(w, s);
    expect(Math.hypot(w.coins[0].vx, w.coins[0].vy)).toBeGreaterThan(0);
  });

  it("active가 없으면 월드를 기본값으로 되돌린다", () => {
    const w = makeWorld();
    w.tiltAx = 999;
    w.pusher.speedScale = 5;
    const s = createScheduler(createRng(1));
    s.active = null;
    applyScheduler(w, s);
    expect(w.tiltAx).toBe(0);
    expect(w.pusher.speedScale).toBe(1);
  });
});

describe("isFinalSpurt / applyFinalSpurt", () => {
  it("임계 시각 전에는 false", () => {
    expect(isFinalSpurt(FINAL_SPURT_AT - 1)).toBe(false);
  });

  it("임계 시각부터 true", () => {
    expect(isFinalSpurt(FINAL_SPURT_AT)).toBe(true);
  });

  it("막판에는 푸셔 행정이 길어진다", () => {
    const w = makeWorld();
    applyFinalSpurt(w, FINAL_SPURT_AT + 1);
    expect(w.pusher.strokeScale).toBeGreaterThan(1);
  });

  it("막판 전에는 행정을 건드리지 않는다", () => {
    const w = makeWorld();
    applyFinalSpurt(w, 10);
    expect(w.pusher.strokeScale).toBe(1);
  });
});

describe("rollNeutralKind", () => {
  it("참가자 코인 종류는 절대 나오지 않는다", () => {
    const rng = createRng(11);
    for (let i = 0; i < 500; i++) {
      expect(rollNeutralKind(rng)).not.toBe("player");
    }
  });

  it("세 종류가 모두 나온다", () => {
    const rng = createRng(11);
    const kinds = new Set(Array.from({ length: 500 }, () => rollNeutralKind(rng)));
    expect(kinds).toEqual(new Set(["neutral", "gold", "spring"]));
  });

  it("대부분은 평범한 중립 코인이다", () => {
    const rng = createRng(11);
    const rolls = Array.from({ length: 1000 }, () => rollNeutralKind(rng));
    const plain = rolls.filter((k) => k === "neutral").length;
    expect(plain).toBeGreaterThan(700);
  });
});

describe("kindMass / kindRestitution", () => {
  it("황금 코인이 가장 무겁다", () => {
    expect(kindMass("gold")).toBeGreaterThan(kindMass("neutral"));
    expect(kindMass("gold")).toBeGreaterThan(kindMass("player"));
  });

  it("참가자와 평범한 중립 코인은 질량이 같다", () => {
    expect(kindMass("player")).toBe(kindMass("neutral"));
  });

  it("스프링 코인이 가장 잘 튄다", () => {
    expect(kindRestitution("spring")).toBeGreaterThan(kindRestitution("neutral"));
    expect(kindRestitution("spring")).toBeGreaterThan(kindRestitution("player"));
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/events.test.ts`
예상: `Failed to resolve import "./events"` 로 실패

- [ ] **Step 3: 구현한다**

`src/app/playground/coin-pusher/events.ts`:

```ts
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

/** 진행 중인 이벤트를 월드에 반영한다. 이벤트가 없으면 기본값으로 되돌린다. */
export function applyScheduler(world: World, s: Scheduler): void {
  world.tiltAx = 0;
  world.pusher.speedScale = 1;
  world.shakeImpulse = 0;

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
  world.shakeImpulse = active.magnitude;
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
```

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/events.test.ts`
예상: 19 tests passed

- [ ] **Step 5: 린트를 확인한다**

실행: `npm run lint`
예상: `events.ts`에 미사용 import 경고가 없다

- [ ] **Step 6: 커밋한다**

```bash
git add src/app/playground/coin-pusher/events.ts src/app/playground/coin-pusher/events.test.ts
git commit -m "feat: 돌발 이벤트 스케줄러와 특수 코인 추가"
```

---

### Task 5: 참가자 파싱과 게임 초기화

**Files:**
- Create: `src/app/playground/coin-pusher/setup.ts`
- Test: `src/app/playground/coin-pusher/setup.test.ts`

**Interfaces:**
- Consumes: Task 1의 `createRng`, `randRange`, `randInt`, `Rng`; Task 2–3의 `Coin`, `World`, `createCoin`, `createPusher`, `COIN_RADIUS`; Task 4의 `rollNeutralKind`, `kindMass`, `kindRestitution`
- Produces:
  - `const BOARD_WIDTH = 420`, `const FALL_LINE = 220`
  - `interface QueuedCoin { coin: Coin; at: number }`
  - `interface Game { world: World; names: string[]; queue: QueuedCoin[]; seed: number; rng: Rng; nextCoinId: number }`
  - `parseNames(raw: string): string[]`
  - `createGame(names: string[], seed: number): Game`
  - `releaseDue(game: Game): Coin[]` — 투입 시각이 된 큐 코인을 월드로 옮기고 옮긴 코인들을 반환
  - `spawnNeutral(game: Game, count: number): void`
  - `allDropped(game: Game): boolean`

- [ ] **Step 1: 실패하는 테스트를 작성한다**

`src/app/playground/coin-pusher/setup.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  BOARD_WIDTH,
  FALL_LINE,
  parseNames,
  createGame,
  releaseDue,
  spawnNeutral,
  allDropped,
} from "./setup";
import { COIN_RADIUS, FIXED_DT, stepWorld } from "./physics";

describe("parseNames", () => {
  it("줄바꿈으로 나눈다", () => {
    expect(parseNames("주원\n민지\n현우")).toEqual(["주원", "민지", "현우"]);
  });

  it("쉼표로도 나눈다", () => {
    expect(parseNames("주원, 민지,현우")).toEqual(["주원", "민지", "현우"]);
  });

  it("앞뒤 공백을 지운다", () => {
    expect(parseNames("  주원  \n 민지 ")).toEqual(["주원", "민지"]);
  });

  it("빈 줄을 버린다", () => {
    expect(parseNames("주원\n\n\n민지\n")).toEqual(["주원", "민지"]);
  });

  it("중복은 처음 것만 남긴다", () => {
    expect(parseNames("주원\n민지\n주원")).toEqual(["주원", "민지"]);
  });

  it("빈 문자열이면 빈 배열", () => {
    expect(parseNames("   \n , ")).toEqual([]);
  });
});

describe("createGame", () => {
  const names = ["주원", "민지", "현우", "서연"];

  it("참가자 수만큼 코인을 큐에 넣는다", () => {
    const g = createGame(names, 1);
    expect(g.queue).toHaveLength(4);
    expect(g.queue.map((q) => q.coin.ownerIndex).sort()).toEqual([0, 1, 2, 3]);
  });

  it("참가자 코인은 처음엔 월드에 없다", () => {
    const g = createGame(names, 1);
    expect(g.world.coins.every((c) => c.ownerIndex === -1)).toBe(true);
  });

  it("중립 코인이 미리 깔려 있다", () => {
    const g = createGame(names, 1);
    expect(g.world.coins.length).toBeGreaterThan(0);
  });

  it("모든 코인은 판 안에 있다", () => {
    const g = createGame(names, 1);
    for (const c of [...g.world.coins, ...g.queue.map((q) => q.coin)]) {
      expect(c.x).toBeGreaterThanOrEqual(COIN_RADIUS);
      expect(c.x).toBeLessThanOrEqual(BOARD_WIDTH - COIN_RADIUS);
      expect(c.y).toBeLessThan(FALL_LINE);
    }
  });

  it("참가자 코인은 질량과 반발계수가 모두 같다", () => {
    const g = createGame(names, 1);
    const masses = new Set(g.queue.map((q) => q.coin.mass));
    const rest = new Set(g.queue.map((q) => q.coin.restitution));
    expect(masses.size).toBe(1);
    expect(rest.size).toBe(1);
  });

  it("참가자 코인에는 특수 종류가 붙지 않는다", () => {
    const g = createGame(names, 1);
    expect(g.queue.every((q) => q.coin.kind === "player")).toBe(true);
  });

  it("코인 id는 전부 다르다", () => {
    const g = createGame(names, 1);
    const ids = [...g.world.coins, ...g.queue.map((q) => q.coin)].map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("같은 시드면 같은 배치를 만든다", () => {
    const a = createGame(names, 777);
    const b = createGame(names, 777);
    expect(a.world.coins.map((c) => [c.x, c.y, c.kind])).toEqual(
      b.world.coins.map((c) => [c.x, c.y, c.kind]),
    );
  });

  it("다른 시드면 다른 배치를 만든다", () => {
    const a = createGame(names, 1);
    const b = createGame(names, 2);
    expect(a.world.coins.map((c) => [c.x, c.y])).not.toEqual(
      b.world.coins.map((c) => [c.x, c.y]),
    );
  });

  it("참가자가 많으면 중립 코인도 많아진다", () => {
    const few = createGame(["a", "b"], 5);
    const many = createGame(Array.from({ length: 40 }, (_, i) => `p${i}`), 5);
    expect(many.world.coins.length).toBeGreaterThan(few.world.coins.length);
  });
});

describe("releaseDue", () => {
  it("시각이 안 됐으면 아무것도 내보내지 않는다", () => {
    const g = createGame(["주원", "민지"], 1);
    g.world.elapsed = 0;
    const before = g.queue.length;
    releaseDue(g);
    expect(g.queue.length).toBe(before);
  });

  it("시간이 지나면 큐가 비고 월드로 옮겨진다", () => {
    const g = createGame(["주원", "민지", "현우"], 1);
    g.world.elapsed = 100;
    const released = releaseDue(g);
    expect(released).toHaveLength(3);
    expect(g.queue).toHaveLength(0);
    expect(g.world.coins.filter((c) => c.ownerIndex >= 0)).toHaveLength(3);
  });

  it("투입된 코인의 bornAt이 현재 시각으로 기록된다", () => {
    const g = createGame(["주원"], 1);
    g.world.elapsed = 3.5;
    const [coin] = releaseDue(g);
    expect(coin.bornAt).toBeCloseTo(3.5, 5);
  });
});

describe("spawnNeutral", () => {
  it("요청한 개수만큼 중립 코인을 넣는다", () => {
    const g = createGame(["주원"], 1);
    const before = g.world.coins.length;
    spawnNeutral(g, 5);
    expect(g.world.coins.length).toBe(before + 5);
  });

  it("새로 넣은 코인은 참가자 코인이 아니다", () => {
    const g = createGame(["주원"], 1);
    const before = g.world.coins.length;
    spawnNeutral(g, 5);
    for (const c of g.world.coins.slice(before)) {
      expect(c.ownerIndex).toBe(-1);
      expect(c.kind).not.toBe("player");
    }
  });

  it("id가 겹치지 않는다", () => {
    const g = createGame(["주원", "민지"], 1);
    spawnNeutral(g, 10);
    const ids = [...g.world.coins, ...g.queue.map((q) => q.coin)].map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("allDropped", () => {
  it("큐가 남아 있으면 false", () => {
    const g = createGame(["주원"], 1);
    expect(allDropped(g)).toBe(false);
  });

  it("큐가 비면 true", () => {
    const g = createGame(["주원"], 1);
    g.world.elapsed = 100;
    releaseDue(g);
    expect(allDropped(g)).toBe(true);
  });
});

describe("통합", () => {
  // 중립 코인을 계속 투입해야 코인 더미가 앞으로 나아간다. 보충이 없으면 마찰로 더미가
  // y~150 근처에서 멈춰서 낙하선을 아무리 당겨도 아무도 떨어지지 않는다.
  // 실제 게임 루프(CoinPusherGame)와 같은 주기로 보충하며 돌린다.
  function runUntilWinner(names: string[], seed: number, maxSeconds: number) {
    const g = createGame(names, seed);
    let nextNeutralAt = 1.4;
    for (let i = 0; i < Math.round(maxSeconds / FIXED_DT); i++) {
      releaseDue(g);
      if (allDropped(g) && g.world.elapsed >= nextNeutralAt) {
        spawnNeutral(g, 1);
        nextNeutralAt = g.world.elapsed + 1.4;
      }
      stepWorld(g.world, FIXED_DT);
      if (g.world.fallen.some((f) => f.coin.ownerIndex >= 0)) return g;
    }
    return g;
  }

  it("실제 루프대로 돌리면 참가자 코인이 떨어진다", () => {
    const g = runUntilWinner(["주원", "민지", "현우", "서연", "지호"], 2024, 120);
    expect(g.world.fallen.some((f) => f.coin.ownerIndex >= 0)).toBe(true);
  });

  it("중립 코인 보충이 없으면 더미가 낙하선에 못 미친다", () => {
    // 보충 없는 루프가 왜 안 되는지를 고정해 두는 회귀 테스트.
    // 이게 깨지면 마찰/푸셔 상수가 바뀐 것이므로 FALL_LINE을 다시 측정해야 한다.
    const g = createGame(["주원", "민지", "현우", "서연", "지호"], 2024);
    for (let i = 0; i < Math.round(120 / FIXED_DT); i++) {
      releaseDue(g);
      stepWorld(g.world, FIXED_DT);
    }
    expect(g.world.fallen.some((f) => f.coin.ownerIndex >= 0)).toBe(false);
  });

  it("여러 시드에서 모두 당첨자가 나온다", () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const g = runUntilWinner(["a", "b", "c", "d", "e", "f", "g", "h"], seed, 180);
      expect(g.world.fallen.some((f) => f.coin.ownerIndex >= 0)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/setup.test.ts`
예상: `Failed to resolve import "./setup"` 로 실패

- [ ] **Step 3: 구현한다**

`src/app/playground/coin-pusher/setup.ts`:

```ts
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
export const FALL_LINE = 220;

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
```

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/setup.test.ts`
예상: 24 tests passed

`FALL_LINE = 220`은 임의로 고른 값이 아니다. 시드 20개로 실제 게임 루프를 돌려 당첨까지 걸리는 시간을 재서 정했다:
150이면 절반이 1.5초 만에 끝나고, 300이면 전부 48~54초가 걸려 매 게임이 45초 막판 스퍼트를 지나 똑같아진다.
220은 11~48초로 편차가 가장 넓다. 이 값을 바꾸려면 다시 측정해야 한다.

- [ ] **Step 5: 전체 테스트를 돌린다**

실행: `npm test`
예상: 기존 종이비행기 테스트 포함 전부 통과

- [ ] **Step 6: 커밋한다**

```bash
git add src/app/playground/coin-pusher/setup.ts src/app/playground/coin-pusher/setup.test.ts
git commit -m "feat: 참가자 파싱과 게임 초기화 로직 추가"
```

---

### Task 6: 카메라 투영과 캔버스 드로잉

**Files:**
- Create: `src/app/playground/coin-pusher/render.ts`
- Test: `src/app/playground/coin-pusher/render.test.ts`

**Interfaces:**
- Consumes: Task 2–3의 `Coin`, `Board`, `World`, `COIN_RADIUS`, `PUSHER_BACK_Y`; Task 5의 `Game`
- Produces:
  - `const PERSPECTIVE_SCALE = 0.55`
  - `interface Viewport { w: number; h: number }`
  - `interface Camera { scale: number; offsetX: number; offsetY: number }`
  - `interface Palette` — 문자열 필드 `bg, board, boardEdge, pusher, coin, coinSide, gold, goldSide, spring, springSide, player, playerSide, text, accent`
  - `interface FallingCoin { coin: Coin; t: number }`
  - `computeCamera(vp: Viewport, board: Board): Camera`
  - `projectPoint(x: number, y: number, cam: Camera): { sx: number; sy: number }`
  - `readPalette(el: HTMLElement): Palette`
  - `drawScene(ctx, game, cam, palette, falling): void`

- [ ] **Step 1: 실패하는 테스트를 작성한다**

`src/app/playground/coin-pusher/render.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PERSPECTIVE_SCALE, computeCamera, projectPoint } from "./render";
import { type Board } from "./physics";

const board: Board = { width: 420, fallLine: 300 };

describe("computeCamera", () => {
  it("판 너비가 화면 안에 들어간다", () => {
    const vp = { w: 390, h: 780 };
    const cam = computeCamera(vp, board);
    const left = projectPoint(0, 0, cam).sx;
    const right = projectPoint(board.width, 0, cam).sx;
    expect(left).toBeGreaterThanOrEqual(0);
    expect(right).toBeLessThanOrEqual(vp.w);
  });

  it("화면이 넓어지면 배율도 커진다", () => {
    const small = computeCamera({ w: 390, h: 780 }, board);
    const large = computeCamera({ w: 900, h: 780 }, board);
    expect(large.scale).toBeGreaterThan(small.scale);
  });

  it("배율은 항상 양수다", () => {
    expect(computeCamera({ w: 100, h: 100 }, board).scale).toBeGreaterThan(0);
  });
});

describe("projectPoint", () => {
  const cam = computeCamera({ w: 390, h: 780 }, board);

  it("x가 커지면 화면 x도 커진다", () => {
    expect(projectPoint(200, 0, cam).sx).toBeGreaterThan(projectPoint(100, 0, cam).sx);
  });

  it("y가 커지면 화면 y도 커진다 (앞쪽이 아래)", () => {
    expect(projectPoint(0, 200, cam).sy).toBeGreaterThan(projectPoint(0, 100, cam).sy);
  });

  it("y축이 x축보다 압축된다", () => {
    const dx = projectPoint(100, 0, cam).sx - projectPoint(0, 0, cam).sx;
    const dy = projectPoint(0, 100, cam).sy - projectPoint(0, 0, cam).sy;
    expect(dy).toBeCloseTo(dx * PERSPECTIVE_SCALE, 5);
  });

  it("좌표는 항상 유한하다", () => {
    const p = projectPoint(0, 0, cam);
    expect(Number.isFinite(p.sx)).toBe(true);
    expect(Number.isFinite(p.sy)).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/render.test.ts`
예상: `Failed to resolve import "./render"` 로 실패

- [ ] **Step 3: 투영 계산을 구현한다**

`src/app/playground/coin-pusher/render.ts`:

```ts
import { COIN_RADIUS, PUSHER_BACK_Y, type Board, type Coin } from "./physics";
import type { Game } from "./setup";

/** 화면상 y축을 이 비율로 압축해 비스듬한 시점을 만든다 */
export const PERSPECTIVE_SCALE = 0.55;

const SIDE_PADDING = 16;

export interface Viewport {
  w: number;
  h: number;
}

export interface Camera {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function computeCamera(vp: Viewport, board: Board): Camera {
  const scale = Math.max(0.01, (vp.w - SIDE_PADDING * 2) / board.width);
  const projectedHeight = (board.fallLine - PUSHER_BACK_Y) * PERSPECTIVE_SCALE * scale;
  return {
    scale,
    offsetX: SIDE_PADDING,
    offsetY: Math.max(24, (vp.h - projectedHeight) / 2 - PUSHER_BACK_Y * PERSPECTIVE_SCALE * scale),
  };
}

export function projectPoint(x: number, y: number, cam: Camera): { sx: number; sy: number } {
  return {
    sx: cam.offsetX + x * cam.scale,
    sy: cam.offsetY + y * PERSPECTIVE_SCALE * cam.scale,
  };
}
```

- [ ] **Step 4: 테스트가 통과하는지 확인한다**

실행: `npx vitest run src/app/playground/coin-pusher/render.test.ts`
예상: 8 tests passed

- [ ] **Step 5: 드로잉 함수를 추가한다**

`src/app/playground/coin-pusher/render.ts` 끝에 추가:

```ts
export interface Palette {
  bg: string;
  board: string;
  boardEdge: string;
  pusher: string;
  coin: string;
  coinSide: string;
  gold: string;
  goldSide: string;
  spring: string;
  springSide: string;
  player: string;
  playerSide: string;
  text: string;
  accent: string;
}

export interface FallingCoin {
  coin: Coin;
  /** 낙하 연출 경과 시간(초) */
  t: number;
}

/** CSS 변수에서 팔레트를 읽는다. 다크모드 전환에 자동으로 따라간다. */
export function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const accent = v("--color-accent", "#2563eb");
  const border = v("--color-border", "#e5e7eb");
  const text = v("--color-text-primary", "#23272f");
  const cardBg = v("--color-card-bg", "#ffffff");
  return {
    bg: v("--color-bg", "#ffffff"),
    board: cardBg,
    boardEdge: border,
    pusher: border,
    coin: "#c9ced6",
    coinSide: "#9aa1ab",
    gold: "#f2c23e",
    goldSide: "#c99a1f",
    spring: "#5ec9a5",
    springSide: "#3d9c7c",
    player: accent,
    playerSide: accent,
    text,
    accent,
  };
}

const COIN_THICKNESS = 5;

function coinColors(coin: Coin, palette: Palette): [string, string] {
  if (coin.kind === "player") return [palette.player, palette.playerSide];
  if (coin.kind === "gold") return [palette.gold, palette.goldSide];
  if (coin.kind === "spring") return [palette.spring, palette.springSide];
  return [palette.coin, palette.coinSide];
}

function drawCoin(
  ctx: CanvasRenderingContext2D,
  coin: Coin,
  cam: Camera,
  palette: Palette,
  names: string[],
  yOffset: number,
  alpha: number,
): void {
  const { sx, sy } = projectPoint(coin.x, coin.y, cam);
  const y = sy + yOffset;
  const rx = COIN_RADIUS * cam.scale;
  const ry = rx * PERSPECTIVE_SCALE;
  const thickness = COIN_THICKNESS * cam.scale;
  const [top, side] = coinColors(coin, palette);

  ctx.save();
  ctx.globalAlpha = alpha;

  // 바닥 그림자
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(sx, y + thickness + 2, rx * 0.95, ry * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 옆면
  ctx.fillStyle = side;
  ctx.beginPath();
  ctx.ellipse(sx, y + thickness, rx, ry, 0, 0, Math.PI);
  ctx.rect(sx - rx, y, rx * 2, thickness);
  ctx.fill();

  // 윗면
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.ellipse(sx, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // 참가자 이름
  if (coin.ownerIndex >= 0) {
    const name = names[coin.ownerIndex] ?? "";
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${Math.max(8, rx * 0.62)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = name.length > 4 ? `${name.slice(0, 3)}…` : name;
    ctx.fillText(label, sx, y);
  }

  ctx.restore();
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  game: Game,
  cam: Camera,
  palette: Palette,
  falling: FallingCoin[],
): void {
  const { board } = game.world;
  const topLeft = projectPoint(0, PUSHER_BACK_Y, cam);
  const bottomRight = projectPoint(board.width, board.fallLine, cam);
  const boardW = bottomRight.sx - topLeft.sx;
  const boardH = bottomRight.sy - topLeft.sy;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // 판
  ctx.fillStyle = palette.board;
  ctx.fillRect(topLeft.sx, topLeft.sy, boardW, boardH);
  ctx.strokeStyle = palette.boardEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(topLeft.sx, topLeft.sy, boardW, boardH);

  // 낙하선 — 판 앞 가장자리
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(topLeft.sx, bottomRight.sy);
  ctx.lineTo(bottomRight.sx, bottomRight.sy);
  ctx.stroke();

  // 푸셔
  const pusherFront = projectPoint(0, game.world.pusher.y, cam);
  ctx.fillStyle = palette.pusher;
  ctx.fillRect(topLeft.sx, topLeft.sy, boardW, Math.max(0, pusherFront.sy - topLeft.sy));

  // 코인 — 뒤쪽부터 그려야 앞쪽 코인이 위로 겹친다
  const sorted = [...game.world.coins].sort((a, b) => a.y - b.y);
  for (const coin of sorted) {
    // 투입 직후 0.25초 동안 위에서 내려앉는 연출
    const age = game.world.elapsed - coin.bornAt;
    const dropOffset = age < 0.25 ? -(1 - age / 0.25) ** 2 * 60 * cam.scale : 0;
    drawCoin(ctx, coin, cam, palette, game.names, dropOffset, 1);
  }

  // 판 밖으로 떨어지는 코인 — 물리에서 분리된 순수 연출
  for (const f of falling) {
    const drop = 220 * f.t * f.t * cam.scale;
    const alpha = Math.max(0, 1 - f.t / 0.9);
    drawCoin(ctx, f.coin, cam, palette, game.names, drop, alpha);
  }
}
```

- [ ] **Step 6: 타입 검사와 린트를 확인한다**

실행: `npx tsc --noEmit`
예상: 에러 없음

실행: `npm run lint`
예상: 경고 없음

- [ ] **Step 7: 커밋한다**

```bash
git add src/app/playground/coin-pusher/render.ts src/app/playground/coin-pusher/render.test.ts
git commit -m "feat: 2.5D 카메라 투영과 캔버스 드로잉 추가"
```

---

### Task 7: 게임 루프와 캔버스 컴포넌트

**Files:**
- Create: `src/app/playground/coin-pusher/useGameLoop.ts`
- Create: `src/app/playground/coin-pusher/Stage.tsx`

**Interfaces:**
- Consumes: Task 2–6 전부
- Produces:
  - `useGameLoop(onStep: (dt: number) => void, onFrame: () => void, running: boolean, speed: number): void`
  - `<Stage game={game} falling={falling} className={string} />` — canvas를 렌더하고 매 프레임 `drawScene`을 호출한다
- 이 태스크는 물리와 렌더가 실제로 연결되는지 눈으로 확인하는 게 목적이다. 다음 태스크에서 상태 머신을 붙인다.

- [ ] **Step 1: 게임 루프 훅을 만든다**

`src/app/playground/coin-pusher/useGameLoop.ts`:

```ts
"use client";

import { useEffect, useRef } from "react";
import { FIXED_DT } from "./physics";

const MAX_STEPS_PER_FRAME = 12; // 탭 전환 후 폭주 방지

/**
 * 고정 타임스텝 누적기 + rAF 루프.
 * onStep은 항상 FIXED_DT 간격으로, onFrame은 프레임마다 한 번 호출된다.
 */
export function useGameLoop(
  onStep: (dt: number) => void,
  onFrame: () => void,
  running: boolean,
  speed: number,
): void {
  const stepRef = useRef(onStep);
  const frameRef = useRef(onFrame);
  const speedRef = useRef(speed);

  stepRef.current = onStep;
  frameRef.current = onFrame;
  speedRef.current = speed;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const tick = (now: number) => {
      const elapsed = Math.min(0.1, (now - last) / 1000) * speedRef.current;
      last = now;
      acc += elapsed;

      let steps = 0;
      while (acc >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
        stepRef.current(FIXED_DT);
        acc -= FIXED_DT;
        steps++;
      }
      if (steps === MAX_STEPS_PER_FRAME) acc = 0;

      frameRef.current();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}
```

- [ ] **Step 2: 캔버스 컴포넌트를 만든다**

`src/app/playground/coin-pusher/Stage.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, type RefObject } from "react";
import { computeCamera, drawScene, readPalette, type FallingCoin, type Palette } from "./render";
import type { Game } from "./setup";

export interface StageHandle {
  /** 현재 게임 상태를 캔버스에 한 번 그린다 */
  draw: () => void;
}

interface StageProps {
  gameRef: RefObject<Game | null>;
  fallingRef: RefObject<FallingCoin[]>;
  handleRef: RefObject<StageHandle | null>;
  className?: string;
}

export default function Stage({ gameRef, fallingRef, handleRef, className }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paletteRef = useRef<Palette | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const game = gameRef.current;
    if (!canvas || !game) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    if (!paletteRef.current) paletteRef.current = readPalette(canvas);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const cam = computeCamera({ w, h }, game.world.board);
    drawScene(ctx, game, cam, paletteRef.current, fallingRef.current);
  }, [gameRef, fallingRef]);

  useImperativeHandle(handleRef, () => ({ draw }), [draw]);

  // 테마가 바뀌면 팔레트를 다시 읽는다
  useEffect(() => {
    const observer = new MutationObserver(() => {
      paletteRef.current = null;
      draw();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  return <canvas ref={canvasRef} className={className} />;
}
```

- [ ] **Step 3: 타입 검사와 린트를 확인한다**

실행: `npx tsc --noEmit && npm run lint`
예상: 에러·경고 없음

- [ ] **Step 4: 커밋한다**

```bash
git add src/app/playground/coin-pusher/useGameLoop.ts src/app/playground/coin-pusher/Stage.tsx
git commit -m "feat: 고정 타임스텝 게임 루프와 캔버스 스테이지 추가"
```

---

### Task 8: 참가자 입력 패널

**Files:**
- Create: `src/app/playground/coin-pusher/SetupPanel.tsx`

**Interfaces:**
- Consumes: Task 5의 `parseNames`
- Produces: `<SetupPanel onStart={(names: string[]) => void} initialRaw?: string />`

- [ ] **Step 1: 입력 패널을 만든다**

`src/app/playground/coin-pusher/SetupPanel.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { parseNames } from "./setup";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 200;

interface SetupPanelProps {
  initialRaw?: string;
  onStart: (names: string[], raw: string) => void;
}

export default function SetupPanel({ initialRaw = "", onStart }: SetupPanelProps) {
  const [raw, setRaw] = useState(initialRaw);
  const names = useMemo(() => parseNames(raw), [raw]);

  const tooFew = names.length < MIN_PLAYERS;
  const tooMany = names.length > MAX_PLAYERS;
  const canStart = !tooFew && !tooMany;

  return (
    <div className="mx-auto w-full max-w-lg">
      <span className="mb-3 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Coin Pusher
      </span>
      <h1 className="font-display text-2xl font-bold leading-snug tracking-tight md:text-3xl">
        코인 밀기 추첨기
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        참가자 이름을 넣으면 각자의 코인이 판 위로 쏟아집니다. 푸셔에 밀려 가장 먼저 앞으로
        떨어진 코인의 주인이 당첨.
      </p>

      <label htmlFor="players" className="mt-8 block text-xs font-medium text-text-muted">
        참가자 (줄바꿈 또는 쉼표로 구분)
      </label>
      <textarea
        id="players"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={8}
        placeholder={"주원\n민지\n현우\n서연"}
        className="mt-2 w-full resize-y rounded-2xl border border-border bg-card-bg p-4 font-mono text-sm text-text-primary outline-none transition focus:border-accent"
      />

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-text-muted">
          {names.length}명
          {tooFew && " — 2명 이상 넣어주세요"}
          {tooMany && ` — 최대 ${MAX_PLAYERS}명까지`}
        </span>
        <button
          type="button"
          onClick={() => setRaw("")}
          className="text-text-muted underline-offset-4 transition hover:text-text-primary hover:underline"
        >
          비우기
        </button>
      </div>

      {names.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {names.slice(0, 60).map((name) => (
            <span
              key={name}
              className="rounded-full bg-tag-bg px-2.5 py-0.5 text-[11px] font-medium text-text-muted"
            >
              {name}
            </span>
          ))}
          {names.length > 60 && (
            <span className="px-1 text-[11px] text-text-muted">외 {names.length - 60}명</span>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={!canStart}
        onClick={() => onStart(names, raw)}
        className="mt-8 w-full rounded-2xl bg-accent px-6 py-4 font-display text-sm font-semibold text-white shadow-ambient transition hover:shadow-ambient-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        코인 쏟아붓기
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 타입 검사와 린트를 확인한다**

실행: `npx tsc --noEmit && npm run lint`
예상: 에러·경고 없음

- [ ] **Step 3: 커밋한다**

```bash
git add src/app/playground/coin-pusher/SetupPanel.tsx
git commit -m "feat: 참가자 입력 패널 추가"
```

---

### Task 9: 당첨 오버레이

**Files:**
- Create: `src/app/playground/coin-pusher/WinnerOverlay.tsx`
- Create: `src/app/playground/coin-pusher/confetti.module.css`

**Interfaces:**
- Consumes: Task 1의 `createRng`, `randRange`
- Produces: `<WinnerOverlay name={string} seed={number} onRestart={() => void} onEdit={() => void} />`

- [ ] **Step 1: 오버레이를 만든다**

`src/app/playground/coin-pusher/WinnerOverlay.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import { createRng, randRange } from "./random";
import styles from "./confetti.module.css";

const CONFETTI_COUNT = 60;
const CONFETTI_COLORS = ["#f2c23e", "#5ec9a5", "#2563eb", "#ef6f6c", "#c9ced6"];

interface WinnerOverlayProps {
  name: string;
  seed: number;
  onRestart: () => void;
  onEdit: () => void;
}

export default function WinnerOverlay({ name, seed, onRestart, onEdit }: WinnerOverlayProps) {
  const confetti = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      left: randRange(rng, 0, 100),
      delay: randRange(rng, 0, 1.2),
      duration: randRange(rng, 1.8, 3.4),
      size: randRange(rng, 6, 12),
      color: CONFETTI_COLORS[Math.floor(rng() * CONFETTI_COLORS.length)],
      tilt: randRange(rng, -60, 60),
    }));
  }, [seed]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/92 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((c) => (
          <span
            key={c.id}
            className={`absolute top-[-8%] block rounded-[2px] ${styles.piece}`}
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * 1.6,
              backgroundColor: c.color,
              rotate: `${c.tilt}deg`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent">Winner</p>
        <p className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-6xl">
          {name}
        </p>
        <p className="mt-3 text-sm text-text-secondary">가장 먼저 떨어졌습니다 🪙</p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-2xl bg-accent px-8 py-3.5 font-display text-sm font-semibold text-white shadow-ambient transition hover:shadow-ambient-hover active:scale-[0.98]"
          >
            같은 인원으로 다시
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-2xl border border-border bg-card-bg px-8 py-3.5 font-display text-sm font-semibold text-text-primary transition hover:border-accent active:scale-[0.98]"
          >
            참가자 수정
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 컨페티 애니메이션 CSS 모듈을 만든다**

종이비행기가 `effects.module.css`를 쓰는 것과 같은 방식이다. `src/app/playground/coin-pusher/confetti.module.css`:

```css
@keyframes coin-confetti-fall {
  0% {
    translate: 0 0;
    opacity: 1;
  }
  100% {
    translate: 0 115vh;
    opacity: 0.9;
  }
}

.piece {
  animation-name: coin-confetti-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
```

인라인 스타일의 `rotate`와 keyframes의 `translate`는 별개의 CSS 속성이라 서로 덮어쓰지 않는다. `transform` 한 속성에 둘을 몰아넣으면 회전이 사라지므로 이렇게 나눈다.

- [ ] **Step 3: 타입 검사와 린트를 확인한다**

실행: `npx tsc --noEmit && npm run lint`
예상: 에러·경고 없음

- [ ] **Step 4: 커밋한다**

```bash
git add src/app/playground/coin-pusher/
git commit -m "feat: 당첨 오버레이와 컨페티 연출 추가"
```

---

### Task 10: 상태 머신과 페이지 연결

**Files:**
- Create: `src/app/playground/coin-pusher/CoinPusherGame.tsx`
- Create: `src/app/playground/coin-pusher/page.tsx`

**Interfaces:**
- Consumes: Task 3–9 전부
- Produces: `/playground/coin-pusher`에서 실제로 플레이 가능한 페이지

- [ ] **Step 1: 상태 머신 컴포넌트를 만든다**

`src/app/playground/coin-pusher/CoinPusherGame.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import SetupPanel from "./SetupPanel";
import Stage, { type StageHandle } from "./Stage";
import WinnerOverlay from "./WinnerOverlay";
import { useGameLoop } from "./useGameLoop";
import { createRng } from "./random";
import {
  applyFinalSpurt,
  applyScheduler,
  createScheduler,
  isFinalSpurt,
  updateScheduler,
  type EventType,
  type Scheduler,
} from "./events";
import { FIXED_DT, stepWorld, winnerOf } from "./physics";
import { allDropped, createGame, releaseDue, spawnNeutral, type Game } from "./setup";
import type { FallingCoin } from "./render";

type Phase = "setup" | "playing" | "result";

const EVENT_LABEL: Record<EventType, string> = {
  shake: "판이 흔들린다!",
  tilt: "판이 기울어진다!",
  rush: "푸셔 가속!",
};

/** 중립 코인 추가 투입 간격(초) */
const NEUTRAL_INTERVAL = 1.4;
const NEUTRAL_INTERVAL_SPURT = 0.35;
const FALL_ANIM_SECONDS = 0.9;

/**
 * 한 스텝 진행. React 상태를 건드리지 않으므로 rAF 루프와 "결과 바로 보기"의
 * 빠른 시뮬레이션이 같은 코드를 쓴다. falling 배열은 제자리에서 수정한다.
 */
function simulate(
  game: Game,
  scheduler: Scheduler,
  falling: FallingCoin[],
  nextNeutralAt: { current: number },
  dt: number,
): EventType | null {
  releaseDue(game);

  const fired = updateScheduler(scheduler, game.world.elapsed, dt);
  applyScheduler(game.world, scheduler);
  applyFinalSpurt(game.world, game.world.elapsed);

  // 참가자 코인이 전부 들어온 뒤부터 중립 코인을 계속 투입한다
  if (allDropped(game) && game.world.elapsed >= nextNeutralAt.current) {
    const spurt = isFinalSpurt(game.world.elapsed);
    spawnNeutral(game, spurt ? 3 : 1);
    nextNeutralAt.current =
      game.world.elapsed + (spurt ? NEUTRAL_INTERVAL_SPURT : NEUTRAL_INTERVAL);
  }

  const fallenBefore = game.world.fallen.length;
  stepWorld(game.world, dt);

  // 이번 스텝에 떨어진 코인을 낙하 연출 목록에 넣는다
  for (let i = fallenBefore; i < game.world.fallen.length; i++) {
    falling.push({ coin: game.world.fallen[i].coin, t: 0 });
  }
  for (let i = falling.length - 1; i >= 0; i--) {
    falling[i].t += dt;
    if (falling[i].t >= FALL_ANIM_SECONDS) falling.splice(i, 1);
  }

  return fired;
}

export default function CoinPusherGame() {
  const gameRef = useRef<Game | null>(null);
  const schedulerRef = useRef<Scheduler | null>(null);
  const fallingRef = useRef<FallingCoin[]>([]);
  const stageRef = useRef<StageHandle | null>(null);
  const nextNeutralAtRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("setup");
  const [raw, setRaw] = useState("");
  const [seed, setSeed] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);

  const begin = useCallback((names: string[], rawText: string) => {
    // 시드는 매 게임마다 새로 뽑는다. 이후 모든 난수는 이 시드에서 파생된다.
    const nextSeed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    const game = createGame(names, nextSeed);
    gameRef.current = game;
    schedulerRef.current = createScheduler(createRng(nextSeed ^ 0x9e3779b9));
    fallingRef.current = [];
    nextNeutralAtRef.current = NEUTRAL_INTERVAL;

    setRaw(rawText);
    setSeed(nextSeed);
    setWinner(null);
    setRemaining(names.length);
    setElapsed(0);
    setBanner(null);
    setSpeed(1);
    setPhase("playing");
  }, []);

  const onStep = useCallback((dt: number) => {
    const game = gameRef.current;
    const scheduler = schedulerRef.current;
    if (!game || !scheduler) return;

    const fired = simulate(game, scheduler, fallingRef.current, nextNeutralAtRef, dt);
    if (fired) setBanner(EVENT_LABEL[fired]);
    else if (scheduler.active === null) setBanner(null);

    const win = winnerOf(game.world);
    if (win) {
      setWinner(game.names[win.coin.ownerIndex] ?? "");
      setSpeed(0.25); // 슬로우모션으로 낙하를 보여준다
    }
  }, []);

  const onFrame = useCallback(() => {
    stageRef.current?.draw();
    const game = gameRef.current;
    if (!game) return;
    setElapsed(game.world.elapsed);
    setRemaining(game.queue.length + game.world.coins.filter((c) => c.ownerIndex >= 0).length);
    // 당첨 코인의 낙하 연출이 끝나면 결과 화면으로 넘어간다
    if (winnerOf(game.world) && fallingRef.current.length === 0) setPhase("result");
  }, []);

  useGameLoop(onStep, onFrame, phase === "playing", speed);

  const skip = useCallback(() => {
    const game = gameRef.current;
    const scheduler = schedulerRef.current;
    if (!game || !scheduler) return;

    // 결과가 나올 때까지 시뮬레이션만 빠르게 돌린다 (최대 3분치)
    const maxSteps = Math.round(180 / FIXED_DT);
    for (let i = 0; i < maxSteps && !winnerOf(game.world); i++) {
      simulate(game, scheduler, fallingRef.current, nextNeutralAtRef, FIXED_DT);
    }

    const win = winnerOf(game.world);
    if (!win) return;
    fallingRef.current.length = 0;
    setWinner(game.names[win.coin.ownerIndex] ?? "");
    setPhase("result");
  }, []);

  const showOverlay = phase === "result" && winner !== null;

  if (phase === "setup") {
    return (
      <div className="animate-fade-in-up px-4 py-10">
        <SetupPanel initialRaw={raw} onStart={begin} />
        <p className="mt-8 text-center text-xs text-text-muted">
          <Link href="/playground" className="underline-offset-4 hover:underline">
            ← 플레이그라운드로
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] text-xs text-text-muted">
        <span>남은 코인 {remaining}개</span>
        <span className="tabular-nums">{elapsed.toFixed(1)}초</span>
      </div>

      <div className="flex h-8 items-center justify-center">
        {banner && (
          <span className="animate-fade-in-up rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent">
            {banner}
          </span>
        )}
      </div>

      <Stage
        gameRef={gameRef}
        fallingRef={fallingRef}
        handleRef={stageRef}
        className="w-full flex-1"
      />

      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <button
          type="button"
          onClick={skip}
          className="w-full rounded-2xl border border-border bg-card-bg px-6 py-3 font-display text-sm font-semibold text-text-secondary transition hover:border-accent hover:text-text-primary active:scale-[0.98]"
        >
          결과 바로 보기
        </button>
      </div>

      {showOverlay && (
        <WinnerOverlay
          name={winner}
          seed={seed}
          onRestart={() => begin(gameRef.current?.names ?? [], raw)}
          onEdit={() => setPhase("setup")}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: 페이지를 만든다**

`src/app/playground/coin-pusher/page.tsx`:

```tsx
import type { Metadata } from "next";
import CoinPusherGame from "./CoinPusherGame";

export const metadata: Metadata = {
  title: "코인 밀기 추첨기",
  description:
    "참가자 이름을 넣으면 코인이 판 위로 쏟아지고, 푸셔에 밀려 가장 먼저 떨어진 코인의 주인이 당첨되는 추첨기.",
};

export default function CoinPusherPage() {
  return (
    <main>
      <CoinPusherGame />
    </main>
  );
}
```

- [ ] **Step 3: 타입 검사와 린트를 확인한다**

실행: `npx tsc --noEmit && npm run lint`
예상: 에러·경고 없음

- [ ] **Step 4: 개발 서버에서 직접 확인한다**

실행: `npm run dev`

`http://localhost:3000/playground/coin-pusher` 에서 확인할 것:
1. 이름 4개 이상 넣고 "코인 쏟아붓기"를 누르면 판과 코인이 그려진다
2. 코인이 우르르 떨어진 뒤 푸셔가 왕복하며 코인 더미를 앞으로 민다
3. 코인이 앞 가장자리 밖으로 떨어지는 게 보인다
4. 상단 배너에 이벤트 문구가 가끔 뜬다
5. 참가자 코인이 처음 떨어지면 슬로우모션 후 당첨 오버레이가 뜬다
6. "같은 인원으로 다시" / "참가자 수정" 버튼이 각각 동작한다
7. "결과 바로 보기"를 누르면 즉시 당첨자가 나온다
8. 브라우저 콘솔에 에러·경고가 없다

문제가 있으면 고치고 이 단계를 다시 수행한다.

- [ ] **Step 5: 커밋한다**

```bash
git add src/app/playground/coin-pusher/
git commit -m "feat: 코인 푸셔 상태 머신과 페이지 연결"
```

---

### Task 11: 플레이그라운드 카드 등록과 마무리 점검

**Files:**
- Modify: `src/lib/projects.ts`

**Interfaces:**
- Consumes: Task 10의 `/playground/coin-pusher` 라우트
- Produces: 플레이그라운드 목록에 코인 푸셔 카드

- [ ] **Step 1: 카드를 추가한다**

`src/lib/projects.ts`의 `projects` 배열 맨 앞에 항목을 추가한다:

```ts
export const projects: Project[] = [
  {
    title: "코인 밀기 추첨기",
    description: "코인을 쏟아붓고 먼저 떨어진 사람이 당첨 🪙",
    tags: ["Game", "Canvas", "Physics"],
    href: "/playground/coin-pusher",
  },
  {
    title: "종이비행기 날리기",
    description: "입김으로 부는 종이비행기 게임 🐱🛩️",
    tags: ["Game", "Web Audio", "Supabase"],
    href: "/playground/paper-plane",
  },
  {
    title: "joowonkoh.com",
    description: "이 사이트! Next.js + MDX 블로그",
    tags: ["Next.js", "TypeScript"],
    href: "https://github.com/joowonkoh",
  },
];
```

- [ ] **Step 2: 전체 테스트를 돌린다**

실행: `npm test`
예상: 종이비행기 + 코인 푸셔 테스트 전부 통과

- [ ] **Step 3: 빌드를 확인한다**

실행: `npm run build`
예상: 빌드 성공. `/playground/coin-pusher` 라우트가 출력 목록에 있다

- [ ] **Step 4: 모바일 화면에서 확인한다**

실행: `npm run dev`

Chrome DevTools 기기 모드(iPhone 14 Pro, 393×852)에서 `/playground/coin-pusher` 확인:
1. 판 전체가 세로 화면 안에 들어온다
2. 코인 위 이름이 읽힌다
3. 하단 "결과 바로 보기" 버튼이 홈 인디케이터에 가리지 않는다
4. 게임 중 페이지가 가로로 스크롤되지 않는다

판이 화면을 벗어나면 `render.ts`의 `SIDE_PADDING`을 키우거나 `setup.ts`의 `FALL_LINE`을 줄여 조정한다.

- [ ] **Step 5: 다크모드에서 확인한다**

시스템 테마를 다크로 바꾸고 같은 페이지를 연다. 판·코인·텍스트 대비가 충분한지 확인한다. `render.ts`의 `readPalette`가 CSS 변수를 읽으므로 색이 자동으로 따라와야 한다. 코인 회색(`#c9ced6`)이 다크 배경에서 지나치게 튀면 `readPalette` 안에서 `--color-bg`의 밝기를 보고 어두운 회색으로 바꾸도록 조정한다.

- [ ] **Step 6: 커밋한다**

```bash
git add src/lib/projects.ts
git commit -m "feat: 플레이그라운드에 코인 밀기 추첨기 카드 추가"
```

---

## 완료 기준

- `npm test` 통과 (코인 푸셔 테스트 약 90개 + 기존 종이비행기 테스트)
- `npm run lint` 경고 없음
- `npx tsc --noEmit` 에러 없음
- `npm run build` 성공
- `/playground/coin-pusher`에서 이름 입력 → 코인 낙하 → 푸셔 밀기 → 당첨자 발표까지 끊김 없이 진행
- 참가자 50명 기준 데스크톱에서 부드럽게 동작
- 라이트/다크 모드 모두에서 판과 코인이 읽힌다
