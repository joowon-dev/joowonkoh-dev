import { randRange, type Rng } from "../_shared/random";
import {
  BUMPER_MIN_KICK,
  BUMPER_RESTITUTION,
  WORLD_WIDTH,
  createSegment,
  type SolidCircle,
  type SolidSegment,
} from "./physics";

/** 이벤트 블록 5종. 종류마다 화면에서 하는 일이 다르지만 충돌은 선분과 원 둘로 끝난다. */
export type BlockKind = "spinner" | "wheel" | "bumper" | "slider" | "wedge";

/** 축을 중심으로 도는 블록. 팔이 2개면 회전 바, 6개면 물레방아. */
export interface RotorBlock {
  kind: "spinner" | "wheel";
  x: number;
  y: number;
  arms: number;
  /** 중심에서 팔 끝까지의 길이 */
  length: number;
  half: number;
  /** 각속도(rad/s). 부호가 회전 방향이다. */
  omega: number;
  phase: number;
}

export interface BumperBlock {
  kind: "bumper";
  x: number;
  y: number;
  radius: number;
}

/** 수평으로 왕복하는 판 */
export interface SliderBlock {
  kind: "slider";
  x: number;
  y: number;
  /** 판의 전체 길이 */
  length: number;
  half: number;
  /** 중심에서 좌우로 움직이는 최대 거리 */
  halfSpan: number;
  omega: number;
  phase: number;
}

/** 고정된 ∧ 모양. 구슬을 좌우로 가른다. */
export interface WedgeBlock {
  kind: "wedge";
  x: number;
  y: number;
  halfSpan: number;
  height: number;
  half: number;
}

export type Block = RotorBlock | BumperBlock | SliderBlock | WedgeBlock;

/** 블록이 좌우로 차지하는 최대 반폭. 배치할 때 벽과 옆 블록에 닿지 않게 하는 데 쓴다. */
export function blockExtent(block: Block): number {
  switch (block.kind) {
    case "spinner":
    case "wheel":
      return block.length + block.half;
    case "bumper":
      return block.radius;
    case "slider":
      return block.halfSpan + block.length / 2 + block.half;
    case "wedge":
      return block.halfSpan + block.half;
  }
}

/** 시각 t에서 이 블록의 선분 도형들. 범퍼는 선분이 없다. */
export function blockSegments(block: Block, t: number): SolidSegment[] {
  switch (block.kind) {
    case "spinner":
    case "wheel": {
      const base = block.phase + block.omega * t;
      const spin = { cx: block.x, cy: block.y, omega: block.omega };
      const out: SolidSegment[] = [];
      for (let i = 0; i < block.arms; i++) {
        const a = base + (i * Math.PI * 2) / block.arms;
        out.push(
          createSegment({
            x1: block.x,
            y1: block.y,
            x2: block.x + Math.cos(a) * block.length,
            y2: block.y + Math.sin(a) * block.length,
            half: block.half,
            spin,
          }),
        );
      }
      return out;
    }
    case "slider": {
      const phase = block.phase + block.omega * t;
      const cx = block.x + Math.sin(phase) * block.halfSpan;
      const vx = Math.cos(phase) * block.halfSpan * block.omega;
      return [
        createSegment({
          x1: cx - block.length / 2,
          y1: block.y,
          x2: cx + block.length / 2,
          y2: block.y,
          half: block.half,
          vx,
        }),
      ];
    }
    case "wedge":
      return [
        createSegment({
          x1: block.x,
          y1: block.y,
          x2: block.x - block.halfSpan,
          y2: block.y + block.height,
          half: block.half,
        }),
        createSegment({
          x1: block.x,
          y1: block.y,
          x2: block.x + block.halfSpan,
          y2: block.y + block.height,
          half: block.half,
        }),
      ];
    case "bumper":
      return [];
  }
}

/** 이 블록의 원 도형들. 범퍼만 갖는다. */
export function blockCircles(block: Block): SolidCircle[] {
  if (block.kind !== "bumper") return [];
  return [
    {
      cx: block.x,
      cy: block.y,
      radius: block.radius,
      restitution: BUMPER_RESTITUTION,
      minKick: BUMPER_MIN_KICK,
    },
  ];
}

export function allSegments(blocks: Block[], t: number): SolidSegment[] {
  return blocks.flatMap((b) => blockSegments(b, t));
}

export function allCircles(blocks: Block[]): SolidCircle[] {
  return blocks.flatMap(blockCircles);
}

/* ------------------------------------------------------------------ 배치 */

export const ROW_COUNT = 4;
/** 블록 지대의 위쪽 경계. 이 위는 구슬이 속도를 얻는 구간이다. */
export const ZONE_TOP = 26;

/**
 * 종류별 가중치. 회전 바와 범퍼가 흐름을 가장 크게 바꿔서 조금 더 자주 나온다.
 * 쐐기는 유일한 정적 블록이라 너무 많으면 판이 심심해진다.
 */
const KIND_WEIGHTS: ReadonlyArray<readonly [BlockKind, number]> = [
  ["spinner", 3],
  ["bumper", 3],
  ["slider", 2],
  ["wheel", 2],
  ["wedge", 2],
];

function rollKind(rng: Rng): BlockKind {
  const total = KIND_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let r = rng() * total;
  for (const [kind, w] of KIND_WEIGHTS) {
    r -= w;
    if (r < 0) return kind;
  }
  return KIND_WEIGHTS[KIND_WEIGHTS.length - 1][0];
}

/**
 * 종류별 최대 반폭(blockExtent)의 상한. 레인 간격(LANE_SPACING)에서 좌우 흔들림을 뺀
 * 값보다 작아야 옆 레인 블록과 겹치지 않는다. 치수를 키울 때 이 관계를 같이 확인해야 한다.
 */
export const MAX_BLOCK_EXTENT = 12.5;

function makeBlock(kind: BlockKind, x: number, y: number, rng: Rng): Block {
  const dir = rng() < 0.5 ? 1 : -1;
  switch (kind) {
    case "spinner":
      return {
        kind,
        x,
        y,
        arms: 2,
        length: 11,
        half: 1.1,
        omega: dir * randRange(rng, 2.2, 3.4),
        phase: rng() * Math.PI * 2,
      };
    case "wheel":
      return {
        kind,
        x,
        y,
        arms: 6,
        length: 9.5,
        half: 0.9,
        omega: dir * randRange(rng, 0.7, 1.2),
        phase: rng() * Math.PI * 2,
      };
    case "bumper":
      return { kind, x, y, radius: randRange(rng, 3.8, 4.8) };
    case "slider":
      return {
        kind,
        x,
        y,
        length: 13,
        half: 1,
        halfSpan: 5,
        omega: dir * randRange(rng, 1.1, 1.8),
        phase: rng() * Math.PI * 2,
      };
    case "wedge":
      return {
        kind,
        x,
        y,
        halfSpan: randRange(rng, 9, 10.5),
        height: randRange(rng, 6, 8),
        half: 1,
      };
  }
}

/** 블록이 벽을 뚫지 않도록 x를 안쪽으로 당긴다. */
function clampX(block: Block): Block {
  const extent = blockExtent(block);
  const min = extent + 1.5;
  const max = WORLD_WIDTH - extent - 1.5;
  block.x = min > max ? WORLD_WIDTH / 2 : Math.max(min, Math.min(max, block.x));
  return block;
}

/**
 * 블록이 놓이는 세 레인의 중심 x. 폭 전체를 덮는 것이 목적이다.
 *
 * 처음에는 좌우 두 슬롯(28%·72%)에만 놓았는데, 그러자 양 끝 14%가 아무 방해도 없는
 * 직행 통로가 되어 **가장자리 양동이가 각각 27%를, 가운데 양동이들이 3%씩** 먹었다
 * (10명 기준 자리 χ² 660). 참가자 자리를 섞으므로 사람에게 불공정하지는 않지만, 판이
 * 시작하자마자 양 끝 싸움으로 정해져 보는 재미가 없다. 레인을 셋으로 늘려 끝까지 덮는다.
 */
const LANE_X = [17, 50, 83] as const;
/**
 * 홀수 단이 쓰는 레인. 짝수 단 레인의 정확히 가운데다.
 *
 * 모든 단이 같은 x를 쓰면 레인 **사이의 틈**이 위아래로 뚫린 직행 통로가 된다. 실측에서
 * 그 통로 아래 양동이만 15%씩 먹었다. 벽돌을 엇갈려 쌓듯 단마다 레인을 반 칸씩 옮기면
 * 어느 x로 내려와도 두 단에 한 번은 블록을 만난다.
 */
const LANE_X_ODD = [33.5, 66.5] as const;
/** 레인 간격. 블록 반폭 상한 둘과 좌우 흔들림을 더한 값보다 커야 옆 레인과 겹치지 않는다. */
export const LANE_SPACING = LANE_X[1] - LANE_X[0];
/** 레인 중심에서 좌우로 흔드는 폭 */
const LANE_JITTER = 3;

/** 벽 유도판의 길이와 낙차 */
const DEFLECTOR_LENGTH = 11;
const DEFLECTOR_DROP = 5;

/**
 * 유도판을 세울 단. 2레인짜리 단(가운데 쏠림)에만 세우되 **맨 아래 단은 제외한다.**
 *
 * 모든 2레인 단에 세웠더니 이번에는 반대로 가장자리 양동이가 굶었다(10명 기준 0.9%).
 * 양동이 바로 위에서 안쪽으로 퍼올리면 구슬이 가장자리로 돌아올 기회가 없기 때문이다.
 * 위쪽에서 한 번만 밀어주고, 아래는 다시 퍼질 여지를 남긴다.
 */
function isDeflectorRow(row: number): boolean {
  return row % 2 === 1 && row < ROW_COUNT - 1;
}

/** 3레인(폭 전체)을 쓰는 단. 맨 아래 단은 가장자리를 덮어야 하므로 항상 3레인이다. */
function usesWideLanes(row: number): boolean {
  return row % 2 === 0 || row === ROW_COUNT - 1;
}

/**
 * 좌우 벽에 붙는 고정 유도판. 이벤트 블록이 아니라 판의 뼈대다.
 *
 * 홀수 단은 레인이 둘(가운데 쏠림)이라 가장자리가 뚫린다. 벽에 딱 붙어 서는 블록은
 * 만들 수 없으므로(블록은 자기 반폭만큼 벽에서 떨어져야 한다) 벽 자체에서 안쪽으로
 * 비스듬히 튀어나온 판을 세운다. 좌우 대칭이라 어느 쪽도 유리해지지 않는다.
 */
export function wallDeflectors(zoneBottom: number): SolidSegment[] {
  const rowHeight = (zoneBottom - ZONE_TOP) / ROW_COUNT;
  const out: SolidSegment[] = [];
  for (let row = 0; row < ROW_COUNT; row++) {
    if (!isDeflectorRow(row)) continue;
    const y = ZONE_TOP + rowHeight * (row + 0.5);
    out.push(
      createSegment({
        x1: 0,
        y1: y - DEFLECTOR_DROP,
        x2: DEFLECTOR_LENGTH,
        y2: y + DEFLECTOR_DROP,
        half: 1,
      }),
      createSegment({
        x1: WORLD_WIDTH,
        y1: y - DEFLECTOR_DROP,
        x2: WORLD_WIDTH - DEFLECTOR_LENGTH,
        y2: y + DEFLECTOR_DROP,
        half: 1,
      }),
    );
  }
  return out;
}

/** 배열을 제자리에서 섞는다 (Fisher–Yates). */
function shuffle<T>(rng: Rng, items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * 블록을 단 안에서 무작위로 배치한다.
 *
 * 완전 무작위로 뿌리지 않는 이유는 판의 질이다. 블록이 우연히 한쪽에 몰리면 반대쪽
 * 구슬은 아무 방해 없이 직행해 그쪽 양동이만 계속 먹는다. 단과 레인을 강제하면 어느
 * 경로로 내려오든 반드시 여러 층을 거치므로, 매판 배치가 달라도 난이도가 일정하다.
 *
 * 매 단은 세 레인 중 둘 또는 셋을 무작위로 골라 채운다. 어느 레인이 비는지가 매 단
 * 달라지므로 배치는 매판 바뀌지만, 네 단을 합치면 어느 레인도 오래 비어 있지 않다.
 */
export function layoutBlocks(rng: Rng, zoneBottom: number): Block[] {
  const rowHeight = (zoneBottom - ZONE_TOP) / ROW_COUNT;
  const blocks: Block[] = [];

  // 레인 전체를 매판 좌우로 밀어준다. 레인이 고정이면 블록 **바로 아래** 양동이는 늘
  // 굶고 레인 **사이** 양동이는 늘 배부르다 — 어느 자리가 유리한지가 판마다 같아진다.
  // 통째로 밀면 그 무늬가 매판 다른 자리에 떨어져 평균이 고르게 펴진다.
  const laneOffset = randRange(rng, -LANE_SPACING / 4, LANE_SPACING / 4);

  for (let row = 0; row < ROW_COUNT; row++) {
    const y = ZONE_TOP + rowHeight * (row + 0.5);
    // 단마다 레인을 반 칸씩 엇갈리게 한다
    const centers: readonly number[] = (usesWideLanes(row) ? LANE_X : LANE_X_ODD).map(
      (x) => x + laneOffset,
    );
    // 세 레인짜리 단은 둘 또는 셋, 두 레인짜리 단은 항상 둘을 채운다
    const keep = centers.length === 3 && rng() < 0.5 ? 2 : centers.length;
    const lanes = shuffle(
      rng,
      centers.map((_, i) => i),
    )
      .slice(0, keep)
      .sort((a, b) => a - b);

    let previous: BlockKind | null = null;
    for (const lane of lanes) {
      let kind = rollKind(rng);
      // 같은 종류가 한 단에 나란히 서면 밋밋해진다. 한 번만 다시 뽑는다.
      if (kind === previous) kind = rollKind(rng);
      previous = kind;
      blocks.push(
        clampX(makeBlock(kind, centers[lane] + randRange(rng, -LANE_JITTER, LANE_JITTER), y, rng)),
      );
    }
  }

  return blocks;
}
