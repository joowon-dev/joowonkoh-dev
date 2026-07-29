import { describe, expect, it } from "vitest";
import { MARBLE_RADIUS, WORLD_HEIGHT, WORLD_WIDTH } from "./physics";
import {
  BOMB_CHANCE,
  MAX_ACTIVE_MARBLES,
  MAX_PLAYERS,
  MIN_PLAYERS,
  SPAWN_PER_PLAYER,
  WALL_HALF,
  blockZoneBottom,
  bucketWalls,
  createGame,
  layoutBuckets,
  makeMarble,
  parseNames,
  spawnDue,
  targetCount,
} from "./setup";
import { ZONE_TOP } from "./blocks";

const names = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`);

describe("parseNames", () => {
  it("줄바꿈과 쉼표를 모두 구분자로 쓴다", () => {
    expect(parseNames("주원\n민지, 현우")).toEqual(["주원", "민지", "현우"]);
  });

  it("공백을 다듬고 빈 값을 버린다", () => {
    expect(parseNames("  주원  \n\n , 민지")).toEqual(["주원", "민지"]);
  });

  it("중복을 제거하고 처음 순서를 지킨다", () => {
    expect(parseNames("주원,민지,주원")).toEqual(["주원", "민지"]);
  });

  it("빈 문자열은 빈 배열", () => {
    expect(parseNames("   ")).toEqual([]);
  });
});

describe("targetCount", () => {
  it("인원이 많을수록 목표가 커진다", () => {
    for (let n = MIN_PLAYERS; n < MAX_PLAYERS; n++) {
      expect(targetCount(n + 1)).toBeGreaterThan(targetCount(n));
    }
  });
});

describe("layoutBuckets", () => {
  it("폭을 빈틈없이 나눠 갖는다", () => {
    const buckets = layoutBuckets([0, 1, 2, 3], 30);
    expect(buckets[0].x0).toBeCloseTo(WALL_HALF, 6);
    expect(buckets[buckets.length - 1].x1).toBeCloseTo(WORLD_WIDTH - WALL_HALF, 6);
    for (let i = 1; i < buckets.length; i++) {
      // 앞 양동이의 오른쪽 끝과 다음 양동이의 왼쪽 끝 사이에 칸막이 두께만큼만 벌어진다
      expect(buckets[i].x0 - buckets[i - 1].x1).toBeCloseTo(WALL_HALF * 2, 6);
    }
  });

  it("주인 배정을 그대로 옮긴다", () => {
    expect(layoutBuckets([3, 0, 2, 1], 30).map((b) => b.ownerIndex)).toEqual([3, 0, 2, 1]);
  });

  it("모든 인원수에서 양동이가 판 안에 들어가고 블록 지대가 남는다", () => {
    for (let n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      const buckets = layoutBuckets(names(n).map((_, i) => i), targetCount(n));
      expect(buckets).toHaveLength(n);
      for (const b of buckets) {
        expect(b.top).toBeGreaterThan(0);
        expect(b.top).toBeLessThan(WORLD_HEIGHT);
        expect(b.perRow).toBeGreaterThanOrEqual(1);
      }
      // 블록이 설 자리가 실제로 남아야 한다
      expect(blockZoneBottom(buckets)).toBeGreaterThan(ZONE_TOP + 20);
    }
  });

  it("한 줄에 들어가는 개수가 양동이 폭에 맞는다", () => {
    const buckets = layoutBuckets([0, 1], 30);
    const interior = buckets[0].x1 - buckets[0].x0;
    expect(buckets[0].perRow * MARBLE_RADIUS * 2).toBeLessThanOrEqual(interior + 1e-6);
  });

  it("인원이 많을수록 양동이가 좁고 깊어진다", () => {
    const few = layoutBuckets([0, 1], targetCount(2))[0];
    const many = layoutBuckets(names(10).map((_, i) => i), targetCount(10))[0];
    expect(many.x1 - many.x0).toBeLessThan(few.x1 - few.x0);
    expect(many.top).toBeLessThan(few.top);
  });
});

describe("bucketWalls", () => {
  it("양동이 사이에만 칸막이를 세운다 — 바깥 끝은 월드 벽이 막는다", () => {
    const buckets = layoutBuckets([0, 1, 2], 30);
    const walls = bucketWalls(buckets);
    expect(walls).toHaveLength(2);
    for (const w of walls) {
      expect(w.x1).toBe(w.x2); // 수직
      expect(w.y2).toBe(WORLD_HEIGHT);
      expect(w.x1).toBeGreaterThan(0);
      expect(w.x1).toBeLessThan(WORLD_WIDTH);
    }
  });

  it("칸막이가 양동이 입구에서 시작한다", () => {
    const buckets = layoutBuckets([0, 1], 30);
    expect(bucketWalls(buckets)[0].y1).toBe(buckets[0].top);
  });
});

describe("createGame", () => {
  it("참가자를 양동이에 빠짐없이 한 번씩 배정한다", () => {
    for (let seed = 0; seed < 200; seed++) {
      const game = createGame(names(6), seed);
      const owners = game.world.buckets.map((b) => b.ownerIndex).sort((a, b) => a - b);
      expect(owners).toEqual([0, 1, 2, 3, 4, 5]);
    }
  });

  it("자리 배정이 매판 같지 않다 — 이 셔플이 자리 편향을 사람에게서 떼어낸다", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      seen.add(createGame(names(6), seed).world.buckets.map((b) => b.ownerIndex).join(","));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("시드가 같으면 완전히 같은 판이 만들어진다", () => {
    const a = createGame(names(5), 42);
    const b = createGame(names(5), 42);
    expect(a.blocks).toEqual(b.blocks);
    expect(a.world.buckets.map((x) => x.ownerIndex)).toEqual(
      b.world.buckets.map((x) => x.ownerIndex),
    );
  });

  it("스폰 간격이 인원수에 반비례한다", () => {
    const game = createGame(names(4), 1);
    expect(game.spawnInterval).toBeCloseTo(1 / (4 * SPAWN_PER_PLAYER), 10);
  });

  it("시작할 때는 구슬이 없다", () => {
    expect(createGame(names(4), 1).world.marbles).toHaveLength(0);
  });
});

describe("spawnDue", () => {
  it("경과 시간만큼 구슬을 넣는다", () => {
    const game = createGame(names(4), 1);
    game.world.elapsed = 1;
    spawnDue(game);
    // 0초와 1초 사이에 간격마다 하나씩 (양 끝 포함)
    expect(game.world.marbles.length).toBe(4 * SPAWN_PER_PLAYER + 1);
  });

  it("구슬은 판 위쪽에서 좌우 벽 안쪽으로 들어온다", () => {
    const game = createGame(names(4), 1);
    game.world.elapsed = 2;
    spawnDue(game);
    for (const m of game.world.marbles) {
      expect(m.y).toBeLessThan(0);
      expect(m.x).toBeGreaterThanOrEqual(MARBLE_RADIUS);
      expect(m.x).toBeLessThanOrEqual(WORLD_WIDTH - MARBLE_RADIUS);
    }
  });

  it("폭탄이 가끔 섞이지만 대부분은 보통 구슬이다", () => {
    const game = createGame(names(10), 7);
    game.world.elapsed = 400;
    // 상한 때문에 실제 투입은 제한되므로 makeMarble을 직접 여러 번 부른다
    const kinds = Array.from({ length: 4000 }, () => makeMarble(game).kind);
    const bombs = kinds.filter((k) => k === "bomb").length;
    expect(bombs).toBeGreaterThan(0);
    expect(bombs / kinds.length).toBeLessThan(BOMB_CHANCE * 2);
    expect(bombs / kinds.length).toBeGreaterThan(BOMB_CHANCE / 2);
  });

  it("폭탄도 보통 구슬과 같은 자리에서 떨어진다 — 특정 양동이를 노리지 않는다", () => {
    const game = createGame(names(10), 11);
    const xs = { normal: [] as number[], bomb: [] as number[] };
    for (let i = 0; i < 6000; i++) {
      const m = makeMarble(game);
      xs[m.kind].push(m.x);
    }
    const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
    // 두 분포의 평균이 판 가운데 근처에서 만난다
    expect(Math.abs(mean(xs.bomb) - mean(xs.normal))).toBeLessThan(6);
  });

  it("상한에 닿으면 더 넣지 않지만 시계는 계속 간다", () => {
    const game = createGame(names(10), 1);
    game.world.elapsed = 1000;
    spawnDue(game);
    expect(game.world.marbles.length).toBeLessThanOrEqual(MAX_ACTIVE_MARBLES);
    expect(game.nextSpawnAt).toBeGreaterThan(1000);
  });
});
