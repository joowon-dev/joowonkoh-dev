import { TILE_SIZE, type View } from "./camera";
import { projectMercator, type LatLon } from "./geo";
import type { Meeting } from "./meet";
import type { RawPoint } from "./parse";

export interface Size {
  w: number;
  h: number;
}

export interface Screen {
  x: number;
  y: number;
}

/** 화면에 남기는 꼬리 길이. 전체를 계속 그리면 곧 실뭉치가 된다. */
export const TAIL_MS = 6 * 3_600_000;

/** 링이 퍼졌다가 잦아드는 데 걸리는 시간. */
const PULSE_MS = 20 * 60_000;

export function viewToScreen(p: LatLon, view: View, size: Size): Screen {
  const worldPx = TILE_SIZE * 2 ** view.zoom;
  const here = projectMercator(p);
  const center = projectMercator({ lat: view.centerLat, lon: view.centerLon });

  return {
    x: (here.x - center.x) * worldPx + size.w / 2,
    y: (here.y - center.y) * worldPx + size.h / 2,
  };
}

/**
 * 지금 그려야 할 꼬리를 조각들로 나눠 준다.
 *
 * 하나의 이어진 선으로 주지 않는다. 기록이 비는 구간을 이으면 화면을 가로지르는
 * 직선이 생기고, 그건 실제로 가지 않은 길이다. 조각마다 따로 그린다.
 */
export function tailSegments(
  points: RawPoint[],
  now: number,
  tailMs: number,
  maxGapMs: number,
): LatLon[][] {
  const from = now - tailMs;
  const segments: LatLon[][] = [];
  let current: LatLon[] = [];
  let prevT = -Infinity;

  for (const p of points) {
    if (p.t < from) continue;
    if (p.t > now) break;

    if (current.length > 0 && p.t - prevT > maxGapMs) {
      segments.push(current);
      current = [];
    }
    current.push({ lat: p.lat, lon: p.lon });
    prevT = p.t;
  }
  if (current.length > 0) segments.push(current);

  return segments;
}

/**
 * 만남 링의 세기. 시작 순간 1이고 서서히 0으로 잦아든다.
 * 만남이 끝난 뒤에도 잔상이 남게 두지 않는다 — 끝난 만남이 계속 빛나면
 * 지금 만나고 있는 것과 구분이 안 된다.
 */
export function meetingPulse(meeting: Meeting, now: number): number {
  if (now < meeting.start || now > meeting.end) return 0;
  const age = now - meeting.start;
  return Math.max(0, 1 - age / PULSE_MS);
}

/**
 * 실제 거리(m)를 화면 픽셀로 바꾼다. 집 주변 가리기 반경을 그릴 때 쓴다.
 * 메르카토르는 위도가 높을수록 늘어나므로 cos(위도)로 보정한다.
 */
export function blurRadiusScreen(radiusM: number, lat: number, view: View): number {
  const worldPx = TILE_SIZE * 2 ** view.zoom;
  const metersPerWorldUnit = 40_075_016.686 * Math.cos((lat * Math.PI) / 180);
  return (radiusM / metersPerWorldUnit) * worldPx;
}
