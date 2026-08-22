import { describe, expect, it } from "vitest";
import { DAMPING, boundsOf, fitView, padBounds, stepCamera, type View } from "./camera";

const SEOUL = { lat: 37.5665, lon: 126.978 };
const BUSAN = { lat: 35.1796, lon: 129.0756 };

describe("boundsOf", () => {
  it("점들을 감싸는 사각형", () => {
    expect(boundsOf([SEOUL, BUSAN])).toEqual({
      minLat: 35.1796,
      maxLat: 37.5665,
      minLon: 126.978,
      maxLon: 129.0756,
    });
  });

  it("점 하나면 넓이 0인 사각형", () => {
    const b = boundsOf([SEOUL]);
    expect(b).toEqual({ minLat: 37.5665, maxLat: 37.5665, minLon: 126.978, maxLon: 126.978 });
  });

  it("빈 배열은 null", () => {
    expect(boundsOf([])).toBeNull();
  });
});

describe("padBounds", () => {
  it("사각형을 비율만큼 넓힌다", () => {
    const b = padBounds({ minLat: 0, maxLat: 10, minLon: 0, maxLon: 10 }, 0.1);
    expect(b.minLat).toBeCloseTo(-1, 9);
    expect(b.maxLat).toBeCloseTo(11, 9);
  });

  it("넓이 0인 사각형도 최소 크기를 갖는다 — 안 그러면 줌이 무한대가 된다", () => {
    const b = padBounds({ minLat: 37.5, maxLat: 37.5, minLon: 127, maxLon: 127 }, 0.1);
    expect(b.maxLat).toBeGreaterThan(b.minLat);
    expect(b.maxLon).toBeGreaterThan(b.minLon);
  });
});

describe("fitView", () => {
  it("중심이 사각형 가운데로 온다", () => {
    const view = fitView({ minLat: 35, maxLat: 37, minLon: 126, maxLon: 128 }, 1080, 1080, 40);
    expect(view.centerLon).toBeCloseTo(127, 6);
    expect(view.centerLat).toBeGreaterThan(35);
    expect(view.centerLat).toBeLessThan(37);
  });

  it("좁은 범위일수록 줌이 크다", () => {
    const wide = fitView({ minLat: 30, maxLat: 40, minLon: 120, maxLon: 130 }, 1080, 1080, 40);
    const tight = fitView({ minLat: 37.5, maxLat: 37.6, minLon: 127, maxLon: 127.1 }, 1080, 1080, 40);
    expect(tight.zoom).toBeGreaterThan(wide.zoom);
  });

  it("줌이 유한하고 상식적인 범위에 든다", () => {
    const view = fitView({ minLat: 37.5, maxLat: 37.5001, minLon: 127, maxLon: 127.0001 }, 1080, 1080, 40);
    expect(Number.isFinite(view.zoom)).toBe(true);
    expect(view.zoom).toBeLessThanOrEqual(19);
    expect(view.zoom).toBeGreaterThanOrEqual(1);
  });

  it("세로 화면은 가로 화면보다 줌이 작거나 같다 — 가로 폭이 좁아 더 물러나야 한다", () => {
    const box = { minLat: 37, maxLat: 38, minLon: 126, maxLon: 128 };
    const portrait = fitView(box, 1080, 1920, 40);
    const landscape = fitView(box, 1920, 1080, 40);
    expect(portrait.zoom).toBeLessThanOrEqual(landscape.zoom);
  });
});

describe("stepCamera", () => {
  const from: View = { centerLat: 37, centerLon: 127, zoom: 10 };
  const to: View = { centerLat: 38, centerLon: 128, zoom: 12 };

  it("목표 쪽으로 다가간다", () => {
    const next = stepCamera(from, to, DAMPING.steady);
    expect(next.centerLat).toBeGreaterThan(from.centerLat);
    expect(next.centerLat).toBeLessThan(to.centerLat);
    expect(next.zoom).toBeGreaterThan(from.zoom);
  });

  it("감쇠가 클수록 빨리 붙는다", () => {
    const slow = stepCamera(from, to, DAMPING.steady);
    const fast = stepCamera(from, to, DAMPING.dynamic);
    expect(fast.centerLat).toBeGreaterThan(slow.centerLat);
  });

  it("감쇠 1이면 한 번에 목표", () => {
    expect(stepCamera(from, to, 1)).toEqual(to);
  });

  it("이미 목표면 그대로", () => {
    expect(stepCamera(to, to, DAMPING.steady)).toEqual(to);
  });

  it("역동 모드가 부드러운 모드보다 감쇠가 크다", () => {
    expect(DAMPING.dynamic).toBeGreaterThan(DAMPING.steady);
  });
});
