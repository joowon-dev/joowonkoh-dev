import { describe, expect, it } from "vitest";
import { METER_MAX, meterPct, meterSegments } from "./meter";
import { POWER_AT_FAR, POWER_AT_NEAR, outcomeFor } from "./game";

describe("meterPct", () => {
  it("0과 최대치가 양 끝이다", () => {
    expect(meterPct(0)).toBe(0);
    expect(meterPct(METER_MAX)).toBe(100);
  });

  it("축 밖으로 나가면 끝에 붙인다", () => {
    expect(meterPct(-10)).toBe(0);
    expect(meterPct(999)).toBe(100);
  });
});

describe("meterSegments", () => {
  it("칸들이 겹치지 않고 붙어 있다", () => {
    const segs = meterSegments(50);
    for (let i = 1; i < segs.length; i++) {
      expect(segs[i].leftPct).toBeCloseTo(segs[i - 1].leftPct + segs[i - 1].widthPct, 6);
    }
  });

  it("어느 거리에서든 게이지를 처음부터 끝까지 덮는다", () => {
    for (let r = POWER_AT_NEAR - 6; r <= POWER_AT_FAR + 1; r += 1) {
      const segs = meterSegments(r);
      expect(segs[0].leftPct).toBeCloseTo(0, 6);
      const last = segs[segs.length - 1];
      expect(last.leftPct + last.widthPct).toBeCloseTo(100, 6);
    }
  });

  it("칸마다 그 자리의 실제 판정과 같다", () => {
    const required = 50;
    for (const seg of meterSegments(required)) {
      // 칸 한가운데의 파워를 실제 판정 함수에 넣어 본다
      const mid = ((seg.leftPct + seg.widthPct / 2) / 100) * METER_MAX;
      expect(outcomeFor(mid - required)).toBe(seg.outcome);
    }
  });

  it("가까운 슛에서는 클린 칸이 왼쪽에 있다", () => {
    const segs = meterSegments(POWER_AT_NEAR);
    const clean = segs.find((s) => s.outcome === "clean")!;
    expect(clean.leftPct).toBeLessThan(30);
  });

  it("실제로 나오는 모든 거리에서 여섯 칸이 다 보인다", () => {
    // 한 칸이라도 축 밖으로 밀리면 플레이어는 자기가 어디로 빠졌는지 못 본다.
    // 게이지 최대치와 요구치 범위가 어긋나면 여기서 걸린다.
    for (let r = POWER_AT_NEAR - 6; r <= POWER_AT_FAR + 1; r += 1) {
      const kinds = meterSegments(r).map((s) => s.outcome);
      expect(kinds).toEqual(["short", "frontRim", "clean", "backRim", "bank", "long"]);
    }
  });

  it("칸이 뒤집히거나 음수 폭이 되지 않는다", () => {
    for (let r = 0; r <= METER_MAX; r += 5) {
      for (const seg of meterSegments(r)) {
        expect(seg.widthPct).toBeGreaterThan(0);
        expect(seg.leftPct).toBeGreaterThanOrEqual(0);
        expect(seg.leftPct + seg.widthPct).toBeLessThanOrEqual(100 + 1e-9);
      }
    }
  });
});
