import { describe, it, expect } from "vitest";
import { computeRms, rmsToWind, WIND_THRESHOLD } from "./mic";

describe("computeRms", () => {
  it("무음은 0에 가깝다", () => {
    expect(computeRms(new Float32Array([0, 0, 0, 0]))).toBeCloseTo(0);
  });
  it("진폭이 클수록 값이 크다", () => {
    const quiet = computeRms(new Float32Array([0.1, -0.1, 0.1, -0.1]));
    const loud = computeRms(new Float32Array([0.8, -0.8, 0.8, -0.8]));
    expect(loud).toBeGreaterThan(quiet);
  });
});

describe("rmsToWind", () => {
  it("임계값 이하면 0", () => {
    expect(rmsToWind(WIND_THRESHOLD - 0.01)).toBe(0);
  });
  it("임계값 초과면 0~1 사이 양수", () => {
    const w = rmsToWind(0.5);
    expect(w).toBeGreaterThan(0);
    expect(w).toBeLessThanOrEqual(1);
  });
});
