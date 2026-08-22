export interface LatLon {
  lat: number;
  lon: number;
}

/** WGS84 평균 반지름(m). */
export const EARTH_RADIUS_M = 6371008.8;

/**
 * 두 지점의 대권 거리(m).
 *
 * 평면 근사(위도 1도=111km)를 쓰지 않는다. 이 도구는 100m 안팎을 판정하는데,
 * 위도가 높아질수록 경도 1도의 실제 길이가 줄어서 평면 근사는 서울에서만도
 * 수십 미터씩 어긋난다. 그 오차가 그대로 «만났다/아니다»를 뒤집는다.
 */
export function haversineMeters(a: LatLon, b: LatLon): number {
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLon = (b.lon - a.lon) * toRad;
  const lat1 = a.lat * toRad;
  const lat2 = b.lat * toRad;

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * 메르카토르는 극에서 무한대로 발산한다. 타일 지도가 쓰는 관례대로
 * 남북 85.0511도에서 자른다 — 이 값이 정확히 정사각형 세계를 만든다.
 */
const MAX_LAT = 85.05112878;

/** 경위도 → 정규화 세계 좌표. x, y 모두 0~1이고 y는 북쪽이 0이다. */
export function projectMercator(p: LatLon): { x: number; y: number } {
  const lat = Math.max(-MAX_LAT, Math.min(MAX_LAT, p.lat));
  const s = Math.sin((lat * Math.PI) / 180);
  const y = 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
  return {
    x: (p.lon + 180) / 360,
    y: Math.max(0, Math.min(1, y)),
  };
}

export function unprojectMercator(x: number, y: number): LatLon {
  const n = Math.PI * (1 - 2 * y);
  return {
    lat: (180 / Math.PI) * Math.atan(Math.sinh(n)),
    lon: x * 360 - 180,
  };
}

/**
 * 두 점 사이 선형 보간.
 *
 * 대권 보간(slerp)을 쓰지 않는다. 이 도구가 잇는 두 점은 길어야 몇십 킬로미터라
 * 차이가 화면에서 1픽셀도 안 되고, 대신 계산이 훨씬 싸다.
 */
export function lerpLatLon(a: LatLon, b: LatLon, f: number): LatLon {
  return {
    lat: a.lat + (b.lat - a.lat) * f,
    lon: a.lon + (b.lon - a.lon) * f,
  };
}
