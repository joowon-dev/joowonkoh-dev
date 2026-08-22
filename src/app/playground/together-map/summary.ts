import { haversineMeters } from "./geo";
import { GRID_MS, MAX_GAP_MS, overlapRange, resample, type Meeting } from "./meet";
import type { RawPoint } from "./parse";

export interface Summary {
  meetCount: number;
  totalTogetherMs: number;
  favourite: { lat: number; lon: number; count: number } | null;
  farthest: { meters: number; at: number } | null;
}

/**
 * 같은 자리로 볼 반경(m).
 *
 * 좌표가 정확히 같기를 기대하면 안 된다. 같은 카페를 열 번 가도 GPS가 매번
 * 몇십 미터씩 다른 자리를 찍어서, 좌표를 키로 세면 «가장 자주 간 곳»이
 * 전부 1회로 흩어진다.
 */
const SAME_PLACE_M = 300;

/**
 * 만남들을 자리별로 묶어 가장 잦은 곳을 찾는다.
 *
 * 클러스터링을 제대로 하지 않고 «먼저 나온 것을 중심으로 반경 안을 흡수»하는
 * 단순한 방법을 쓴다. 만남이 많아야 수십 건이라 이걸로 충분하고,
 * k-means 같은 것을 얹으면 결과가 실행마다 달라져서 오히려 나쁘다.
 */
function favouritePlace(meetings: Meeting[]): Summary["favourite"] {
  if (meetings.length === 0) return null;

  const clusters: { lat: number; lon: number; count: number }[] = [];
  for (const m of meetings) {
    const hit = clusters.find((c) => haversineMeters(c, m) <= SAME_PLACE_M);
    if (hit) {
      hit.count += 1;
    } else {
      clusters.push({ lat: m.lat, lon: m.lon, count: 1 });
    }
  }

  return clusters.reduce((best, c) => (c.count > best.count ? c : best));
}

/**
 * 두 사람이 가장 멀리 떨어져 있던 순간.
 *
 * 만남 검출과 같은 격자를 쓴다. 한쪽이라도 «모르는 구간»이면 건너뛴다 —
 * 기록이 없는 동안을 «멀리 떨어져 있었다»로 세면 안 된다.
 */
function farthestMoment(a: RawPoint[], b: RawPoint[]): Summary["farthest"] {
  const range = overlapRange(a, b);
  if (!range) return null;

  const gridA = resample(a, range.from, range.to, GRID_MS, MAX_GAP_MS);
  const gridB = resample(b, range.from, range.to, GRID_MS, MAX_GAP_MS);

  let best: { meters: number; at: number } | null = null;
  for (let i = 0; i < gridA.length; i += 1) {
    const pa = gridA[i];
    const pb = gridB[i];
    if (pa === null || pb === null) continue;

    const meters = haversineMeters(pa, pb);
    if (best === null || meters > best.meters) {
      best = { meters, at: range.from + i * GRID_MS };
    }
  }
  return best;
}

export function buildSummary(a: RawPoint[], b: RawPoint[], meetings: Meeting[]): Summary {
  return {
    meetCount: meetings.length,
    totalTogetherMs: meetings.reduce((sum, m) => sum + (m.end - m.start), 0),
    favourite: favouritePlace(meetings),
    farthest: farthestMoment(a, b),
  };
}
