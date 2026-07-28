import { describe, it, expect } from "vitest";
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

function makeWorld(coins: ReturnType<typeof createCoin>[]): World {
  return {
    board: { width: 400, fallLine: 320 },
    coins,
    pusher: createPusher(),
    tiltAx: 0,
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
