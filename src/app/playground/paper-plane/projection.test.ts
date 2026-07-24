import { describe, it, expect } from "vitest";
import { project, DEPTH_REF } from "./projection";

const VP = { w: 400, h: 800 };

describe("project", () => {
  it("x=0이면 scale 1, 화면 하단 기준선", () => {
    const p = project(0, 0, VP);
    expect(p.scale).toBeCloseTo(1);
    expect(p.screenX).toBe(200);
    expect(p.screenY).toBeCloseTo(800 * 0.82);
  });

  it("높이 y가 크면 화면상 더 위로", () => {
    const low = project(0, 0, VP);
    const high = project(0, 100, VP);
    expect(high.screenY).toBeLessThan(low.screenY);
  });

  it("depth가 커질수록 scale이 감소하고 소실점(위)으로 수렴", () => {
    const near = project(0, 0, VP);
    const mid = project(DEPTH_REF, 0, VP);
    const far = project(DEPTH_REF * 20, 0, VP);
    expect(mid.scale).toBeCloseTo(0.5);
    expect(near.scale).toBeGreaterThan(mid.scale);
    expect(far.scale).toBeLessThan(mid.scale);
    expect(far.screenY).toBeLessThan(mid.screenY);
    expect(far.screenY).toBeGreaterThan(800 * 0.32 - 1);
  });

  it("scale은 항상 (0,1] 범위", () => {
    for (const x of [0, 50, 500, 5000, 50000]) {
      const s = project(x, 0, VP).scale;
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });
});
