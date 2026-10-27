import { createRng, randRange, type Rng } from "../_shared/random";
import { centerSplitters, layoutBlocks, wallDeflectors, type Block } from "./blocks";
import {
  MARBLE_RADIUS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  createMarble,
  createSegment,
  type Bucket,
  type Marble,
  type SolidSegment,
  type World,
} from "./physics";

export const MIN_PLAYERS = 2;
/**
 * 인원 상한. 성능이 아니라 가독성의 한계다 — 세로 화면 폭 100을 10으로 나누면 양동이
 * 하나가 구슬 두 개 폭(perRow 2)이고, 여기서 더 좁아지면 구슬이 들어가는 것도 이름표도
 * 안 보인다. 이 값을 올리려면 화면 비율이나 구슬 크기부터 바꿔야 한다.
 */
export const MAX_PLAYERS = 10;

/**
 * 양동이가 이만큼 담기면 가득 찬 것으로 보고 게임이 끝난다.
 *
 * 인원이 많을수록 목표가 커진다. 양동이당 도착 속도는 인원과 무관하게 일정하지만
 * **승자는 가장 운 좋은 양동이**라서, 양동이가 많을수록 그중 최댓값이 빨리 찬다.
 * 고정 목표로 두면 2명 19초 / 10명 11초로 갈렸다. 아래 계수는 실측으로 맞춘 값이다.
 */
export function targetCount(playerCount: number): number {
  return Math.round(20 + playerCount * 3.6);
}

/**
 * 투입되는 구슬이 폭탄일 확률. 인원과 무관하게 고정이므로 **양동이 하나가 판당 맞는
 * 폭탄 수**는 인원이 몇이든 대략 한 번으로 일정하다.
 */
export const BOMB_CHANCE = 0.035;
/** 초당 스폰 개수 = 참가자 수 × 이 값 */
export const SPAWN_PER_PLAYER = 2;
/** 동시에 떠 있을 수 있는 구슬 수의 상한. 닿으면 그 틱의 스폰을 거른다. */
export const MAX_ACTIVE_MARBLES = 260;

/** 양동이 벽 두께의 절반 */
export const WALL_HALF = 0.45;
/** 블록 지대와 양동이 입구 사이의 여유 */
const BUCKET_CLEARANCE = 4;
/** 양동이 높이의 상하한. 인원이 적으면 낮고 넓은, 많으면 좁고 깊은 양동이가 된다. */
const MIN_BUCKET_HEIGHT = 7;
const MAX_BUCKET_HEIGHT = 44;

export interface Game {
  world: World;
  names: string[];
  blocks: Block[];
  seed: number;
  rng: Rng;
  nextMarbleId: number;
  /** 다음 구슬을 투입할 시각(초) */
  nextSpawnAt: number;
  /** 초당 스폰 간격(초) */
  spawnInterval: number;
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

/**
 * 양동이 배치. 폭을 인원수로 똑같이 나누고, 높이는 TARGET_COUNT개가 딱 차 보이도록 계산한다.
 * 인원이 적으면 한 줄에 많이 들어가 낮고 넓은 양동이가, 10명이면 좁고 깊은 양동이가 된다.
 * 어느 쪽이든 가득 찬 순간 시각적으로 "꽉 찼다"가 성립한다.
 *
 * `ownerIndex`는 호출부가 섞어서 넘긴다 — 가운데 자리가 유리한 구조적 편향을 사람에게서
 * 떼어내는 유일한 장치다. 이 셔플을 지우면 곧바로 진짜 불공정이 된다.
 */
export function layoutBuckets(owners: number[], capacity: number): Bucket[] {
  const n = owners.length;
  const width = WORLD_WIDTH / n;
  const interior = width - WALL_HALF * 2;
  const perRow = Math.max(1, Math.floor(interior / (MARBLE_RADIUS * 2)));
  const rows = Math.ceil(capacity / perRow);
  const height = Math.min(
    MAX_BUCKET_HEIGHT,
    Math.max(MIN_BUCKET_HEIGHT, rows * MARBLE_RADIUS * 2 + 2.4),
  );
  const top = WORLD_HEIGHT - height;

  return owners.map((ownerIndex, i) => ({
    ownerIndex,
    x0: i * width + WALL_HALF,
    x1: (i + 1) * width - WALL_HALF,
    top,
    capacity,
    count: 0,
    perRow,
    filledAt: null,
  }));
}

/** 양동이 사이 칸막이. 바깥 양쪽 끝은 월드 벽(clampToWalls)이 막으므로 만들지 않는다. */
export function bucketWalls(buckets: Bucket[]): SolidSegment[] {
  const walls: SolidSegment[] = [];
  for (let i = 1; i < buckets.length; i++) {
    const x = buckets[i].x0 - WALL_HALF;
    walls.push(
      createSegment({
        x1: x,
        y1: buckets[i].top,
        x2: x,
        y2: WORLD_HEIGHT,
        half: WALL_HALF,
        restitution: 0.1,
      }),
    );
  }
  return walls;
}

/** 블록 지대의 아래쪽 경계. 양동이 입구보다 확실히 위여야 한다. */
export function blockZoneBottom(buckets: Bucket[]): number {
  return buckets[0].top - BUCKET_CLEARANCE;
}

export function createGame(names: string[], seed: number): Game {
  const rng = createRng(seed);

  // 참가자를 양동이에 무작위로 배정한다. 자리에는 편향이 남아도 사람에게는 균등해진다.
  const owners = names.map((_, i) => i);
  for (let i = owners.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [owners[i], owners[j]] = [owners[j], owners[i]];
  }

  const buckets = layoutBuckets(owners, targetCount(names.length));
  const zoneBottom = blockZoneBottom(buckets);
  const blocks = layoutBlocks(rng, zoneBottom);

  const world: World = {
    marbles: [],
    staticSolids: [
      ...bucketWalls(buckets),
      ...wallDeflectors(zoneBottom),
      ...centerSplitters(zoneBottom),
    ],
    buckets,
    elapsed: 0,
    captures: [],
  };

  return {
    world,
    names,
    blocks,
    seed,
    rng,
    nextMarbleId: 0,
    nextSpawnAt: 0,
    spawnInterval: 1 / (names.length * SPAWN_PER_PLAYER),
  };
}

/**
 * 화면 맨 위 가로 전 구간에서 균등한 위치로 구슬 하나를 만든다.
 * 폭탄도 같은 자리에서 같은 방식으로 떨어진다 — 특정 양동이를 노리지 않는다.
 */
export function makeMarble(game: Game): Marble {
  const margin = MARBLE_RADIUS + 1;
  return createMarble({
    id: game.nextMarbleId++,
    kind: game.rng() < BOMB_CHANCE ? "bomb" : "normal",
    x: randRange(game.rng, margin, WORLD_WIDTH - margin),
    y: -MARBLE_RADIUS * 2,
    vx: randRange(game.rng, -7, 7),
    vy: randRange(game.rng, 4, 12),
    bornAt: game.world.elapsed,
  });
}

/**
 * 투입 시각이 지난 만큼 구슬을 넣는다. 활성 구슬이 상한에 닿으면 그 몫은 거른다 —
 * 이미 떠 있는 구슬을 지우면 화면에서 사라지는 게 보이지만, 안 넣는 것은 보이지 않는다.
 */
export function spawnDue(game: Game): void {
  while (game.world.elapsed >= game.nextSpawnAt) {
    if (game.world.marbles.length < MAX_ACTIVE_MARBLES) {
      game.world.marbles.push(makeMarble(game));
    }
    game.nextSpawnAt += game.spawnInterval;
  }
}
