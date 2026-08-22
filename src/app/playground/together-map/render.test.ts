import { describe, expect, it } from "vitest";
import type { View } from "./camera";
import type { RawPoint } from "./parse";
import { meetingPulse, tailSegments, viewToScreen } from "./render";

const VIEW: View = { centerLat: 37.5, centerLon: 127.0, zoom: 12 };
const SIZE = { w: 1080, h: 1080 };
const T0 = Date.parse("2026-01-01T00:00:00Z");
const MIN = 60_000;

function p(minute: number, lat: number, lon: number): RawPoint {
  return { t: T0 + minute * MIN, lat, lon, kind: "path" };
}

describe("viewToScreen", () => {
  it("시야 중심은 화면 한가운데", () => {
    const s = viewToScreen({ lat: VIEW.centerLat, lon: VIEW.centerLon }, VIEW, SIZE);
    expect(s.x).toBeCloseTo(540, 6);
    expect(s.y).toBeCloseTo(540, 6);
  });

  it("동쪽은 오른쪽, 북쪽은 위쪽", () => {
    const east = viewToScreen({ lat: 37.5, lon: 127.1 }, VIEW, SIZE);
    const north = viewToScreen({ lat: 37.6, lon: 127.0 }, VIEW, SIZE);
    expect(east.x).toBeGreaterThan(540);
    expect(north.y).toBeLessThan(540);
  });

  it("줌이 한 단계 오르면 중심에서의 거리가 두 배", () => {
    const at = { lat: 37.52, lon: 127.02 };
    const near = viewToScreen(at, VIEW, SIZE);
    const far = viewToScreen(at, { ...VIEW, zoom: 13 }, SIZE);
    expect(far.x - 540).toBeCloseTo((near.x - 540) * 2, 4);
  });

  it("세로 화면에서도 중심은 가운데", () => {
    const s = viewToScreen({ lat: 37.5, lon: 127.0 }, VIEW, { w: 1080, h: 1920 });
    expect(s.x).toBeCloseTo(540, 6);
    expect(s.y).toBeCloseTo(960, 6);
  });
});

describe("tailSegments", () => {
  it("꼬리 길이 안의 점만 남는다", () => {
    const points = [p(0, 37, 127), p(10, 37, 127), p(20, 37, 127)];
    const segs = tailSegments(points, T0 + 20 * MIN, 15 * MIN, 30 * MIN);
    expect(segs.flat()).toHaveLength(2);
  });

  it("현재 시각보다 미래의 점은 안 나온다", () => {
    const points = [p(0, 37, 127), p(50, 37, 127)];
    const segs = tailSegments(points, T0 + 10 * MIN, 60 * MIN, 30 * MIN);
    expect(segs.flat()).toHaveLength(1);
  });

  it("구멍이 있으면 선을 끊어서 여러 조각으로 준다", () => {
    // 두 점 사이가 60분 — 이으면 없는 길이 그어진다
    const points = [p(0, 37, 127), p(60, 38, 128), p(65, 38, 128)];
    const segs = tailSegments(points, T0 + 65 * MIN, 120 * MIN, 30 * MIN);
    expect(segs).toHaveLength(2);
    expect(segs[0]).toHaveLength(1);
    expect(segs[1]).toHaveLength(2);
  });

  it("점이 없으면 빈 배열", () => {
    expect(tailSegments([], T0, 30 * MIN, 30 * MIN)).toEqual([]);
  });

  it("한 조각도 못 만들면 빈 배열", () => {
    const points = [p(100, 37, 127)];
    expect(tailSegments(points, T0, 30 * MIN, 30 * MIN)).toEqual([]);
  });
});

describe("meetingPulse", () => {
  const meeting = { start: T0, end: T0 + 60 * MIN, lat: 37.5, lon: 127, minDistance: 10 };

  it("시작 직전엔 0", () => {
    expect(meetingPulse(meeting, T0 - MIN)).toBe(0);
  });

  it("시작 순간이 가장 세다", () => {
    expect(meetingPulse(meeting, T0)).toBeCloseTo(1, 6);
  });

  it("시간이 지나면 잦아든다", () => {
    const early = meetingPulse(meeting, T0 + 5 * MIN);
    const late = meetingPulse(meeting, T0 + 30 * MIN);
    expect(late).toBeLessThan(early);
  });

  it("0과 1 사이를 벗어나지 않는다", () => {
    for (let m = -10; m < 120; m += 5) {
      const v = meetingPulse(meeting, T0 + m * MIN);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
