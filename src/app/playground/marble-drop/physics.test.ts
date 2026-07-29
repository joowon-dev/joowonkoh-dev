import { describe, expect, it } from "vitest";
import {
  BUMPER_MIN_KICK,
  BUMPER_RESTITUTION,
  GRAVITY,
  MARBLE_MAX_AGE,
  MARBLE_RADIUS,
  MAX_SPEED,
  PENETRATION_SLOP,
  RESTING_SPEED,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  candidatePairs,
  clampToWalls,
  closestPointOnSegment,
  collectIntoBuckets,
  createMarble,
  createSegment,
  leadingBucket,
  resolveCircle,
  resolvePair,
  resolveSegment,
  segmentBounds,
  stepWorld,
  surfaceVelocityAt,
  winnerBucket,
  type Bucket,
  type World,
} from "./physics";

function bucket(overrides: Partial<Bucket> = {}): Bucket {
  return {
    ownerIndex: 0,
    x0: 0,
    x1: WORLD_WIDTH,
    top: WORLD_HEIGHT - 20,
    capacity: 3,
    count: 0,
    perRow: 4,
    filledAt: null,
    ...overrides,
  };
}

function world(overrides: Partial<World> = {}): World {
  return {
    marbles: [],
    staticSolids: [],
    buckets: [],
    elapsed: 0,
    captures: [],
    ...overrides,
  };
}

const horizontal = createSegment({ x1: 0, y1: 10, x2: 20, y2: 10, half: 1 });

describe("closestPointOnSegment", () => {
  it("선분 안쪽에서는 수선의 발을 준다", () => {
    expect(closestPointOnSegment(10, 0, horizontal)).toEqual({ x: 10, y: 10 });
  });

  it("선분 밖에서는 가까운 끝점으로 잘린다", () => {
    expect(closestPointOnSegment(-50, 10, horizontal)).toEqual({ x: 0, y: 10 });
    expect(closestPointOnSegment(999, 10, horizontal)).toEqual({ x: 20, y: 10 });
  });

  it("길이가 0인 선분은 그 점을 준다", () => {
    const dot = createSegment({ x1: 5, y1: 5, x2: 5, y2: 5, half: 1 });
    expect(closestPointOnSegment(100, 100, dot)).toEqual({ x: 5, y: 5 });
  });
});

describe("surfaceVelocityAt", () => {
  it("정지한 도형은 0", () => {
    expect(surfaceVelocityAt(horizontal, 10, 10)).toEqual({ x: 0, y: 0 });
  });

  it("평행이동은 어느 점에서나 같은 속도", () => {
    const s = createSegment({ ...horizontal, vx: 7 });
    expect(surfaceVelocityAt(s, 0, 10)).toEqual({ x: 7, y: 0 });
    expect(surfaceVelocityAt(s, 20, 10)).toEqual({ x: 7, y: 0 });
  });

  it("회전은 중심에서 멀수록 빠르고 방향이 접선이다", () => {
    const s = createSegment({ ...horizontal, spin: { cx: 0, cy: 10, omega: 2 } });
    // 중심에서 오른쪽으로 5 떨어진 점 → 접선 속도는 +y 방향으로 omega*r
    expect(surfaceVelocityAt(s, 5, 10)).toEqual({ x: 0, y: 10 });
    // 중심 위에서는 0
    expect(surfaceVelocityAt(s, 0, 10)).toEqual({ x: 0, y: 0 });
  });
});

describe("segmentBounds", () => {
  it("두께를 포함해 감싼다", () => {
    expect(segmentBounds(horizontal)).toEqual({ minX: -1, maxX: 21, minY: 9, maxY: 11 });
  });
});

describe("resolvePair", () => {
  const d = MARBLE_RADIUS * 2;

  it("겹친 두 구슬을 한 번에 완전히 떼어놓지는 않는다", () => {
    const a = createMarble({ id: 0, x: 0, y: 0 });
    const b = createMarble({ id: 1, x: d - 1, y: 0 });
    resolvePair(a, b);
    const gap = b.x - a.x;
    expect(gap).toBeGreaterThan(d - 1);
    expect(gap).toBeLessThan(d);
  });

  it("여러 번 돌리면 슬롭만큼만 남기고 수렴한다", () => {
    const a = createMarble({ id: 0, x: 0, y: 0 });
    const b = createMarble({ id: 1, x: d - 1, y: 0 });
    for (let i = 0; i < 60; i++) resolvePair(a, b);
    expect(b.x - a.x).toBeCloseTo(d - PENETRATION_SLOP, 3);
  });

  it("슬롭 이하의 겹침은 건드리지 않는다", () => {
    const a = createMarble({ id: 0, x: 0, y: 0 });
    const b = createMarble({ id: 1, x: d - PENETRATION_SLOP / 2, y: 0 });
    const before = b.x;
    resolvePair(a, b);
    expect(b.x).toBe(before);
  });

  it("떨어져 있으면 아무것도 하지 않는다", () => {
    const a = createMarble({ id: 0, x: 0, y: 0, vx: 5 });
    const b = createMarble({ id: 1, x: d + 1, y: 0 });
    resolvePair(a, b);
    expect(a.vx).toBe(5);
    expect(b.vx).toBe(0);
  });

  it("느리게 맞닿으면 튕기지 않는다", () => {
    const slow = RESTING_SPEED / 2;
    const a = createMarble({ id: 0, x: 0, y: 0, vx: slow });
    const b = createMarble({ id: 1, x: d - 0.5, y: 0, vx: 0 });
    resolvePair(a, b);
    // 반발계수 0 → 접근 속도가 사라지고 둘이 같은 속도가 된다
    expect(a.vx).toBeCloseTo(b.vx, 6);
  });

  it("빠르게 부딪히면 서로 반대로 튄다", () => {
    const a = createMarble({ id: 0, x: 0, y: 0, vx: 60 });
    const b = createMarble({ id: 1, x: d - 0.5, y: 0, vx: 0 });
    resolvePair(a, b);
    expect(b.vx).toBeGreaterThan(a.vx);
  });

  it("완전히 겹쳐도 나눠진다", () => {
    const a = createMarble({ id: 0, x: 5, y: 5 });
    const b = createMarble({ id: 1, x: 5, y: 5 });
    resolvePair(a, b);
    expect(a.x).not.toBe(b.x);
  });
});

describe("resolveSegment", () => {
  it("파고든 구슬을 선분 밖으로 밀어낸다", () => {
    const m = createMarble({ id: 0, x: 10, y: 10.5 });
    resolveSegment(m, horizontal);
    expect(m.y).toBeGreaterThan(10.5);
  });

  it("닿지 않으면 아무것도 하지 않는다", () => {
    const m = createMarble({ id: 0, x: 10, y: 0, vy: 3 });
    resolveSegment(m, horizontal);
    expect(m.y).toBe(0);
    expect(m.vy).toBe(3);
  });

  it("빠르게 떨어지면 위로 튄다", () => {
    const m = createMarble({ id: 0, x: 10, y: 10 - MARBLE_RADIUS - 0.5, vy: 60 });
    resolveSegment(m, horizontal);
    expect(m.vy).toBeLessThan(0);
  });

  it("움직이는 표면이 구슬을 접선 방향으로 끌고 간다", () => {
    const moving = createSegment({ ...horizontal, vx: 40 });
    const m = createMarble({ id: 0, x: 10, y: 10 - MARBLE_RADIUS - 0.2, vx: 0, vy: 5 });
    resolveSegment(m, moving);
    expect(m.vx).toBeGreaterThan(0);
  });

  it("가만히 있는 표면은 구슬을 옆으로 끌지 않는다", () => {
    const m = createMarble({ id: 0, x: 10, y: 10 - MARBLE_RADIUS - 0.2, vx: 0, vy: 5 });
    resolveSegment(m, horizontal);
    expect(m.vx).toBeCloseTo(0, 6);
  });
});

describe("resolveCircle", () => {
  const bumper = { cx: 0, cy: 0, radius: 4, restitution: BUMPER_RESTITUTION, minKick: BUMPER_MIN_KICK };

  it("느리게 닿아도 최소 세기로 튕겨낸다", () => {
    const m = createMarble({ id: 0, x: 0, y: -(4 + MARBLE_RADIUS - 0.1), vy: 0.5 });
    resolveCircle(m, bumper);
    // 바깥(위쪽) 방향 속도가 최소 킥 이상
    expect(-m.vy).toBeGreaterThanOrEqual(BUMPER_MIN_KICK - 1e-6);
  });

  it("들어온 것보다 세게 튕겨낸다", () => {
    const incoming = 50;
    const m = createMarble({ id: 0, x: 0, y: -(4 + MARBLE_RADIUS - 0.1), vy: incoming });
    resolveCircle(m, bumper);
    expect(-m.vy).toBeGreaterThan(incoming);
  });

  it("닿지 않으면 아무것도 하지 않는다", () => {
    const m = createMarble({ id: 0, x: 50, y: 0, vx: 1 });
    resolveCircle(m, bumper);
    expect(m.x).toBe(50);
    expect(m.vx).toBe(1);
  });
});

describe("clampToWalls", () => {
  it("왼쪽 벽에서 오른쪽으로 되튄다", () => {
    const m = createMarble({ id: 0, x: -5, y: 10, vx: -30 });
    clampToWalls(m);
    expect(m.x).toBe(MARBLE_RADIUS);
    expect(m.vx).toBeGreaterThan(0);
  });

  it("오른쪽 벽에서 왼쪽으로 되튄다", () => {
    const m = createMarble({ id: 0, x: WORLD_WIDTH + 5, y: 10, vx: 30 });
    clampToWalls(m);
    expect(m.x).toBe(WORLD_WIDTH - MARBLE_RADIUS);
    expect(m.vx).toBeLessThan(0);
  });

  it("안쪽에 있으면 건드리지 않는다", () => {
    const m = createMarble({ id: 0, x: 50, y: 10, vx: 9 });
    clampToWalls(m);
    expect(m.x).toBe(50);
    expect(m.vx).toBe(9);
  });
});

describe("candidatePairs", () => {
  it("겹치는 쌍만 i<j로 한 번씩 준다", () => {
    const marbles = [
      createMarble({ id: 0, x: 10, y: 10 }),
      createMarble({ id: 1, x: 10 + MARBLE_RADIUS, y: 10 }),
      createMarble({ id: 2, x: 90, y: 90 }),
    ];
    const pairs = candidatePairs(marbles, MARBLE_RADIUS * 2);
    expect(pairs).toEqual([[0, 1]]);
  });

  it("셀 경계를 사이에 둔 쌍도 찾는다", () => {
    const cell = MARBLE_RADIUS * 2;
    const marbles = [
      createMarble({ id: 0, x: cell - 0.05, y: 10 }),
      createMarble({ id: 1, x: cell + 0.05, y: 10 }),
    ];
    expect(candidatePairs(marbles, cell)).toEqual([[0, 1]]);
  });
});

describe("collectIntoBuckets", () => {
  it("입구를 넘은 구슬을 담고 물리에서 뺀다", () => {
    const b = bucket({ x0: 0, x1: 50 });
    const w = world({
      buckets: [b],
      marbles: [
        createMarble({ id: 0, x: 25, y: b.top + MARBLE_RADIUS + 0.1 }),
        createMarble({ id: 1, x: 25, y: b.top - 5 }),
      ],
    });
    collectIntoBuckets(w);
    expect(b.count).toBe(1);
    expect(w.marbles.map((m) => m.id)).toEqual([1]);
    expect(w.captures).toHaveLength(1);
  });

  it("x 범위 밖이면 담기지 않는다", () => {
    const b = bucket({ x0: 0, x1: 20 });
    const w = world({
      buckets: [b],
      marbles: [createMarble({ id: 0, x: 60, y: b.top + 10 })],
    });
    collectIntoBuckets(w);
    expect(b.count).toBe(0);
    expect(w.marbles).toHaveLength(1);
  });

  it("정원을 채우는 순간 시각이 기록되고 그 뒤로 갱신되지 않는다", () => {
    const b = bucket({ x0: 0, x1: 50, capacity: 2, count: 1 });
    const w = world({
      buckets: [b],
      elapsed: 4,
      marbles: [createMarble({ id: 0, x: 25, y: b.top + 5 })],
    });
    collectIntoBuckets(w);
    expect(b.filledAt).toBe(4);

    w.elapsed = 9;
    w.marbles = [createMarble({ id: 1, x: 25, y: b.top + 5 })];
    collectIntoBuckets(w);
    expect(b.filledAt).toBe(4);
  });

  it("정원을 넘겨 세지 않는다 — 넘치면 화면에 48/46이 뜬다", () => {
    const b = bucket({ x0: 0, x1: 50, capacity: 2, count: 2, filledAt: 1 });
    const w = world({
      buckets: [b],
      elapsed: 5,
      marbles: [createMarble({ id: 0, x: 25, y: b.top + 5 })],
    });
    collectIntoBuckets(w);
    expect(b.count).toBe(2);
    // 그래도 구슬은 물리에서 빠진다 — 양동이 안에 남아 떠다니면 안 된다
    expect(w.marbles).toHaveLength(0);
  });
});

describe("stepWorld", () => {
  it("중력이 구슬을 아래로 가속한다", () => {
    const m = createMarble({ id: 0, x: 50, y: 10 });
    const w = world({ marbles: [m] });
    stepWorld(w, 0.1, [], []);
    expect(m.vy).toBeGreaterThan(0);
    expect(m.vy).toBeLessThanOrEqual(GRAVITY * 0.1);
    expect(m.y).toBeGreaterThan(10);
  });

  it("속도에 상한이 있다 — 얇은 블록을 통과하지 못하게 한다", () => {
    const m = createMarble({ id: 0, x: 50, y: 10, vy: MAX_SPEED * 10 });
    const w = world({ marbles: [m] });
    stepWorld(w, 1 / 120, [], []);
    expect(Math.hypot(m.vx, m.vy)).toBeLessThanOrEqual(MAX_SPEED + 1e-6);
  });

  it("한 스텝 이동 거리가 구슬 반지름을 넘지 않는다", () => {
    const m = createMarble({ id: 0, x: 50, y: 10, vy: MAX_SPEED });
    const w = world({ marbles: [m] });
    const before = m.y;
    stepWorld(w, 1 / 120, [], []);
    expect(m.y - before).toBeLessThan(MARBLE_RADIUS);
  });

  it("오래된 구슬을 회수한다", () => {
    const w = world({
      elapsed: MARBLE_MAX_AGE + 5,
      marbles: [createMarble({ id: 0, x: 50, y: 10, bornAt: 0 })],
    });
    stepWorld(w, 1 / 120, [], []);
    expect(w.marbles).toHaveLength(0);
  });

  it("월드 아래로 새어나간 구슬을 회수한다", () => {
    const w = world({ marbles: [createMarble({ id: 0, x: 50, y: WORLD_HEIGHT + 100 })] });
    stepWorld(w, 1 / 120, [], []);
    expect(w.marbles).toHaveLength(0);
  });

  it("경과 시간이 누적된다", () => {
    const w = world();
    stepWorld(w, 0.5, [], []);
    stepWorld(w, 0.25, [], []);
    expect(w.elapsed).toBeCloseTo(0.75, 10);
  });
});

describe("winnerBucket / leadingBucket", () => {
  it("아무도 못 채웠으면 승자가 없다", () => {
    expect(winnerBucket(world({ buckets: [bucket(), bucket()] }))).toBeNull();
  });

  it("먼저 채운 쪽이 이긴다", () => {
    const late = bucket({ ownerIndex: 0, filledAt: 9 });
    const early = bucket({ ownerIndex: 1, filledAt: 3 });
    expect(winnerBucket(world({ buckets: [late, early] }))?.ownerIndex).toBe(1);
  });

  it("선두는 가장 많이 담은 쪽이다", () => {
    const a = bucket({ ownerIndex: 0, count: 2 });
    const b = bucket({ ownerIndex: 1, count: 7 });
    expect(leadingBucket(world({ buckets: [a, b] }))?.ownerIndex).toBe(1);
  });

  it("동수면 배열 순서가 앞선 쪽이 선두다", () => {
    const a = bucket({ ownerIndex: 0, count: 5 });
    const b = bucket({ ownerIndex: 1, count: 5 });
    expect(leadingBucket(world({ buckets: [a, b] }))?.ownerIndex).toBe(0);
  });
});
