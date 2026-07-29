import { describe, it, expect } from "vitest";
import {
  FALL_LINE,
  parseNames,
  createGame,
  initialCoinCount,
  releaseDue,
  spawnNeutral,
  allDropped,
} from "./setup";
import {
  COIN_RADIUS,
  FIXED_DT,
  NEUTRAL_RADII,
  PUSHER_BACK_Y,
  centerX,
  halfWidthAt,
  stepWorld,
} from "./physics";
import { createScheduler } from "./events";
import { createRng } from "./random";
import { NEUTRAL_INTERVAL, createFx, simulate } from "./loop";

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
  const playerCoins = (g: ReturnType<typeof createGame>) =>
    g.queue.filter((q) => q.coin.ownerIndex >= 0);

  it("참가자 수만큼 참가자 코인을 큐에 넣는다", () => {
    const g = createGame(names, 1);
    expect(playerCoins(g)).toHaveLength(4);
    expect(playerCoins(g).map((q) => q.coin.ownerIndex).sort()).toEqual([0, 1, 2, 3]);
  });

  it("처음에는 판이 비어 있고 코인이 전부 큐에서 쏟아진다", () => {
    const g = createGame(names, 1);
    expect(g.world.coins).toHaveLength(0);
    expect(g.queue.length).toBe(initialCoinCount(names.length) + names.length);
  });

  it("중립 코인이 참가자 코인보다 먼저 쏟아진다", () => {
    const g = createGame(names, 1);
    const firstPlayerAt = Math.min(...playerCoins(g).map((q) => q.at));
    const neutrals = g.queue.filter((q) => q.coin.ownerIndex < 0);
    expect(neutrals.filter((q) => q.at < firstPlayerAt).length).toBe(neutrals.length);
  });

  it("모든 코인은 미는 판 위, 판 안쪽에서 시작한다", () => {
    const g = createGame(names, 1);
    for (const { coin } of g.queue) {
      const limit = halfWidthAt(g.world.board, coin.y) - coin.radius;
      expect(Math.abs(coin.x - centerX(g.world.board))).toBeLessThanOrEqual(limit + 0.001);
      expect(coin.y).toBeGreaterThanOrEqual(PUSHER_BACK_Y);
      expect(coin.y).toBeLessThan(FALL_LINE);
    }
  });

  it("참가자 코인은 전부 같은 시각에 한꺼번에 투입된다", () => {
    // 순차 투입은 먼저 들어온 코인이 더 오래 밀려서 구조적으로 유리하다.
    // 실측으로 20명 기준 마지막 투입 코인의 승률이 0이었던 적이 있다.
    const g = createGame(Array.from({ length: 20 }, (_, i) => `p${i}`), 7);
    expect(new Set(playerCoins(g).map((q) => q.at)).size).toBe(1);
  });

  it("참가자 번호와 큐 순서가 묶여 있지 않다", () => {
    // 같은 시각의 코인들은 큐 순서대로 world.coins에 들어가고 충돌 해소도 그 순서로 돈다.
    // 참가자 번호 순으로 넣으면 배열 앞쪽 참가자가 체계적으로 유리해진다.
    const names = Array.from({ length: 12 }, (_, i) => `p${i}`);
    const identity = names.map((_, i) => i);
    const shuffled = [1, 2, 3, 4, 5].filter((seed) => {
      const owners = createGame(names, seed)
        .queue.filter((q) => q.coin.ownerIndex >= 0)
        .map((q) => q.coin.ownerIndex);
      return JSON.stringify(owners) !== JSON.stringify(identity);
    });
    expect(shuffled).toHaveLength(5);
  });

  it("참가자 코인은 서로 다른 자리에서 시작한다", () => {
    const g = createGame(Array.from({ length: 12 }, (_, i) => `p${i}`), 3);
    const spots = new Set(playerCoins(g).map((q) => `${q.coin.x},${q.coin.y}`));
    expect(spots.size).toBe(12);
  });

  it("참가자 코인은 크기·질량·반발계수가 모두 같다", () => {
    const g = createGame(names, 1);
    expect(new Set(playerCoins(g).map((q) => q.coin.radius)).size).toBe(1);
    expect(new Set(playerCoins(g).map((q) => q.coin.mass)).size).toBe(1);
    expect(new Set(playerCoins(g).map((q) => q.coin.restitution)).size).toBe(1);
  });

  it("참가자 코인에는 특수 종류도 도화선도 붙지 않는다", () => {
    const g = createGame(names, 1);
    for (const { coin } of playerCoins(g)) {
      expect(coin.kind).toBe("player");
      expect(coin.fuse).toBeNull();
    }
  });

  it("중립 코인은 세 가지 크기로 나온다", () => {
    const g = createGame(Array.from({ length: 40 }, (_, i) => `p${i}`), 42);
    const radii = new Set(
      g.queue.filter((q) => q.coin.ownerIndex < 0).map((q) => q.coin.radius),
    );
    expect(radii).toEqual(new Set(NEUTRAL_RADII));
  });

  it("참가자 코인은 기준 크기를 쓴다", () => {
    const g = createGame(names, 1);
    expect(playerCoins(g).every((q) => q.coin.radius === COIN_RADIUS)).toBe(true);
  });

  it("코인 id는 전부 다르다", () => {
    const g = createGame(names, 1);
    const ids = g.queue.map((q) => q.coin.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("같은 시드면 같은 배치를 만든다", () => {
    const a = createGame(names, 777);
    const b = createGame(names, 777);
    expect(a.queue.map((q) => [q.at, q.coin.x, q.coin.y, q.coin.kind])).toEqual(
      b.queue.map((q) => [q.at, q.coin.x, q.coin.y, q.coin.kind]),
    );
  });

  it("다른 시드면 다른 배치를 만든다", () => {
    const a = createGame(names, 1);
    const b = createGame(names, 2);
    expect(a.queue.map((q) => [q.coin.x, q.coin.y])).not.toEqual(
      b.queue.map((q) => [q.coin.x, q.coin.y]),
    );
  });

  it("참가자가 많으면 중립 코인도 많아진다", () => {
    expect(initialCoinCount(40)).toBeGreaterThan(initialCoinCount(2));
  });

  it("큐는 투입 시각 순으로 정렬돼 있다", () => {
    const g = createGame(names, 1);
    for (let i = 1; i < g.queue.length; i++) {
      expect(g.queue[i].at).toBeGreaterThanOrEqual(g.queue[i - 1].at);
    }
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
    expect(released).toHaveLength(initialCoinCount(3) + 3);
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
    const fx = createFx();
    const nextNeutralAt = { current: NEUTRAL_INTERVAL };
    for (let i = 0; i < Math.round(maxSeconds / FIXED_DT); i++) {
      simulate(g, scheduler, fx, nextNeutralAt, FIXED_DT);
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
