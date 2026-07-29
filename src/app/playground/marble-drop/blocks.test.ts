import { describe, expect, it } from "vitest";
import { createRng } from "../_shared/random";
import { blockZoneBottom, layoutBuckets, MAX_PLAYERS, targetCount } from "./setup";
import {
  MAX_BLOCK_EXTENT,
  MAX_BLOCK_HALF_HEIGHT,
  ROW_COUNT,
  SPLITTER_HALF_SPAN,
  ZONE_TOP,
  allCircles,
  allSegments,
  blockCircles,
  blockExtent,
  blockSegments,
  centerSplitters,
  layoutBlocks,
  wallDeflectors,
  type Block,
  type RotorBlock,
} from "./blocks";
import { FRICTION_ANGLE, WORLD_WIDTH } from "./physics";

const ZONE_BOTTOM = 130;

function spinner(): RotorBlock {
  return { kind: "spinner", x: 50, y: 50, arms: 2, length: 10, half: 1, omega: 2, phase: 0 };
}

describe("blockSegments", () => {
  it("회전 블록은 팔 수만큼 선분을 내고 모두 중심에서 뻗는다", () => {
    const segs = blockSegments({ ...spinner(), arms: 6 }, 0);
    expect(segs).toHaveLength(6);
    for (const s of segs) {
      expect(s.x1).toBe(50);
      expect(s.y1).toBe(50);
      expect(Math.hypot(s.x2 - 50, s.y2 - 50)).toBeCloseTo(10, 6);
      expect(s.spin).toEqual({ cx: 50, cy: 50, omega: 2 });
    }
  });

  it("회전 블록은 시간이 지나면 각도가 바뀐다", () => {
    const a = blockSegments(spinner(), 0)[0];
    const b = blockSegments(spinner(), 0.5)[0];
    expect(b.x2).not.toBeCloseTo(a.x2, 3);
  });

  it("왕복 판은 좌우로 움직이고 그 속도를 갖는다", () => {
    const slider: Block = {
      kind: "slider",
      x: 50,
      y: 60,
      length: 12,
      half: 1,
      halfSpan: 5,
      tilt: 0,
      omega: 1,
      phase: 0,
    };
    const at0 = blockSegments(slider, 0)[0];
    const at1 = blockSegments(slider, Math.PI / 2)[0];
    // phase 0에서는 중심, PI/2에서는 오른쪽 끝
    expect((at0.x1 + at0.x2) / 2).toBeCloseTo(50, 6);
    expect((at1.x1 + at1.x2) / 2).toBeCloseTo(55, 6);
    // 끝점에서는 속도가 0, 중심에서는 최대
    expect(Math.abs(at1.vx)).toBeLessThan(Math.abs(at0.vx));
    expect(at0.spin).toBeNull();
  });

  it("왕복 판은 마찰각보다 가파르게 기운다 — 그래야 구슬이 얹히지 않고 미끄러진다", () => {
    for (let seed = 0; seed < 300; seed++) {
      for (const block of layoutBlocks(createRng(seed), ZONE_BOTTOM)) {
        if (block.kind !== "slider") continue;
        expect(Math.abs(block.tilt)).toBeGreaterThan(FRICTION_ANGLE);
        const s = blockSegments(block, 0)[0];
        expect(Math.abs(s.y2 - s.y1)).toBeGreaterThan(0.5);
      }
    }
  });

  it("쐐기와 벽 유도판도 마찰각보다 가파르다", () => {
    const steepEnough = (s: { x1: number; y1: number; x2: number; y2: number }) =>
      Math.abs(Math.atan2(s.y2 - s.y1, s.x2 - s.x1));
    for (const s of wallDeflectors(ZONE_BOTTOM)) {
      expect(steepEnough(s)).toBeGreaterThan(FRICTION_ANGLE);
    }
    for (let seed = 0; seed < 100; seed++) {
      for (const block of layoutBlocks(createRng(seed), ZONE_BOTTOM)) {
        if (block.kind !== "wedge") continue;
        for (const s of blockSegments(block, 0)) {
          expect(steepEnough(s)).toBeGreaterThan(FRICTION_ANGLE);
        }
      }
    }
  });

  it("쐐기는 두 선분이고 시간에 무관하다", () => {
    const wedge: Block = { kind: "wedge", x: 50, y: 60, halfSpan: 10, height: 7, half: 1 };
    const a = blockSegments(wedge, 0);
    const b = blockSegments(wedge, 12);
    expect(a).toHaveLength(2);
    expect(a).toEqual(b);
    // 꼭짓점이 위, 두 끝이 아래로 벌어진다
    expect(a[0].y2).toBeGreaterThan(a[0].y1);
    expect(a[1].y2).toBeGreaterThan(a[1].y1);
    expect(a[0].x2).toBeLessThan(50);
    expect(a[1].x2).toBeGreaterThan(50);
  });

  it("범퍼는 선분이 없고 원만 있다", () => {
    const bumper: Block = { kind: "bumper", x: 30, y: 40, radius: 4 };
    expect(blockSegments(bumper, 0)).toEqual([]);
    expect(blockCircles(bumper)).toHaveLength(1);
    expect(blockCircles(bumper)[0].restitution).toBeGreaterThan(1);
  });

  it("범퍼가 아닌 블록은 원이 없다", () => {
    expect(blockCircles(spinner())).toEqual([]);
  });
});

describe("allSegments / allCircles", () => {
  it("여러 블록의 도형을 합친다", () => {
    const blocks: Block[] = [spinner(), { kind: "bumper", x: 20, y: 20, radius: 4 }];
    expect(allSegments(blocks, 0)).toHaveLength(2);
    expect(allCircles(blocks)).toHaveLength(1);
  });
});

describe("layoutBlocks", () => {
  it("모든 블록이 벽 안에 들어간다", () => {
    for (let seed = 0; seed < 300; seed++) {
      for (const block of layoutBlocks(createRng(seed), ZONE_BOTTOM)) {
        const extent = blockExtent(block);
        expect(block.x - extent).toBeGreaterThanOrEqual(0);
        expect(block.x + extent).toBeLessThanOrEqual(WORLD_WIDTH);
      }
    }
  });

  it("어떤 블록도 반폭 상한을 넘지 않는다", () => {
    for (let seed = 0; seed < 300; seed++) {
      for (const block of layoutBlocks(createRng(seed), ZONE_BOTTOM)) {
        expect(blockExtent(block)).toBeLessThanOrEqual(MAX_BLOCK_EXTENT);
      }
    }
  });

  it("같은 단에 선 블록끼리 좌우로 겹치지 않는다", () => {
    for (let seed = 0; seed < 300; seed++) {
      const byRow = new Map<number, Block[]>();
      for (const block of layoutBlocks(createRng(seed), ZONE_BOTTOM)) {
        const list = byRow.get(block.y) ?? [];
        list.push(block);
        byRow.set(block.y, list);
      }
      for (const row of byRow.values()) {
        const sorted = [...row].sort((a, b) => a.x - b.x);
        for (let i = 1; i < sorted.length; i++) {
          const gap =
            sorted[i].x - blockExtent(sorted[i]) - (sorted[i - 1].x + blockExtent(sorted[i - 1]));
          expect(gap).toBeGreaterThan(0);
        }
      }
    }
  });

  it("위아래 단이 서로 겹치지 않는다", () => {
    // 가장 빡빡한 경우는 양동이가 제일 깊은 10명 판이다
    const buckets = layoutBuckets(
      Array.from({ length: MAX_PLAYERS }, (_, i) => i),
      targetCount(MAX_PLAYERS),
    );
    const zoneBottom = blockZoneBottom(buckets);
    const rowHeight = (zoneBottom - ZONE_TOP) / ROW_COUNT;
    expect(rowHeight / 2).toBeGreaterThanOrEqual(MAX_BLOCK_HALF_HEIGHT);
  });

  it("빈 단 없이 촘촘하게 찬다", () => {
    for (let seed = 0; seed < 100; seed++) {
      const blocks = layoutBlocks(createRng(seed), ZONE_BOTTOM);
      // 6단 × 레인 2~3개
      expect(blocks.length).toBeGreaterThanOrEqual(ROW_COUNT * 2);
    }
  });

  it("단마다 블록이 최소 하나는 있고 지대 안에 놓인다", () => {
    for (let seed = 0; seed < 100; seed++) {
      const blocks = layoutBlocks(createRng(seed), ZONE_BOTTOM);
      const rows = new Set(blocks.map((b) => b.y));
      expect(rows.size).toBe(ROW_COUNT);
      for (const b of blocks) {
        expect(b.y).toBeGreaterThan(ZONE_TOP);
        expect(b.y).toBeLessThan(ZONE_BOTTOM);
      }
    }
  });

  it("시드가 같으면 배치가 같고, 다르면 달라진다", () => {
    expect(layoutBlocks(createRng(7), ZONE_BOTTOM)).toEqual(layoutBlocks(createRng(7), ZONE_BOTTOM));
    expect(layoutBlocks(createRng(7), ZONE_BOTTOM)).not.toEqual(
      layoutBlocks(createRng(8), ZONE_BOTTOM),
    );
  });
});

describe("centerSplitters", () => {
  const splitters = centerSplitters(ZONE_BOTTOM);

  it("존재한다 — 벽 유도판이 안쪽으로만 미는 것을 상쇄하는 장치다", () => {
    expect(splitters.length).toBeGreaterThan(0);
    expect(splitters.length % 2).toBe(0);
  });

  it("한가운데에서 좌우 바깥 아래로 갈라진다", () => {
    for (let i = 0; i < splitters.length; i += 2) {
      const left = splitters[i];
      const right = splitters[i + 1];
      // 꼭짓점이 판 한가운데
      expect(left.x1).toBeCloseTo(WORLD_WIDTH / 2, 6);
      expect(right.x1).toBeCloseTo(WORLD_WIDTH / 2, 6);
      // 좌우로 벌어지며 아래로 내려간다
      expect(left.x2).toBeLessThan(left.x1);
      expect(right.x2).toBeGreaterThan(right.x1);
      expect(left.y2).toBeGreaterThan(left.y1);
      expect(right.y2).toBeGreaterThan(right.y1);
      // 좌우 대칭이어야 어느 쪽도 유리해지지 않는다
      expect(left.x1 - left.x2).toBeCloseTo(right.x2 - right.x1, 6);
      expect(left.y2 - left.y1).toBeCloseTo(right.y2 - right.y1, 6);
    }
  });

  it("마찰각보다 가팔라 구슬이 미끄러진다", () => {
    for (const s of splitters) {
      expect(Math.abs(Math.atan2(s.y2 - s.y1, s.x2 - s.x1))).toBeGreaterThan(FRICTION_ANGLE);
    }
  });

  it("벽 유도판과 같은 단에 서지 않는다 — 서로 반대 방향이라 상쇄된다", () => {
    const rowY = (s: { y1: number; y2: number }) => (s.y1 + s.y2) / 2;
    const deflectorRows = wallDeflectors(ZONE_BOTTOM).map(rowY);
    for (const s of splitters) {
      for (const d of deflectorRows) {
        expect(Math.abs(rowY(s) - d)).toBeGreaterThan(1);
      }
    }
  });

  it("어느 시드에서도 무작위 블록과 겹치지 않는다", () => {
    // 분산판 자신의 두께(1)까지 포함해서 잰다
    const half = SPLITTER_HALF_SPAN + 1;
    for (let seed = 0; seed < 300; seed++) {
      for (const block of layoutBlocks(createRng(seed), ZONE_BOTTOM)) {
        for (const s of splitters) {
          const sameRow = Math.abs(block.y - (s.y1 + s.y2) / 2) < MAX_BLOCK_HALF_HEIGHT;
          if (!sameRow) continue;
          const gap = Math.abs(block.x - WORLD_WIDTH / 2) - blockExtent(block) - half;
          expect(gap).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("wallDeflectors", () => {
  const deflectors = wallDeflectors(ZONE_BOTTOM);

  it("좌우가 짝을 이룬다 — 한쪽만 있으면 그쪽 양동이가 불리해진다", () => {
    expect(deflectors.length % 2).toBe(0);
    for (let i = 0; i < deflectors.length; i += 2) {
      const left = deflectors[i];
      const right = deflectors[i + 1];
      expect(left.x1).toBe(0);
      expect(right.x1).toBe(WORLD_WIDTH);
      expect(left.x2).toBeCloseTo(WORLD_WIDTH - right.x2, 6);
      expect(left.y1).toBe(right.y1);
      expect(left.y2).toBe(right.y2);
    }
  });

  it("벽에서 안쪽 아래로 기울어 구슬을 안으로 보낸다", () => {
    for (const s of deflectors) {
      expect(s.y2).toBeGreaterThan(s.y1);
    }
  });

  it("맨 아래 단에는 세우지 않는다 — 가장자리가 굶는다", () => {
    const rowHeight = (ZONE_BOTTOM - ZONE_TOP) / ROW_COUNT;
    const lastRowY = ZONE_TOP + rowHeight * (ROW_COUNT - 1 + 0.5);
    for (const s of deflectors) {
      expect(Math.abs((s.y1 + s.y2) / 2 - lastRowY)).toBeGreaterThan(1);
    }
  });
});
