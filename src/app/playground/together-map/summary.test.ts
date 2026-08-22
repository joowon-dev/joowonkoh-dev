import { describe, expect, it } from "vitest";
import type { Meeting } from "./meet";
import type { RawPoint } from "./parse";
import { buildSummary } from "./summary";

const T0 = Date.parse("2026-01-01T00:00:00Z");
const MIN = 60_000;

function p(minute: number, lat: number, lon: number): RawPoint {
  return { t: T0 + minute * MIN, lat, lon, kind: "path" };
}

function stay(start: number, end: number, lat: number, lon: number): RawPoint[] {
  const out: RawPoint[] = [];
  for (let m = start; m <= end; m += 5) out.push(p(m, lat, lon));
  return out;
}

function meeting(startMin: number, endMin: number, lat: number, lon: number): Meeting {
  return {
    start: T0 + startMin * MIN,
    end: T0 + endMin * MIN,
    lat,
    lon,
    minDistance: 10,
  };
}

describe("buildSummary", () => {
  const a = stay(0, 120, 37.5, 127.0);
  const b = stay(0, 120, 37.5, 127.0);

  it("만난 횟수를 센다", () => {
    const s = buildSummary(a, b, [meeting(0, 30, 37.5, 127), meeting(60, 90, 37.5, 127)]);
    expect(s.meetCount).toBe(2);
  });

  it("함께한 시간은 구간 길이의 합이다", () => {
    const s = buildSummary(a, b, [meeting(0, 30, 37.5, 127), meeting(60, 90, 37.5, 127)]);
    expect(s.totalTogetherMs).toBe(60 * MIN);
  });

  it("가장 자주 만난 자리를 찾는다", () => {
    const s = buildSummary(a, b, [
      meeting(0, 30, 37.5445, 127.0557),   // 성수
      meeting(40, 70, 37.5563, 126.9236),  // 홍대
      meeting(80, 110, 37.5446, 127.0558), // 성수 — 몇십 미터 차이는 같은 자리로 본다
    ]);
    expect(s.favourite?.count).toBe(2);
    expect(s.favourite?.lat).toBeCloseTo(37.5445, 3);
  });

  it("같은 자리 판정은 거리로 한다 — 좌표가 정확히 같을 필요는 없다", () => {
    const s = buildSummary(a, b, [
      meeting(0, 30, 37.5, 127.0),
      meeting(40, 70, 37.5, 127.0001), // 약 9m
    ]);
    expect(s.favourite?.count).toBe(2);
  });

  it("멀리 떨어진 만남은 따로 센다", () => {
    const s = buildSummary(a, b, [
      meeting(0, 30, 37.5, 127.0),
      meeting(40, 70, 35.1, 129.0), // 부산
    ]);
    expect(s.favourite?.count).toBe(1);
  });

  it("가장 멀리 떨어졌던 순간을 찾는다", () => {
    const near = stay(0, 60, 37.5, 127.0);
    const far = [...stay(0, 30, 37.5, 127.0), ...stay(35, 60, 35.1796, 129.0756)];
    const s = buildSummary(near, far, []);
    expect(s.farthest?.meters).toBeGreaterThan(300_000);
    expect(s.farthest?.at).toBeGreaterThan(T0 + 30 * MIN);
  });

  it("만남이 없으면 favourite는 null이고 나머지는 0", () => {
    const s = buildSummary(a, b, []);
    expect(s.meetCount).toBe(0);
    expect(s.totalTogetherMs).toBe(0);
    expect(s.favourite).toBeNull();
  });

  it("겹치는 기록이 없으면 farthest는 null — 모르는 것을 지어내지 않는다", () => {
    const s = buildSummary(stay(0, 30, 37.5, 127), stay(600, 660, 37.5, 127), []);
    expect(s.farthest).toBeNull();
  });

  it("한쪽이 비어도 터지지 않는다", () => {
    const s = buildSummary([], b, []);
    expect(s.meetCount).toBe(0);
    expect(s.farthest).toBeNull();
  });

  it("기록 구간이 끝나면 알 수 없는 자리를 지어내지 않는다", () => {
    // A: 0~120분 연속 기록, 서울
    const a = stay(0, 120, 37.5, 127.0);
    // B: 0~30분 부산, 35~65분 빈 구간(>30분), 70~120분 서울
    const b = [...stay(0, 30, 35.1, 129.0), ...stay(70, 120, 37.5, 127.0)];
    const s = buildSummary(a, b, []);
    // 알려진 구간에선 최대 서울↔부산 거리(~300km)이어야 한다
    // (null guard가 없으면 빈 구간의 셀이 {lat:0, lon:0}으로 계산돼 ~9700km가 나온다)
    expect(s.farthest?.meters).toBeLessThan(400_000);
  });

  it("같은 거리의 두 순간은 먼저 나온 것을 보고한다", () => {
    // 두 시점 모두 같은 거리 떨어져 있도록 설계
    // 격자 크기가 5분이므로, 정확히 같은 거리를 만들려면 같은 좌표 쌍을 반복
    const a1 = stay(0, 20, 37.5, 127.0);
    const a2 = stay(25, 45, 37.5, 127.0);
    const a = [...a1, ...a2];

    const b1 = stay(0, 20, 37.6, 127.1);
    const b2 = stay(25, 45, 37.6, 127.1);
    const b = [...b1, ...b2];

    const s = buildSummary(a, b, []);
    // 둘 다 약 11km 떨어져 있지만, 처음 나오는 시점(0분대)을 보고해야 함
    expect(s.farthest?.at).toBeLessThan(T0 + 25 * MIN);
  });
});
