import { haversineMeters, lerpLatLon, type LatLon } from "./geo";
import type { RawPoint } from "./parse";

export interface Meeting {
  start: number;
  end: number;
  /** 구간의 대표 위치. 평균이 아니라 중앙값이다. */
  lat: number;
  lon: number;
  /** 구간 중 가장 가까웠던 거리(m). */
  minDistance: number;
}

export interface MeetOptions {
  radiusM: number;
  minDurationMs: number;
}

/** 두 사람을 같은 시각에 놓고 비교하기 위한 격자 간격. */
export const GRID_MS = 5 * 60_000;

/**
 * 이보다 오래 기록이 비면 그 사이는 «위치를 모르는 구간»으로 둔다.
 *
 * 이 도구에서 제일 위험한 버그를 막는 값이다. 구멍을 건너뛰며 보간하면
 * 서울에서 부산까지 직선이 그어지고, 그 선이 상대 궤적을 스쳐 지나가면서
 * 있지도 않은 만남이 만들어진다.
 */
export const MAX_GAP_MS = 30 * 60_000;

export const DEFAULT_MEET_RADIUS_M = 100;
export const DEFAULT_MEET_MIN_MS = 15 * 60_000;

/**
 * 점 목록을 고른 간격의 격자에 올린다.
 * 아는 구간은 보간해서 채우고, 모르는 구간은 null로 비운다.
 */
export function resample(
  points: RawPoint[],
  from: number,
  to: number,
  stepMs: number,
  maxGapMs: number,
): (LatLon | null)[] {
  const count = Math.floor((to - from) / stepMs) + 1;
  const out: (LatLon | null)[] = new Array(count).fill(null);
  if (points.length === 0) return out;

  let cursor = 0;
  for (let i = 0; i < count; i += 1) {
    const t = from + i * stepMs;

    // 이 시각을 감싸는 두 점을 찾는다. 입력이 정렬돼 있으므로 앞으로만 간다.
    //
    // 비교가 <= 여야 한다. < 로 두면 격자 시각이 점의 시각과 정확히 같을 때
    // 커서가 그 점에 닿지 못하고, 마지막 칸이 «구멍»으로 오인돼 항상 비어 버린다.
    while (cursor < points.length - 1 && points[cursor + 1].t <= t) cursor += 1;

    const prev = points[cursor];
    const next = points[cursor + 1];

    if (prev.t === t) {
      out[i] = { lat: prev.lat, lon: prev.lon };
      continue;
    }

    // 머문 구간 안이면 그 자리다. 구글이 «여기 있었다»고 적어 둔 시간이라
    // 추측이 아니라 기록이다. 구멍 검사에 걸리기 전에 먼저 확인한다.
    if (prev.until !== undefined && t >= prev.t && t <= prev.until) {
      out[i] = { lat: prev.lat, lon: prev.lon };
      continue;
    }

    if (t < prev.t || next === undefined) continue; // 기록 범위 밖
    if (next.t - prev.t > maxGapMs) continue; // 구멍 — 잇지 않는다

    const f = (t - prev.t) / (next.t - prev.t);
    out[i] = lerpLatLon(prev, next, f);
  }

  return out;
}

/**
 * 마지막 점이 «언제까지 아는지»를 돌려준다. 방문 점은 시작 시각 하나만으로
 * 배열에 들어가 있어도 until까지는 위치를 안다 — 카페에 두 시간 앉아 있었다면
 * 점은 하나뿐이지만 아는 범위는 그 두 시간 전부다.
 */
function knownEnd(p: RawPoint): number {
  return p.until !== undefined && p.until > p.t ? p.until : p.t;
}

/** 두 사람의 기록이 모두 존재하는 기간. */
export function overlapRange(a: RawPoint[], b: RawPoint[]): { from: number; to: number } | null {
  if (a.length === 0 || b.length === 0) return null;
  const from = Math.max(a[0].t, b[0].t);
  const to = Math.min(knownEnd(a[a.length - 1]), knownEnd(b[b.length - 1]));
  return from <= to ? { from, to } : null;
}

function median(values: number[]): number {
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * 두 사람이 가까이 있었던 구간들을 찾는다.
 *
 * 공통 격자에 올려놓고 거리를 잰 뒤, 판정 거리 안에 든 칸이 최소 지속시간만큼
 * 이어지면 만남 하나로 센다. 한쪽이라도 null인 칸은 «가깝지 않다»가 아니라
 * «모른다»여서 구간을 끊는다.
 */
export function findMeetings(a: RawPoint[], b: RawPoint[], opts: MeetOptions): Meeting[] {
  const range = overlapRange(a, b);
  if (!range) return [];

  const gridA = resample(a, range.from, range.to, GRID_MS, MAX_GAP_MS);
  const gridB = resample(b, range.from, range.to, GRID_MS, MAX_GAP_MS);

  const meetings: Meeting[] = [];
  let runStart = -1;
  let lats: number[] = [];
  let lons: number[] = [];
  let closest = Infinity;

  const close = (endIndex: number) => {
    if (runStart < 0) return;
    const start = range.from + runStart * GRID_MS;
    const end = range.from + endIndex * GRID_MS;
    if (end - start >= opts.minDurationMs) {
      meetings.push({ start, end, lat: median(lats), lon: median(lons), minDistance: closest });
    }
    runStart = -1;
    lats = [];
    lons = [];
    closest = Infinity;
  };

  for (let i = 0; i < gridA.length; i += 1) {
    const pa = gridA[i];
    const pb = gridB[i];
    const near = pa !== null && pb !== null && haversineMeters(pa, pb) <= opts.radiusM;

    if (near) {
      if (runStart < 0) runStart = i;
      const d = haversineMeters(pa!, pb!);
      if (d < closest) closest = d;
      // 대표 위치는 두 사람의 가운데로 잡는다
      lats.push((pa!.lat + pb!.lat) / 2);
      lons.push((pa!.lon + pb!.lon) / 2);
    } else {
      close(i - 1);
    }
  }
  close(gridA.length - 1);

  return meetings;
}
