import { describe, expect, it } from "vitest";
import {
  BALL_RADIUS,
  BOARD_TOP,
  RELEASE,
  RIM_HEIGHT,
  RIM_RADIUS,
  boardZ,
  buildFlight,
  evalArc,
  flightAt,
  type Outcome,
} from "./flight";

const ALL: Outcome[] = ["clean", "frontRim", "backRim", "bank", "short", "long"];
const MADE: Outcome[] = ["clean", "frontRim", "backRim", "bank"];
const D = 6;

describe("evalArc", () => {
  const arc = {
    from: { x: 0, y: 2, z: 0 },
    to: { x: 1, y: 3, z: 10 },
    apex: 5,
    ms: 1000,
  };

  it("양 끝은 준 값 그대로다", () => {
    expect(evalArc(arc, 0)).toEqual({ x: 0, y: 2, z: 0 });
    expect(evalArc(arc, 1)).toEqual({ x: 1, y: 3, z: 10 });
  });

  it("한가운데에서 정확히 apex를 지난다", () => {
    expect(evalArc(arc, 0.5).y).toBeCloseTo(5, 6);
  });

  it("x·z는 직선으로 간다", () => {
    const mid = evalArc(arc, 0.5);
    expect(mid.x).toBeCloseTo(0.5, 6);
    expect(mid.z).toBeCloseTo(5, 6);
  });

  it("범위 밖 u는 잘라낸다", () => {
    expect(evalArc(arc, -1)).toEqual(evalArc(arc, 0));
    expect(evalArc(arc, 2)).toEqual(evalArc(arc, 1));
  });
});

describe("buildFlight", () => {
  it("어떤 결말이든 손에서 출발한다", () => {
    for (const o of ALL) {
      expect(buildFlight(o, D).arcs[0].from).toEqual(RELEASE);
    }
  });

  it("조각들이 끊기지 않고 이어진다", () => {
    for (const o of ALL) {
      const { arcs } = buildFlight(o, D);
      for (let i = 1; i < arcs.length; i++) {
        expect(arcs[i].from).toEqual(arcs[i - 1].to);
      }
    }
  });

  it("총 시간은 조각 시간의 합이다", () => {
    for (const o of ALL) {
      const f = buildFlight(o, D);
      expect(f.totalMs).toBe(f.arcs.reduce((s, a) => s + a.ms, 0));
    }
  });

  it("들어가는 슛은 링을 지나는 시각이 있고, 못 들어가면 없다", () => {
    for (const o of MADE) expect(buildFlight(o, D).swishAtMs).not.toBeNull();
    expect(buildFlight("short", D).swishAtMs).toBeNull();
    expect(buildFlight("long", D).swishAtMs).toBeNull();
  });

  it("들어가는 슛은 마지막에 림을 지나 바닥까지 떨어진다", () => {
    for (const o of MADE) {
      const f = buildFlight(o, D);
      const end = f.arcs[f.arcs.length - 1].to;
      expect(end.y).toBeCloseTo(BALL_RADIUS, 6);
      // 골대 바로 아래로 떨어져야 "들어갔다"로 보인다
      expect(Math.abs(end.z - D)).toBeLessThan(0.3);
    }
  });

  it("앞 링은 링 앞쪽을, 뒤 링은 링 뒤쪽을 때린다", () => {
    expect(buildFlight("frontRim", D).arcs[0].to.z).toBeCloseTo(D - RIM_RADIUS, 6);
    expect(buildFlight("backRim", D).arcs[0].to.z).toBeCloseTo(D + RIM_RADIUS, 6);
  });

  it("백보드 슛은 첫 조각이 백보드에 닿는다", () => {
    const first = buildFlight("bank", D).arcs[0].to;
    expect(first.z).toBeCloseTo(boardZ(D), 6);
    expect(first.y).toBeGreaterThan(RIM_HEIGHT);
    expect(first.y).toBeLessThan(BOARD_TOP);
  });

  it("짧은 슛은 링에 닿기 전 바닥에 떨어진다", () => {
    const f = buildFlight("short", D);
    expect(f.arcs[0].to.y).toBeCloseTo(BALL_RADIUS, 6);
    expect(f.arcs[0].to.z).toBeLessThan(D - RIM_RADIUS);
  });

  it("넘긴 슛은 백보드 위쪽을 맞고 뒤로 넘어간다", () => {
    const f = buildFlight("long", D);
    expect(f.arcs[0].to.y).toBeGreaterThan(RIM_HEIGHT + 0.5);
    const end = f.arcs[f.arcs.length - 1].to;
    expect(end.z).toBeGreaterThan(boardZ(D));
  });

  it("아치가 링보다 높다 — 안 그러면 밑에서 뚫고 올라가는 그림이 된다", () => {
    for (const o of ALL) {
      expect(buildFlight(o, D).arcs[0].apex).toBeGreaterThan(RIM_HEIGHT);
    }
  });

  it("멀수록 오래, 높이 날아간다", () => {
    const near = buildFlight("clean", 3);
    const far = buildFlight("clean", 8);
    expect(far.totalMs).toBeGreaterThan(near.totalMs);
    expect(far.arcs[0].apex).toBeGreaterThan(near.arcs[0].apex);
  });

  it("좌우로 흘리는 값이 궤적에 반영된다", () => {
    expect(buildFlight("clean", D, 0.2).arcs[0].to.x).toBeCloseTo(0.2, 6);
  });
});

describe("flightAt", () => {
  it("0초에는 손에 있다", () => {
    expect(flightAt(buildFlight("clean", D), 0).pos).toEqual(RELEASE);
  });

  it("총 시간이 지나면 끝난 것으로 본다", () => {
    for (const o of ALL) {
      const f = buildFlight(o, D);
      expect(flightAt(f, f.totalMs - 1).done).toBe(false);
      expect(flightAt(f, f.totalMs).done).toBe(true);
    }
  });

  it("시간이 넘쳐도 마지막 자리에 머문다", () => {
    const f = buildFlight("clean", D);
    const last = f.arcs[f.arcs.length - 1].to;
    const pos = flightAt(f, f.totalMs + 5000).pos;
    expect(pos.y).toBeCloseTo(last.y, 6);
    expect(pos.z).toBeCloseTo(last.z, 6);
  });

  it("음수 시간은 0으로 본다", () => {
    expect(flightAt(buildFlight("clean", D), -100).pos).toEqual(RELEASE);
  });

  it("조각이 넘어가는 시각에 arcIndex가 올라간다", () => {
    const f = buildFlight("frontRim", D);
    expect(flightAt(f, 0).arcIndex).toBe(0);
    expect(flightAt(f, f.arcs[0].ms + 10).arcIndex).toBe(1);
  });

  it("링을 지나는 시각에 공이 링 높이에 있다", () => {
    for (const o of MADE) {
      const f = buildFlight(o, D);
      expect(flightAt(f, f.swishAtMs!).pos.y).toBeCloseTo(RIM_HEIGHT, 6);
    }
  });

  it("골대까지 z가 뒤로 물러나지 않는다 — 클린샷은 한 방향으로만 간다", () => {
    const f = buildFlight("clean", D);
    let prev = -Infinity;
    for (let t = 0; t <= f.arcs[0].ms; t += 20) {
      const z = flightAt(f, t).pos.z;
      expect(z).toBeGreaterThanOrEqual(prev);
      prev = z;
    }
  });

  it("날아가는 동안 공이 땅을 뚫지 않는다", () => {
    for (const o of ALL) {
      const f = buildFlight(o, D);
      for (let t = 0; t <= f.totalMs; t += 20) {
        expect(flightAt(f, t).pos.y).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
