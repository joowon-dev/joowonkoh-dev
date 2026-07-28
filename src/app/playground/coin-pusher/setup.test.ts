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
import { createScheduler } from "./events";
import { createRng } from "./random";
import { NEUTRAL_INTERVAL, simulate } from "./loop";
import type { FallingCoin } from "./render";

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
  // loop.ts의 실제 게임 루프(simulate)를 그대로 돌린다 — 스케줄러와 막판 스퍼트를 포함해서,
  // CoinPusherGame.tsx가 쓰는 것과 완전히 같은 코드 경로를 검증한다.
  function runUntilWinner(names: string[], seed: number, maxSeconds: number) {
    const g = createGame(names, seed);
    const scheduler = createScheduler(createRng(seed ^ 0x9e3779b9));
    const falling: FallingCoin[] = [];
    const nextNeutralAt = { current: NEUTRAL_INTERVAL };
    for (let i = 0; i < Math.round(maxSeconds / FIXED_DT); i++) {
      simulate(g, scheduler, falling, nextNeutralAt, FIXED_DT);
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
