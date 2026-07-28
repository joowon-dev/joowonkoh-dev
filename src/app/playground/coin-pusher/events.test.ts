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
import { FIXED_DT, createCoin, createPusher, stepWorld, type World } from "./physics";

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
