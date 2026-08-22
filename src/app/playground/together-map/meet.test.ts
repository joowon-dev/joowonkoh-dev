import { describe, expect, it } from "vitest";
import { GRID_MS, findMeetings, overlapRange, resample } from "./meet";
import type { RawPoint } from "./parse";

const T0 = Date.parse("2026-01-01T00:00:00Z");
const MIN = 60_000;
const OPTS = { radiusM: 100, minDurationMs: 15 * MIN };

function p(minute: number, lat: number, lon: number): RawPoint {
  return { t: T0 + minute * MIN, lat, lon, kind: "path" };
}

/** start분부터 end분까지 5분 간격으로 한 자리에 머무는 사람. */
function stay(start: number, end: number, lat: number, lon: number): RawPoint[] {
  const out: RawPoint[] = [];
  for (let m = start; m <= end; m += 5) out.push(p(m, lat, lon));
  return out;
}

describe("resample", () => {
  it("격자 위 값을 보간해서 채운다", () => {
    const points = [p(0, 37.0, 127.0), p(10, 37.1, 127.0)];
    const grid = resample(points, T0, T0 + 10 * MIN, 5 * MIN, 30 * MIN);
    expect(grid).toHaveLength(3);
    expect(grid[1]?.lat).toBeCloseTo(37.05, 6);
  });

  it("범위 밖은 null — 없는 것을 지어내지 않는다", () => {
    const points = [p(10, 37.0, 127.0), p(20, 37.0, 127.0)];
    const grid = resample(points, T0, T0 + 30 * MIN, 10 * MIN, 30 * MIN);
    expect(grid[0]).toBeNull();
    expect(grid[3]).toBeNull();
  });

  it("구멍을 건너뛰며 보간하지 않는다", () => {
    // 서울에 있다가 두 시간 기록이 없고 부산에서 다시 나타난다.
    // 그 사이를 이으면 있지도 않은 궤적이 국토를 가로지른다.
    const points = [p(0, 37.5665, 126.978), p(120, 35.1796, 129.0756)];
    const grid = resample(points, T0, T0 + 120 * MIN, 30 * MIN, 30 * MIN);
    expect(grid[0]).not.toBeNull();
    expect(grid[1]).toBeNull();
    expect(grid[2]).toBeNull();
    expect(grid[3]).toBeNull();
    expect(grid[4]).not.toBeNull();
  });

  it("구멍이 허용치 이내면 잇는다", () => {
    const points = [p(0, 37.0, 127.0), p(20, 37.2, 127.0)];
    const grid = resample(points, T0, T0 + 20 * MIN, 10 * MIN, 30 * MIN);
    expect(grid[1]).not.toBeNull();
  });

  it("빈 입력은 전부 null", () => {
    const grid = resample([], T0, T0 + 10 * MIN, 5 * MIN, 30 * MIN);
    expect(grid.every((g) => g === null)).toBe(true);
  });
});

describe("overlapRange", () => {
  it("겹치는 기간을 찾는다", () => {
    const a = [p(0, 37, 127), p(60, 37, 127)];
    const b = [p(30, 37, 127), p(90, 37, 127)];
    expect(overlapRange(a, b)).toEqual({ from: T0 + 30 * MIN, to: T0 + 60 * MIN });
  });

  it("안 겹치면 null", () => {
    const a = [p(0, 37, 127), p(10, 37, 127)];
    const b = [p(60, 37, 127), p(90, 37, 127)];
    expect(overlapRange(a, b)).toBeNull();
  });

  it("한쪽이 비면 null", () => {
    expect(overlapRange([], [p(0, 37, 127)])).toBeNull();
  });
});

describe("findMeetings", () => {
  it("같은 자리에 30분 함께 있으면 만남 한 건", () => {
    const a = stay(0, 30, 37.5, 127.0);
    const b = stay(0, 30, 37.5, 127.0);
    const meets = findMeetings(a, b, OPTS);
    expect(meets).toHaveLength(1);
    expect(meets[0].minDistance).toBeCloseTo(0, 6);
  });

  it("최소 지속시간에 못 미치면 만남이 아니다", () => {
    // 10분만 겹친다 — 지하철역에서 스쳐 지나간 것에 가깝다
    const a = stay(0, 10, 37.5, 127.0);
    const b = stay(0, 10, 37.5, 127.0);
    expect(findMeetings(a, b, OPTS)).toHaveLength(0);
  });

  it("판정 거리 밖이면 만남이 아니다", () => {
    // 위도 0.01도 = 약 1.1km
    const a = stay(0, 60, 37.5, 127.0);
    const b = stay(0, 60, 37.51, 127.0);
    expect(findMeetings(a, b, OPTS)).toHaveLength(0);
  });

  it("구멍 너머로 가짜 만남을 만들지 않는다", () => {
    // A는 계속 서울에 있다. B는 서울에 잠깐 있다가 기록이 끊기고 부산에서 나타난다.
    // B의 두 점을 직선으로 이으면 그 선이 A를 오래 스쳐서 없던 만남이 생긴다.
    const a = stay(0, 300, 36.5, 127.5);
    const b = [p(0, 37.5665, 126.978), p(300, 35.1796, 129.0756)];
    expect(findMeetings(a, b, OPTS)).toHaveLength(0);
  });

  it("떨어졌다 다시 만나면 두 건으로 센다", () => {
    const a = stay(0, 200, 37.5, 127.0);
    const b = [...stay(0, 30, 37.5, 127.0), ...stay(35, 90, 37.6, 127.0), ...stay(95, 200, 37.5, 127.0)];
    expect(findMeetings(a, b, OPTS)).toHaveLength(2);
  });

  it("대표 위치는 중앙값이라 끝에 붙은 이동에 끌려가지 않는다", () => {
    // 대부분 37.5에 있다가 마지막에 살짝 움직인다
    const a = stay(0, 60, 37.5, 127.0);
    const b = [...stay(0, 55, 37.5, 127.0), p(60, 37.5008, 127.0)];
    const meets = findMeetings(a, b, OPTS);
    expect(meets).toHaveLength(1);
    expect(meets[0].lat).toBeCloseTo(37.5, 4);
  });

  it("시작과 끝 시각이 실제 구간과 맞는다", () => {
    const a = stay(0, 60, 37.5, 127.0);
    const b = stay(0, 60, 37.5, 127.0);
    const [m] = findMeetings(a, b, OPTS);
    expect(m.start).toBe(T0);
    expect(m.end).toBe(T0 + 60 * MIN);
    expect(m.end - m.start).toBeGreaterThanOrEqual(OPTS.minDurationMs);
  });

  it("겹치는 기간이 없으면 빈 배열", () => {
    const a = stay(0, 60, 37.5, 127.0);
    const b = stay(600, 660, 37.5, 127.0);
    expect(findMeetings(a, b, OPTS)).toEqual([]);
  });

  it("격자 간격은 5분이다", () => {
    expect(GRID_MS).toBe(5 * MIN);
  });
});
