import { describe, expect, it } from "vitest";
import { createRng } from "../_shared/random";
import {
  MAX_BLOCK_EXTENT,
  ROW_COUNT,
  ZONE_TOP,
  allCircles,
  allSegments,
  blockCircles,
  blockExtent,
  blockSegments,
  layoutBlocks,
  wallDeflectors,
  type Block,
  type RotorBlock,
} from "./blocks";
import { WORLD_WIDTH } from "./physics";

const ZONE_BOTTOM = 140;

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
