import { describe, expect, it } from "vitest";

import { BITE_STEP, camZoom, MIN_VISIBLE_GAP, slowFactor, stepped, visibleGap } from "./motion";

describe("motion", () => {
  it("한 입씩 끊어서 나아가고, 끝에서는 정확히 멈춘다", () => {
    expect(stepped(0, 60)).toBe(0);
    expect(stepped(BITE_STEP * 0.5, 60)).toBe(BITE_STEP); // 앞으로 쑥 나간 뒤 오물오물
    expect(stepped(61, 60)).toBe(60);
    expect(stepped(59.9, 60)).toBeLessThanOrEqual(60);
  });

  it("가까울수록 느려지고 카메라가 다가간다", () => {
    expect(slowFactor(100)).toBe(1);
    expect(slowFactor(0)).toBeCloseTo(0.25);
    expect(slowFactor(10)).toBeLessThan(slowFactor(30));
    expect(camZoom(150)).toBe(1);
    expect(camZoom(2)).toBeGreaterThan(1.15);
    expect(camZoom(2)).toBeLessThanOrEqual(1.2);
  });

  it("화면 속 틈은 멀면 그대로, 0 이 돼도 얼굴이 닿지 않게 남는다", () => {
    expect(visibleGap(80)).toBe(80);
    expect(visibleGap(75)).toBe(75);
    expect(visibleGap(0)).toBe(MIN_VISIBLE_GAP);
    expect(visibleGap(-3)).toBe(MIN_VISIBLE_GAP);
    expect(visibleGap(10)).toBeGreaterThan(visibleGap(5));
  });
});
