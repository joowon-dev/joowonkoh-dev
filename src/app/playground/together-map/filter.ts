import { haversineMeters } from "./geo";
import type { RawPoint } from "./parse";

export interface FilterOptions {
  /** 이 값(m)보다 오차가 큰 점을 버린다. */
  accuracyLimitM: number;
  outlier: "conservative" | "off";
}

export const DEFAULT_ACCURACY_LIMIT_M = 200;

/**
 * 이 속도를 넘으면 GPS가 튄 것으로 본다.
 * 여객기 순항속도가 900km/h 언저리라 그 위는 사람이 낼 수 없는 속도다.
 */
export const MAX_PLAUSIBLE_KMH = 900;

function kmh(a: RawPoint, b: RawPoint): number {
  const hours = Math.abs(b.t - a.t) / 3_600_000;
  // 같은 시각의 두 좌표는 깨진 기록이다. 튀어 나간 점이 남으면
  // 거짓 만남을 만들 수 있으므로, 버리는 쪽으로 기울인다.
  if (hours === 0) return Infinity;
  return haversineMeters(a, b) / 1000 / hours;
}

/**
 * 점 목록을 걸러낸다. 정확도 먼저, 이상치 나중이다.
 *
 * 순서가 중요하다. 오차 큰 점을 먼저 치우지 않으면 그 점이 앞뒤 점의 속도를
 * 부풀려서 멀쩡한 점까지 이상치로 몰린다.
 */
export function filterPoints(points: RawPoint[], opts: FilterOptions): RawPoint[] {
  // 1단계 — 정확도. accuracy가 없는 점은 «모름»이지 «부정확»이 아니므로 남긴다.
  const accurate = points.filter(
    (p) => p.accuracy === undefined || p.accuracy <= opts.accuracyLimitM,
  );

  if (opts.outlier === "off" || accurate.length < 3) return accurate;

  // 2단계 — 이상치. 앞에서도 뒤에서도 말이 안 되는 속도로만 닿는 점을 버린다.
  //
  // 한쪽만 보면 안 된다. 실제로 비행기를 탔다면 «직전 점에서 여기까지»가 빠른 게
  // 정상이고, 그 뒤로는 계속 그 자리에 있다. 튄 점은 갔다가 곧바로 돌아온다 —
  // 앞뒤가 둘 다 비현실적인 것은 그 경우뿐이다.
  //
  // 첫 점과 끝 점은 검사하지 않는다. 이것은 의도한 설계다. 비용: 튄 끝점이
  // 만남 감지기에 도달해서 실제가 아닌 만남을 시작할 수 있다. 이 도구가
  // 반드시 피해야 할 실패이므로, 미래의 독자가 이 구멍이 실수가 아니라
  // 의도적임을 알아야 한다.
  return accurate.filter((p, i) => {
    if (i === 0 || i === accurate.length - 1) return true;
    const fromPrev = kmh(accurate[i - 1], p);
    const toNext = kmh(p, accurate[i + 1]);
    return !(fromPrev > MAX_PLAUSIBLE_KMH && toNext > MAX_PLAUSIBLE_KMH);
  });
}
