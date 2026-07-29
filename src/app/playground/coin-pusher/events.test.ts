import { describe, it, expect } from "vitest";
import { createRng } from "./random";
import {
  FINAL_SPURT_AT,
  createScheduler,
  updateScheduler,
  applyScheduler,
  isFinalSpurt,
  applyFinalSpurt,
  rollNeutralRadius,
  radiusMass,
  COIN_RESTITUTION,
  CATAPULT_SECONDS,
  CATAPULT_MAX_COINS,
} from "./events";
import {
  COIN_RADIUS,
  FIXED_DT,
  NEUTRAL_RADII,
  PLATE_MAX_Y,
  PLATE_MIN_Y,
  centerX,
  halfWidthAt,
  createCoin,
  createPusher,
  stepWorld,
  type World,
} from "./physics";

function makeWorld(): World {
  return {
    board: { width: 400, backWidth: 400, fallLine: 320 },
    coins: [createCoin({ id: 1, x: 200, y: 100 })],
    pusher: createPusher(),
    tiltAx: 0,
    burst: null,
    catapult: null,
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

  it("정해진 종류의 이벤트만 나온다", () => {
    for (const e of runScheduler(7, 120)) {
      expect(["shake", "tilt", "rush", "catapult", "burst"]).toContain(e.type);
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

  it("shake 중일 때 코인 개수가 같으면 같은 이벤트 시퀀스가 나온다", () => {
    // 같은 시드로 두 개의 세계를 만든다
    const seed = 42;
    const seconds = 20;
    const steps = Math.round(seconds / FIXED_DT);

    // 첫 번째 세계
    const w1 = makeWorld();
    const s1 = createScheduler(createRng(seed));
    const fired1: Array<{ type: string; at: number }> = [];
    let elapsed1 = 0;
    for (let i = 0; i < steps; i++) {
      elapsed1 += FIXED_DT;
      const type = updateScheduler(s1, elapsed1, FIXED_DT);
      if (type) fired1.push({ type, at: Number(elapsed1.toFixed(3)) });
      applyScheduler(w1, s1);
      stepWorld(w1, FIXED_DT);
    }

    // 두 번째 세계
    const w2 = makeWorld();
    const s2 = createScheduler(createRng(seed));
    const fired2: Array<{ type: string; at: number }> = [];
    let elapsed2 = 0;
    for (let i = 0; i < steps; i++) {
      elapsed2 += FIXED_DT;
      const type = updateScheduler(s2, elapsed2, FIXED_DT);
      if (type) fired2.push({ type, at: Number(elapsed2.toFixed(3)) });
      applyScheduler(w2, s2);
      stepWorld(w2, FIXED_DT);
    }

    // 이벤트 시퀀스가 같아야 한다
    expect(fired1).toEqual(fired2);

    // 코인 위치도 같아야 한다
    expect(w1.coins).toHaveLength(w2.coins.length);
    for (let i = 0; i < w1.coins.length; i++) {
      expect(w1.coins[i].x).toBeCloseTo(w2.coins[i].x, 5);
      expect(w1.coins[i].y).toBeCloseTo(w2.coins[i].y, 5);
    }
  });
});

describe("applyScheduler", () => {
  it("tilt는 월드에 x 가속도를 준다", () => {
    const w = makeWorld();
    const s = createScheduler(createRng(1));
    s.active = { type: "tilt", remaining: 2, duration: 2, magnitude: 150, x: 0.5, y: 0.5, fired: false };
    applyScheduler(w, s);
    expect(Math.abs(w.tiltAx)).toBeCloseTo(150, 5);
  });

  it("rush는 푸셔 속도 배율을 올린다", () => {
    const w = makeWorld();
    const s = createScheduler(createRng(1));
    s.active = { type: "rush", remaining: 2, duration: 2, magnitude: 2, x: 0.5, y: 0.5, fired: false };
    applyScheduler(w, s);
    expect(w.pusher.speedScale).toBeCloseTo(2, 5);
  });

  it("shake는 코인 속도를 흔든다", () => {
    const w = makeWorld();
    const s = createScheduler(createRng(1));
    s.active = { type: "shake", remaining: 1, duration: 1, magnitude: 200, x: 0.5, y: 0.5, fired: false };
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

describe("투석(catapult)", () => {
  function worldWithCoins() {
    const w = makeWorld();
    w.coins = [];
    // 반경 안(가까이)과 밖(멀리)에 하나씩
    w.coins.push(createCoin({ id: 1, x: 200, y: 300 }));
    w.coins.push(createCoin({ id: 2, x: 200, y: 60 }));
    return w;
  }

  function fire(w: World, seed: number) {
    const s = createScheduler(createRng(seed));
    // x=0.5, y=300/320 → 코인 1 바로 위
    s.active = {
      type: "catapult",
      remaining: CATAPULT_SECONDS,
      duration: CATAPULT_SECONDS,
      magnitude: 0,
      x: 0.5,
      y: 300 / w.board.fallLine,
      fired: false,
    };
    applyScheduler(w, s);
    return s;
  }

  it("반경 안의 코인을 미는 판 위로 되돌린다", () => {
    const w = worldWithCoins();
    fire(w, 1);
    const moved = w.coins.find((c) => c.id === 1)!;
    expect(moved.y).toBeGreaterThanOrEqual(PLATE_MIN_Y);
    expect(moved.y).toBeLessThanOrEqual(PLATE_MAX_Y);
  });

  it("반경 밖의 코인은 건드리지 않는다", () => {
    const w = worldWithCoins();
    fire(w, 1);
    const far = w.coins.find((c) => c.id === 2)!;
    expect(far.y).toBe(60);
    expect(far.x).toBe(200);
  });

  it("되돌린 코인은 낙하 연출이 다시 재생되도록 bornAt이 갱신된다", () => {
    const w = worldWithCoins();
    w.elapsed = 12.5;
    fire(w, 1);
    expect(w.coins.find((c) => c.id === 1)!.bornAt).toBeCloseTo(12.5, 5);
  });

  it("코인을 없애지 않는다", () => {
    const w = worldWithCoins();
    fire(w, 1);
    expect(w.coins).toHaveLength(2);
  });

  it("지속 시간 동안 여러 번 호출해도 한 번만 걷어간다", () => {
    const w = worldWithCoins();
    const s = fire(w, 1);
    const after = { ...w.coins.find((c) => c.id === 1)! };
    for (let i = 0; i < 30; i++) applyScheduler(w, s);
    const now = w.coins.find((c) => c.id === 1)!;
    expect([now.x, now.y]).toEqual([after.x, after.y]);
  });

  it("한 번에 되돌리는 코인 수에 상한이 있다", () => {
    const w = makeWorld();
    // 한 지점에 몰아넣어 전부 반경 안에 들어가게 한다
    w.coins = Array.from({ length: 60 }, (_, i) =>
      createCoin({ id: i, x: 200 + (i % 6), y: 300 + Math.floor(i / 6) }),
    );
    fire(w, 2);
    const sentBack = w.coins.filter((c) => c.y <= PLATE_MAX_Y).length;
    expect(sentBack).toBe(CATAPULT_MAX_COINS);
  });

  it("되돌린 코인도 판 좌우 벽 안에 있다", () => {
    const w = makeWorld();
    w.coins = Array.from({ length: 40 }, (_, i) =>
      createCoin({ id: i, x: 200 + (i % 5), y: 300 + Math.floor(i / 5) }),
    );
    fire(w, 3);
    for (const c of w.coins.filter((x) => x.y <= PLATE_MAX_Y)) {
      const limit = halfWidthAt(w.board, c.y) - c.radius;
      expect(Math.abs(c.x - centerX(w.board))).toBeLessThanOrEqual(limit + 0.001);
    }
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

describe("rollNeutralRadius", () => {
  it("세 가지 크기가 모두 나온다", () => {
    const rng = createRng(3);
    const radii = new Set(Array.from({ length: 300 }, () => rollNeutralRadius(rng)));
    expect(radii).toEqual(new Set(NEUTRAL_RADII));
  });
});

describe("radiusMass", () => {
  it("큰 코인이 더 무겁다", () => {
    expect(radiusMass(NEUTRAL_RADII[2])).toBeGreaterThan(radiusMass(NEUTRAL_RADII[1]));
    expect(radiusMass(NEUTRAL_RADII[1])).toBeGreaterThan(radiusMass(NEUTRAL_RADII[0]));
  });

  it("기준 크기 코인의 질량이 1이다", () => {
    expect(radiusMass(COIN_RADIUS)).toBeCloseTo(1, 5);
  });

  it("반발계수는 코인 종류와 무관하게 하나다", () => {
    expect(COIN_RESTITUTION).toBeGreaterThan(0);
  });
});

