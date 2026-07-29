import { randRange, type Rng } from "../_shared/random";
import {
  BUMPER_MIN_KICK,
  BUMPER_RESTITUTION,
  FRICTION_ANGLE,
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

/**
 * 좌우로 왕복하는 판. **수평이 아니라 살짝 기울어져 있다** — 수평으로 두면 구슬이
 * 판 위에 줄지어 얹힌 채 같이 왔다갔다 하면서 흐름이 끊긴다. 기울여 두면 실려가다가
 * 미끄러져 내려간다.
 */
export interface SliderBlock {
  kind: "slider";
  x: number;
  y: number;
  /** 판의 전체 길이 */
  length: number;
  half: number;
  /** 중심에서 좌우로 움직이는 최대 거리 */
  halfSpan: number;
  /** 기울기(rad). 부호가 내려가는 방향이다. */
  tilt: number;
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
      const dx = (Math.cos(block.tilt) * block.length) / 2;
      const dy = (Math.sin(block.tilt) * block.length) / 2;
      return [
        createSegment({
          x1: cx - dx,
          y1: block.y - dy,
          x2: cx + dx,
          y2: block.y + dy,
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

/**
 * 블록 단 수. 4단일 때는 화면에 빈 공간이 너무 많았다. 단을 늘리려면 블록 치수도 같이
 * 줄여야 한다 — 단 간격의 절반이 MAX_BLOCK_HALF_HEIGHT보다 작아지면 위아래 단이 겹친다.
 */
export const ROW_COUNT = 6;
/** 블록 지대의 위쪽 경계. 이 위는 구슬이 속도를 얻는 구간이다. */
export const ZONE_TOP = 18;

/**
 * 정규 단이 끝난 뒤 양동이 위에 남겨 두는 띠. 여기에 이벤트 블록이 1~2개 더 선다.
 *
 * 마지막 단을 지나면 남은 것은 자유낙하뿐이라 그 시점에 결과가 사실상 정해진다.
 * 양동이 코앞에서 한 번 더 튕기면 다 내려온 구슬도 옆 칸으로 넘어갈 수 있다.
 */
export const BOTTOM_BAND = 12;

/** 정규 단이 쓰는 구간의 아래 끝. 그 아래 BOTTOM_BAND는 마지막 블록 몫이다. */
export function mainZoneBottom(zoneBottom: number): number {
  return zoneBottom - BOTTOM_BAND;
}

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
export const MAX_BLOCK_EXTENT = 10.5;
/** 블록이 위아래로 차지하는 최대 반높이. 단 간격의 절반보다 작아야 위아래 단이 겹치지 않는다. */
export const MAX_BLOCK_HALF_HEIGHT = 9.1;

/**
 * `scale`은 좁은 단에서 블록을 줄이는 데 쓴다. 두께만은 1 미만으로 내리지 않는다 —
 * 구슬 반지름이 1이라 더 얇아지면 빠른 구슬이 뚫고 지나가는 것처럼 보인다.
 */
function makeBlock(kind: BlockKind, x: number, y: number, rng: Rng, scale = 1): Block {
  const dir = rng() < 0.5 ? 1 : -1;
  const thickness = (base: number) => Math.max(0.8, base * scale);
  switch (kind) {
    case "spinner":
      return {
        kind,
        x,
        y,
        arms: 2,
        length: 8 * scale,
        half: thickness(1.1),
        omega: dir * randRange(rng, 2.2, 3.4),
        phase: rng() * Math.PI * 2,
      };
    case "wheel":
      return {
        kind,
        x,
        y,
        arms: 6,
        length: 7 * scale,
        half: thickness(0.85),
        omega: dir * randRange(rng, 0.7, 1.2),
        phase: rng() * Math.PI * 2,
      };
    case "bumper":
      return { kind, x, y, radius: Math.max(2.4, randRange(rng, 3.2, 4.2) * scale) };
    case "slider":
      return {
        kind,
        x,
        y,
        length: 11 * scale,
        half: thickness(1),
        halfSpan: 4 * scale,
        // 반드시 마찰각보다 가팔라야 한다. 그렇지 않으면 수평일 때와 똑같이 구슬이
        // 판 위에 얹힌 채 같이 왔다갔다 한다.
        tilt: dir * randRange(rng, FRICTION_ANGLE * 1.5, FRICTION_ANGLE * 2.4),
        omega: dir * randRange(rng, 1.1, 1.8),
        phase: rng() * Math.PI * 2,
      };
    case "wedge":
      return {
        kind,
        x,
        y,
        halfSpan: randRange(rng, 7, 9) * scale,
        height: randRange(rng, 4.5, 6) * scale,
        half: thickness(1),
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
/** 레인 간격. 블록 반폭 상한 둘과 좌우 흔들림을 더한 값보다 커야 옆 레인과 겹치지 않는다. */
export const LANE_SPACING = LANE_X[1] - LANE_X[0];
/** 레인 중심에서 좌우로 흔드는 폭 */
const LANE_JITTER = 3;
/**
 * 좁은 단 블록의 축소 배율과 그 결과 반폭 상한.
 *
 * 이 단은 벽 유도판·가운데 분산판과 폭을 나눠 쓰므로 정상 크기(반폭 10.5)로는 들어가지
 * 않는다. 배율을 더 낮춰 작게 만드는 방법도 있지만, 그러면 블록과 분산판 사이에
 * 아무것도 없는 세로 통로가 생긴다 — 실측에서 그 통로 바로 아래 두 양동이가 각각 25%를
 * 먹었다. 슬롯을 꽉 채울 수 있는 크기를 유지하고, 남는 여유만큼만 흔드는 편이 낫다.
 */
const NARROW_SCALE = 0.85;
export const NARROW_BLOCK_EXTENT = 9;
/** 좁은 단에서 블록과 고정 구조물 사이에 두는 최소 간격 */
const NARROW_MARGIN = 1;

/**
 * 양동이 위 띠에 세울 수 있는 블록. **위아래로 얇은 종류만** 쓴다 —
 * 회전 바와 물레방아는 반높이가 8~9라 마지막 단이나 양동이를 침범한다.
 */
const BOTTOM_KINDS = ["bumper", "slider"] as const;
/** 양동이 위 띠에서 블록을 좌우로 흔드는 폭 */
const BOTTOM_JITTER = 4;

/** 벽 유도판의 길이와 낙차 */
const DEFLECTOR_LENGTH = 11;
const DEFLECTOR_DROP = 5;

/**
 * 벽 유도판 — 그리고 같은 단에 서는 가운데 분산판 — 을 세울 단.
 * 좁은 단(레인 2개)에만 세우되 **맨 아래 단은 제외한다.**
 *
 * 모든 2레인 단에 세웠더니 이번에는 반대로 가장자리 양동이가 굶었다(10명 기준 0.9%).
 * 양동이 바로 위에서 안쪽으로 퍼올리면 구슬이 가장자리로 돌아올 기회가 없기 때문이다.
 * 위쪽에서 한 번만 밀어주고, 아래는 다시 퍼질 여지를 남긴다.
 */
function isDeflectorRow(row: number): boolean {
  return row % 2 === 1 && row < ROW_COUNT - 1;
}

/**
 * 가운데 분산판의 반폭과 낙차.
 *
 * 좁다면 블록과 분산판 사이에 세로 통로가 남고, 넓다면 블록이 들어갈 자리가 없다.
 * 이 값과 NARROW_SCALE은 한 쌍이다 — 한쪽을 바꾸면 narrowSlots()의 폭이 블록 반폭의
 * 두 배 이상인지 다시 확인해야 한다.
 */
export const SPLITTER_HALF_SPAN = 14;
const SPLITTER_DROP = 5.5;

/**
 * 좁은 단에서 블록이 들어갈 두 구간. 벽 유도판이 끝나는 곳부터 분산판이 시작하는 곳까지다.
 * 구간을 꽉 채우는 블록을 놓고 남는 만큼만 흔들면, 어디에도 아래로 뚫린 통로가 없다.
 */
function narrowSlots(): ReadonlyArray<readonly [number, number]> {
  const inner = DEFLECTOR_LENGTH + 1 + NARROW_MARGIN;
  const outer = WORLD_WIDTH / 2 - SPLITTER_HALF_SPAN - 1 - NARROW_MARGIN;
  return [
    [inner, outer],
    [WORLD_WIDTH - outer, WORLD_WIDTH - inner],
  ];
}

/**
 * 판 한가운데 서는 고정 분산판. 이벤트 블록이 아니라 판의 뼈대다.
 *
 * 벽 유도판은 구슬을 **안쪽으로만** 민다. 그것만 있으면 가장자리 양동이가 계속 굶으므로,
 * 반대 방향으로 미는 장치를 같은 수만큼 둔다. 한가운데로 내려오던 구슬을 ∧ 지붕으로
 * 받아 좌우 바깥으로 가른다.
 *
 * **벽 유도판과 같은 단에 선다.** 다른 단에 두면 한 단은 전부 안으로, 다음 단은 전부
 * 밖으로 미는 식이 되어 층마다 쏠림이 번갈아 생긴다. 같은 단에 두면 한 번 지나갈 때마다
 * 안팎이 동시에 작용해 그 자리에서 상쇄된다.
 */
export function centerSplitters(zoneBottom: number): SolidSegment[] {
  const rowHeight = (mainZoneBottom(zoneBottom) - ZONE_TOP) / ROW_COUNT;
  const out: SolidSegment[] = [];
  for (let row = 0; row < ROW_COUNT; row++) {
    if (!isDeflectorRow(row)) continue;
    const y = ZONE_TOP + rowHeight * (row + 0.5) - SPLITTER_DROP / 2;
    const x = WORLD_WIDTH / 2;
    out.push(
      createSegment({
        x1: x,
        y1: y,
        x2: x - SPLITTER_HALF_SPAN,
        y2: y + SPLITTER_DROP,
        half: 1,
      }),
      createSegment({
        x1: x,
        y1: y,
        x2: x + SPLITTER_HALF_SPAN,
        y2: y + SPLITTER_DROP,
        half: 1,
      }),
    );
  }
  return out;
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
  const rowHeight = (mainZoneBottom(zoneBottom) - ZONE_TOP) / ROW_COUNT;
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
  const rowHeight = (mainZoneBottom(zoneBottom) - ZONE_TOP) / ROW_COUNT;
  const blocks: Block[] = [];

  // 레인 전체를 매판 좌우로 밀어준다. 레인이 고정이면 블록 **바로 아래** 양동이는 늘
  // 굶고 레인 **사이** 양동이는 늘 배부르다 — 어느 자리가 유리한지가 판마다 같아진다.
  // 통째로 밀면 그 무늬가 매판 다른 자리에 떨어져 평균이 고르게 펴진다.
  // 폭은 단 종류마다 다르므로 -1~1로 정규화해 두고 아래에서 곱한다.
  const laneShift = randRange(rng, -1, 1);

  for (let row = 0; row < ROW_COUNT; row++) {
    const y = ZONE_TOP + rowHeight * (row + 0.5);

    // 좁은 단은 벽 유도판·분산판과 폭을 나눠 쓴다. 남은 구간을 꽉 채우는 크기로 놓고
    // 남는 여유 안에서만 흔든다 — 통로가 생기지 않는 유일한 방법이다.
    if (!usesWideLanes(row)) {
      let previous: BlockKind | null = null;
      for (const [from, to] of narrowSlots()) {
        let kind = rollKind(rng);
        if (kind === previous) kind = rollKind(rng);
        previous = kind;
        const block = makeBlock(kind, 0, y, rng, NARROW_SCALE);
        const extent = blockExtent(block);
        const lo = from + extent;
        const hi = to - extent;
        block.x = lo >= hi ? (from + to) / 2 : randRange(rng, lo, hi);
        blocks.push(block);
      }
      continue;
    }

    // 넓은 단은 레인 셋을 쓴다. 단마다 레인을 엇갈리게 해서 위아래로 뚫린 틈을 막는다.
    const centers = LANE_X.map((x) => x + laneShift * (LANE_SPACING / 4));
    // 되도록 다 채운다. 가끔 한 자리만 비워 판마다 모양이 달라지게 한다.
    const available = centers.map((_, i) => i);
    const keep = rng() < 0.25 ? 2 : available.length;
    const lanes = shuffle(rng, available)
      .slice(0, keep)
      .sort((a, b) => a - b);

    let previous: BlockKind | null = null;
    for (const lane of lanes) {
      let kind = rollKind(rng);
      // 같은 종류가 한 단에 나란히 서면 밋밋해진다. 한 번만 다시 뽑는다.
      if (kind === previous) kind = rollKind(rng);
      previous = kind;
      blocks.push(
        clampX(
          makeBlock(kind, centers[lane] + randRange(rng, -LANE_JITTER, LANE_JITTER), y, rng),
        ),
      );
    }
  }

  // 양동이 코앞의 마지막 관문. 1개면 한가운데, 2개면 좌우로 갈라 세운다.
  const bottomY = zoneBottom - BOTTOM_BAND / 2;
  const bottomCenters = rng() < 0.5 ? [WORLD_WIDTH / 2] : [30, 70];
  for (const center of bottomCenters) {
    const kind = BOTTOM_KINDS[Math.floor(rng() * BOTTOM_KINDS.length)];
    blocks.push(
      clampX(makeBlock(kind, center + randRange(rng, -BOTTOM_JITTER, BOTTOM_JITTER), bottomY, rng)),
    );
  }

  return blocks;
}
