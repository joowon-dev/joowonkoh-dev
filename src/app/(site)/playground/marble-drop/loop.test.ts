import { describe, expect, it } from "vitest";
import { CAPTURE_FLASH_SECONDS, MAX_SECONDS, outcomeOf, simulate, winnerName } from "./loop";
import { FIXED_DT, MAX_SPEED, WORLD_HEIGHT, WORLD_WIDTH } from "./physics";
import { MAX_ACTIVE_MARBLES, createGame, targetCount, type Game } from "./setup";

const names = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`);

/** 한 판을 끝까지 돌린다. */
function play(playerCount: number, seed: number) {
  const game = createGame(names(playerCount), seed);
  let peak = 0;
  const limit = Math.ceil((MAX_SECONDS + 1) / FIXED_DT);
  for (let step = 0; step < limit; step++) {
    simulate(game, FIXED_DT);
    peak = Math.max(peak, game.world.marbles.length);
    const outcome = outcomeOf(game);
    if (outcome) return { game, outcome, peak };
  }
  return { game, outcome: null, peak };
}

describe("simulate", () => {
  it("구슬이 저절로 들어오고 아래로 내려간다", () => {
    const game = createGame(names(4), 1);
    for (let i = 0; i < 120; i++) simulate(game, FIXED_DT);
    expect(game.world.marbles.length).toBeGreaterThan(0);
    expect(game.world.marbles.some((m) => m.y > 0)).toBe(true);
  });

  it("구슬이 판 밖으로 새지 않는다", () => {
    const game = createGame(names(8), 3);
    for (let i = 0; i < 1200; i++) {
      simulate(game, FIXED_DT);
      for (const m of game.world.marbles) {
        expect(m.x).toBeGreaterThanOrEqual(0);
        expect(m.x).toBeLessThanOrEqual(WORLD_WIDTH);
        expect(m.y).toBeLessThanOrEqual(WORLD_HEIGHT + 20);
        expect(Math.hypot(m.vx, m.vy)).toBeLessThanOrEqual(MAX_SPEED + 1e-6);
      }
    }
  });

  it("캡처 기록이 무한히 쌓이지 않는다", () => {
    const game = createGame(names(6), 5);
    for (let i = 0; i < 2400; i++) simulate(game, FIXED_DT);
    for (const c of game.world.captures) {
      expect(game.world.elapsed - c.at).toBeLessThanOrEqual(CAPTURE_FLASH_SECONDS + FIXED_DT);
    }
  });

  it("동시 구슬 수가 상한을 넘지 않는다", () => {
    const { peak } = play(10, 11);
    expect(peak).toBeLessThanOrEqual(MAX_ACTIVE_MARBLES);
  });
});

describe("outcomeOf", () => {
  it("시작하자마자 끝나지 않는다", () => {
    expect(outcomeOf(createGame(names(4), 1))).toBeNull();
  });

  it("여러 시드에서 제한 시간 안에 정상 종료된다", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game, outcome } = play(6, seed);
      expect(outcome).not.toBeNull();
      expect(outcome!.forced).toBe(false);
      expect(game.world.elapsed).toBeLessThan(MAX_SECONDS);
    }
  });

  it("인원 상·하한에서도 정상 종료된다", () => {
    for (const n of [2, 10]) {
      const { outcome } = play(n, 77);
      expect(outcome).not.toBeNull();
      expect(outcome!.forced).toBe(false);
    }
  });

  it("승자는 실제로 정원을 채운 참가자다", () => {
    const { game, outcome } = play(6, 21);
    expect(outcome).not.toBeNull();
    expect(outcome!.bucket.count).toBeGreaterThanOrEqual(targetCount(6));
    expect(names(6)).toContain(winnerName(game, outcome!));
  });

  it("승자보다 먼저 찬 양동이는 없다", () => {
    const { game, outcome } = play(8, 33);
    const filled = game.world.buckets.filter((b) => b.filledAt !== null);
    for (const b of filled) {
      expect(b.filledAt!).toBeGreaterThanOrEqual(outcome!.bucket.filledAt!);
    }
  });

  it("제한 시간을 넘기면 가장 많이 담은 쪽으로 강제 종료한다", () => {
    const game: Game = createGame(names(4), 9);
    game.world.elapsed = MAX_SECONDS;
    game.world.buckets[0].count = 3;
    game.world.buckets[2].count = 11;
    const outcome = outcomeOf(game);
    expect(outcome?.forced).toBe(true);
    expect(outcome?.bucket.ownerIndex).toBe(game.world.buckets[2].ownerIndex);
  });

  it("같은 시드는 같은 결과를 낸다", () => {
    const a = play(6, 123);
    const b = play(6, 123);
    expect(winnerName(a.game, a.outcome!)).toBe(winnerName(b.game, b.outcome!));
    expect(a.game.world.elapsed).toBeCloseTo(b.game.world.elapsed, 10);
  });
});
