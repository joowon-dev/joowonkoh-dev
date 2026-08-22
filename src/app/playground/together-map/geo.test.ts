import { describe, expect, it } from "vitest";
import {
  haversineMeters,
  lerpLatLon,
  projectMercator,
  unprojectMercator,
  type LatLon,
} from "./geo";

const SEOUL: LatLon = { lat: 37.5665, lon: 126.978 };
const BUSAN: LatLon = { lat: 35.1796, lon: 129.0756 };

describe("haversineMeters", () => {
  it("같은 점은 0", () => {
    expect(haversineMeters(SEOUL, SEOUL)).toBe(0);
  });

  it("서울-부산이 실제 직선거리(약 325km) 근처로 나온다", () => {
    const d = haversineMeters(SEOUL, BUSAN);
    expect(d).toBeGreaterThan(320_000);
    expect(d).toBeLessThan(330_000);
  });

  it("위도 1도는 약 111km", () => {
    const d = haversineMeters({ lat: 0, lon: 0 }, { lat: 1, lon: 0 });
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it("방향이 바뀌어도 같다", () => {
    expect(haversineMeters(SEOUL, BUSAN)).toBeCloseTo(haversineMeters(BUSAN, SEOUL), 6);
  });
});

describe("projectMercator", () => {
  it("경위도 0,0은 정중앙", () => {
    const p = projectMercator({ lat: 0, lon: 0 });
    expect(p.x).toBeCloseTo(0.5, 10);
    expect(p.y).toBeCloseTo(0.5, 10);
  });

  it("동쪽으로 갈수록 x가 커지고, 북쪽으로 갈수록 y가 작아진다", () => {
    const a = projectMercator({ lat: 0, lon: 0 });
    const b = projectMercator({ lat: 10, lon: 10 });
    expect(b.x).toBeGreaterThan(a.x);
    expect(b.y).toBeLessThan(a.y);
  });

  it("왕복하면 제자리", () => {
    const p = projectMercator(SEOUL);
    const back = unprojectMercator(p.x, p.y);
    expect(back.lat).toBeCloseTo(SEOUL.lat, 9);
    expect(back.lon).toBeCloseTo(SEOUL.lon, 9);
  });

  it("극단 위도는 잘라낸다 — 메르카토르는 극에서 발산한다", () => {
    const p = projectMercator({ lat: 89.9999, lon: 0 });
    expect(Number.isFinite(p.y)).toBe(true);
    expect(p.y).toBeGreaterThanOrEqual(0);
  });
});

describe("lerpLatLon", () => {
  it("f=0이면 a, f=1이면 b", () => {
    expect(lerpLatLon(SEOUL, BUSAN, 0)).toEqual(SEOUL);
    expect(lerpLatLon(SEOUL, BUSAN, 1)).toEqual(BUSAN);
  });

  it("f=0.5면 중간", () => {
    const mid = lerpLatLon(SEOUL, BUSAN, 0.5);
    expect(mid.lat).toBeCloseTo((SEOUL.lat + BUSAN.lat) / 2, 9);
    expect(mid.lon).toBeCloseTo((SEOUL.lon + BUSAN.lon) / 2, 9);
  });
});
