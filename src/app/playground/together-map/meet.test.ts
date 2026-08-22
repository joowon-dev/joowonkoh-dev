import { describe, expect, it } from "vitest";
import { DEFAULT_MEET_MIN_MS, DEFAULT_MEET_RADIUS_M, GRID_MS, MAX_GAP_MS, findMeetings, overlapRange, resample } from "./meet";
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
    // B는 300분 동안 70m만 이동한다. A는 B의 시작점에 있다.
    // 기록 구멍이 없고 직선 보간하면, A와 B는 300분 동안 70m 안에 있어서
    // 15분보다 훨씬 긴 거짓 만남이 생긴다.
    // 구멍 체크가 켜면 (현재 코드) 300분 차이가 30분 제한을 넘어서 구간이 전부 null이 되고,
    // 만남이 없다.
    const a = stay(0, 300, 37.0, 127.0);
    const b = [p(0, 37.0, 127.0), p(300, 36.9995, 127.0005)];
    expect(findMeetings(a, b, OPTS)).toHaveLength(0);
  });

  it("떨어졌다 다시 만나면 두 건으로 센다", () => {
    const a = stay(0, 200, 37.5, 127.0);
    const b = [...stay(0, 30, 37.5, 127.0), ...stay(35, 90, 37.6, 127.0), ...stay(95, 200, 37.5, 127.0)];
    expect(findMeetings(a, b, OPTS)).toHaveLength(2);
  });

  it("대표 위치는 중앙값이라 끝에 붙은 이동에 끌려가지 않는다", () => {
    // 처음 50분간 37.5, 마지막 10분간 37.8에서 떨어져 있다.
    // 중앙값은 37.5 (13개 중 앞 11개)이지만, 평균은 37.538이 되어 끌려간다.
    const a = stay(0, 60, 37.5, 127.0);
    const b = [...stay(0, 50, 37.5, 127.0), ...stay(55, 60, 37.8, 127.0)];
    const meets = findMeetings(a, b, OPTS);
    expect(meets).toHaveLength(1);
    expect(meets[0].lat).toBeCloseTo(37.5, 4);
    expect(meets[0].lon).toBeCloseTo(127.0, 4);
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

  it("상수들이 맞다", () => {
    expect(MAX_GAP_MS).toBe(30 * MIN);
    expect(DEFAULT_MEET_RADIUS_M).toBe(100);
    expect(DEFAULT_MEET_MIN_MS).toBe(15 * MIN);
  });

  it("null 셀은 만남을 끊는다", () => {
    // A와 B가 0-30분에 함께 있고, 30-60분 사이 B가 기록 없다.
    // 그 다음 95-125분에 다시 함께 있다.
    // 결과: 두 개의 별개 만남, 하나의 만남 아님.
    const a = stay(0, 125, 37.5, 127.0);
    const b = [...stay(0, 30, 37.5, 127.0), ...stay(95, 125, 37.5, 127.0)];
    const meets = findMeetings(a, b, OPTS);
    expect(meets).toHaveLength(2);
  });

  it("최소 지속시간 경계: 정확히 15분이면 포함된다", () => {
    // 정확히 15분 만남 (3개 격자 셀 × 5분 = 15분).
    // 이 테스트는 close(i)로 변경하면 duration이 20분이 되어도 포함되지만,
    // 다른 테스트와 함께 close(i-1) 변경을 감지한다.
    const a = stay(0, 15, 37.5, 127.0);
    const b = stay(0, 15, 37.5, 127.0);
    const meets = findMeetings(a, b, OPTS);
    expect(meets).toHaveLength(1);
    expect(meets[0].start).toBe(T0);
    expect(meets[0].end).toBe(T0 + 15 * MIN);
  });

  it("최소 지속시간 경계: 10분은 15분 미만이므로 제외된다", () => {
    // 10분 만남은 minDurationMs (15분) 미만이라 제외.
    // 하지만 close(i)로 변경하면 duration이 15분이 되어 포함된다.
    // 이 테스트는 close(i-1) 변경을 감지한다.
    const a = stay(0, 10, 37.5, 127.0);
    const b = stay(0, 10, 37.5, 127.0);
    const meets = findMeetings(a, b, OPTS);
    expect(meets).toHaveLength(0);
  });

  it("최소 거리가 0이 아닌 경우도 기록된다", () => {
    // 두 사람이 약 80m 떨어져 있고 radiusM=100 안에 있으므로 만남.
    // minDistance는 0이 아니고 radiusM보다 작아야 함.
    const a = stay(0, 60, 37.5, 127.0);
    const b = stay(0, 60, 37.50072, 127.0);  // 약 80m 거리
    const meets = findMeetings(a, b, OPTS);
    expect(meets).toHaveLength(1);
    expect(meets[0].minDistance).toBeGreaterThan(50);
    expect(meets[0].minDistance).toBeLessThan(100);
  });
});
