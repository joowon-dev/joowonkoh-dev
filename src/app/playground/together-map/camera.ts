import { projectMercator, unprojectMercator, type LatLon } from "./geo";

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

/** 화면이 보고 있는 곳. zoom은 타일 z 레벨이고 소수를 허용한다. */
export interface View {
  centerLat: number;
  centerLon: number;
  zoom: number;
}

export type CameraMode = "fixed" | "steady" | "dynamic";

/** 래스터 타일 한 장의 변(px). 표준값이다. */
export const TILE_SIZE = 256;

const MIN_ZOOM = 1;
/** 타일 서버가 대개 여기까지만 준다. 더 당겨도 빈 타일이 온다. */
const MAX_ZOOM = 19;

/** 사각형이 완전히 납작해지면 줌이 무한대가 된다. 최소한 이만큼은 벌려 둔다. */
const MIN_SPAN_DEG = 0.002;

export const DAMPING = {
  steady: 0.06,
  dynamic: 0.16,
} as const;

export function boundsOf(points: LatLon[]): Bounds | null {
  if (points.length === 0) return null;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
  }

  // 주의: 자오선을 넘어가는 경로(예: 도쿄-호놀룰루)는 처리하지 않는다.
  // 이 경우 경도를 단순 min/max로만 구하면 약 298° 폭의 상자가 되어
  // 실제는 약 61.5°인 올바른 범위보다 훨씬 크게 줌 아웃되고 중심이 밀린다.
  // 한반도 중심 도구에서는 이 제약을 수용할 수 있다.

  return { minLat, maxLat, minLon, maxLon };
}

export function padBounds(b: Bounds, ratio: number): Bounds {
  const latSpan = Math.max(b.maxLat - b.minLat, MIN_SPAN_DEG);
  const lonSpan = Math.max(b.maxLon - b.minLon, MIN_SPAN_DEG);
  const latPad = latSpan * ratio + (latSpan - (b.maxLat - b.minLat)) / 2;
  const lonPad = lonSpan * ratio + (lonSpan - (b.maxLon - b.minLon)) / 2;

  return {
    minLat: b.minLat - latPad,
    maxLat: b.maxLat + latPad,
    minLon: b.minLon - lonPad,
    maxLon: b.maxLon + lonPad,
  };
}

/**
 * 사각형이 화면에 다 들어오는 시야를 구한다.
 *
 * 가로와 세로 중 더 빡빡한 쪽에 맞춘다. 넉넉한 쪽에 맞추면 반대편이 잘린다.
 */
export function fitView(b: Bounds, w: number, h: number, paddingPx: number): View {
  const topLeft = projectMercator({ lat: b.maxLat, lon: b.minLon });
  const bottomRight = projectMercator({ lat: b.minLat, lon: b.maxLon });

  const dx = Math.max(1e-9, bottomRight.x - topLeft.x);
  const dy = Math.max(1e-9, bottomRight.y - topLeft.y);

  const usableW = Math.max(1, w - paddingPx * 2);
  const usableH = Math.max(1, h - paddingPx * 2);

  const zoomX = Math.log2(usableW / (TILE_SIZE * dx));
  const zoomY = Math.log2(usableH / (TILE_SIZE * dy));
  const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zoomX, zoomY)));

  // 중심은 위경도 평균이 아니라 메르카토르 평면의 가운데다.
  // 위도가 높을수록 위아래 간격이 비선형이라 평균을 쓰면 중심이 밀린다.
  const center = unprojectMercator((topLeft.x + bottomRight.x) / 2, (topLeft.y + bottomRight.y) / 2);

  return { centerLat: center.lat, centerLon: center.lon, zoom };
}

/** 현재 시야를 목표 쪽으로 한 걸음 당긴다. damping이 1이면 한 번에 붙는다. */
export function stepCamera(current: View, target: View, damping: number): View {
  if (damping === 1) return { ...target };
  const f = Math.max(0, Math.min(1, damping));
  return {
    centerLat: current.centerLat + (target.centerLat - current.centerLat) * f,
    centerLon: current.centerLon + (target.centerLon - current.centerLon) * f,
    zoom: current.zoom + (target.zoom - current.zoom) * f,
  };
}
