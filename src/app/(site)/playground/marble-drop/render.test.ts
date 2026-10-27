import { describe, expect, it } from "vitest";
import { MARBLE_RADIUS, WORLD_HEIGHT, WORLD_WIDTH, type Bucket } from "./physics";
import {
  HORIZONTAL_LABEL_MIN_PX,
  computeCamera,
  labelIsVertical,
  projectPoint,
  stackSpot,
} from "./render";

function bucket(overrides: Partial<Bucket> = {}): Bucket {
  return {
    ownerIndex: 0,
    x0: 0,
    x1: 20,
    top: WORLD_HEIGHT - 20,
    capacity: 12,
    count: 0,
    perRow: 3,
    filledAt: null,
    ...overrides,
  };
}

describe("computeCamera", () => {
  it("월드 비율과 같은 화면에서는 꽉 채우고 여백이 없다", () => {
    const cam = computeCamera({ w: WORLD_WIDTH * 3, h: WORLD_HEIGHT * 3 });
    expect(cam.scale).toBeCloseTo(3, 6);
    expect(cam.offsetX).toBeCloseTo(0, 6);
    expect(cam.offsetY).toBeCloseTo(0, 6);
  });

  it("가로가 남는 화면에서는 세로에 맞추고 좌우를 가운데 정렬한다", () => {
    const cam = computeCamera({ w: 2000, h: WORLD_HEIGHT * 2 });
    expect(cam.scale).toBeCloseTo(2, 6);
    expect(cam.offsetX).toBeCloseTo((2000 - WORLD_WIDTH * 2) / 2, 6);
    expect(cam.offsetY).toBeCloseTo(0, 6);
  });

  it("세로가 남는 화면에서는 가로에 맞춘다", () => {
    const cam = computeCamera({ w: WORLD_WIDTH * 2, h: 5000 });
    expect(cam.scale).toBeCloseTo(2, 6);
    expect(cam.offsetY).toBeGreaterThan(0);
  });

  it("어떤 화면 크기에서도 월드 전체가 화면 안에 들어간다", () => {
    for (const vp of [
      { w: 320, h: 568 },
      { w: 390, h: 844 },
      { w: 1440, h: 900 },
      { w: 100, h: 2000 },
    ]) {
      const cam = computeCamera(vp);
      const tl = projectPoint(0, 0, cam);
      const br = projectPoint(WORLD_WIDTH, WORLD_HEIGHT, cam);
      expect(tl.sx).toBeGreaterThanOrEqual(-1e-6);
      expect(tl.sy).toBeGreaterThanOrEqual(-1e-6);
      expect(br.sx).toBeLessThanOrEqual(vp.w + 1e-6);
      expect(br.sy).toBeLessThanOrEqual(vp.h + 1e-6);
    }
  });

  it("크기가 0인 화면에서도 배율이 0이 되지 않는다", () => {
    expect(computeCamera({ w: 0, h: 0 }).scale).toBeGreaterThan(0);
  });
});

describe("stackSpot", () => {
  it("아래 줄부터 채운다", () => {
    const b = bucket({ count: 4 });
    const first = stackSpot(b, 0);
    const second = stackSpot(b, b.perRow);
    expect(first.y).toBeGreaterThan(second.y); // y는 아래로 증가
    expect(second.y).toBeCloseTo(first.y - MARBLE_RADIUS * 2, 6);
  });

  it("가득 찬 줄은 양동이 가운데에 놓인다", () => {
    const b = bucket({ count: 3, perRow: 3, x0: 0, x1: 20 });
    const xs = [0, 1, 2].map((i) => stackSpot(b, i).x);
    const mid = (xs[0] + xs[2]) / 2;
    expect(mid).toBeCloseTo((b.x0 + b.x1) / 2, 6);
  });

  it("덜 찬 마지막 줄도 가운데 정렬된다 — 왼쪽으로 쏠리면 어색하다", () => {
    const b = bucket({ count: 4, perRow: 3, x0: 0, x1: 20 });
    expect(stackSpot(b, 3).x).toBeCloseTo((b.x0 + b.x1) / 2, 6);
  });

  it("쌓인 구슬이 양동이 좌우를 벗어나지 않는다", () => {
    const b = bucket({ count: 12, perRow: 3, x0: 0, x1: 20 });
    for (let i = 0; i < b.count; i++) {
      const spot = stackSpot(b, i);
      expect(spot.x - MARBLE_RADIUS).toBeGreaterThanOrEqual(b.x0 - 1e-6);
      expect(spot.x + MARBLE_RADIUS).toBeLessThanOrEqual(b.x1 + 1e-6);
    }
  });

  it("첫 구슬이 양동이 바닥에 놓인다", () => {
    expect(stackSpot(bucket({ count: 1 }), 0).y).toBeCloseTo(
      WORLD_HEIGHT - MARBLE_RADIUS - 0.6,
      6,
    );
  });
});

describe("labelIsVertical", () => {
  it("좁은 양동이는 이름을 세로로 쓴다", () => {
    const cam = computeCamera({ w: 390, h: 844 });
    const narrow = bucket({ x0: 0, x1: WORLD_WIDTH / 10 });
    expect((narrow.x1 - narrow.x0) * cam.scale).toBeLessThan(HORIZONTAL_LABEL_MIN_PX);
    expect(labelIsVertical(narrow, cam)).toBe(true);
  });

  it("넓은 양동이는 가로로 쓴다", () => {
    const cam = computeCamera({ w: 390, h: 844 });
    expect(labelIsVertical(bucket({ x0: 0, x1: WORLD_WIDTH / 2 }), cam)).toBe(false);
  });
});
