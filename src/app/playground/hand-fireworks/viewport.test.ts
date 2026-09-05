import { describe, it, expect } from "vitest";
import { coverRect, toWorld } from "./viewport";

const VIDEO = 4 / 3;

describe("coverRect", () => {
  it("비율이 같으면 무대를 그대로 채운다", () => {
    expect(coverRect(400, 300, VIDEO)).toEqual({ x: 0, y: 0, w: 400, h: 300 });
  });

  it("무대가 더 넓으면 위아래가 잘린다", () => {
    // 16:9 무대에 4:3 영상 — 폭을 맞추고 높이가 넘쳐 위아래로 삐져나간다
    const r = coverRect(1600, 900, VIDEO);
    expect(r.w).toBe(1600);
    expect(r.h).toBe(1200);
    expect(r.x).toBe(0);
    expect(r.y).toBe(-150);
  });

  it("무대가 더 좁으면 좌우가 잘린다", () => {
    const r = coverRect(300, 400, VIDEO);
    expect(r.h).toBe(400);
    expect(r.w).toBeCloseTo(533.33, 1);
    expect(r.y).toBe(0);
    expect(r.x).toBeCloseTo(-116.67, 1);
  });

  it("무대 크기를 아직 모를 때도 터지지 않는다", () => {
    expect(coverRect(0, 0, VIDEO)).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  });
});

describe("toWorld", () => {
  it("영상 한가운데는 무대 한가운데다", () => {
    const stage = { w: 1600, h: 900 };
    const r = coverRect(stage.w, stage.h, VIDEO);
    const c = toWorld({ x: 0.5, y: 0.5 }, r, stage.h);
    expect(c.x).toBeCloseTo(stage.w / 2 / stage.h, 5);
    expect(c.y).toBeCloseTo(0.5, 5);
  });

  it("잘려 나간 자리는 0~1 밖으로 나간다 — 화면 밖에서 날아 들어오게 둔다", () => {
    const r = coverRect(1600, 900, VIDEO);
    expect(toWorld({ x: 0.5, y: 0 }, r, 900).y).toBeLessThan(0);
  });
});
