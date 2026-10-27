// 날짜별 경기 결과 → 날짜별 순위표. 화면(race.js)과 갱신 스크립트가 같이 쓴다.
//
// KBO 순위 규칙 그대로다.
//   승률 = 승 ÷ (승 + 패). 무승부는 분모에서 빠진다.
//   게임차 = ((1위 승 − 팀 승) + (팀 패 − 1위 패)) ÷ 2
//   승률이 같으면 같은 순위(공동)를 준다. 표시 순서는 승이 많은 쪽이 먼저.

/** 구단 코드 — KBO 기록실 API가 쓰는 두 글자 그대로다. */
export const TEAM_CODES = ["LG", "KT", "SK", "NC", "OB", "HT", "LT", "SS", "HH", "WO"];

/**
 * @typedef {[string, number, string, number]} Game  [원정, 원정 점수, 홈, 홈 점수]
 * @typedef {{ d: string, g: Game[] }} Day          d = "YYYYMMDD"
 * @typedef {[string, number, number, number, number, number]} Row  [팀, 순위, 승, 패, 무, 게임차]
 * @typedef {{ d: string, g: Game[], s: Row[] }} Frame
 */

/**
 * @param {Day[]} days 날짜 오름차순
 * @returns {Frame[]}
 */
export function buildFrames(days) {
  /** @type {Record<string, [number, number, number]>} */
  const rec = Object.fromEntries(TEAM_CODES.map((t) => [t, [0, 0, 0]]));
  const pct = (t) => {
    const [w, l] = rec[t];
    return w + l ? w / (w + l) : 0;
  };

  return days.map(({ d, g }) => {
    for (const [a, sa, h, sh] of g) {
      if (sa > sh) { rec[a][0] += 1; rec[h][1] += 1; }
      else if (sh > sa) { rec[h][0] += 1; rec[a][1] += 1; }
      else { rec[a][2] += 1; rec[h][2] += 1; }
    }
    const order = [...TEAM_CODES].sort((x, y) => pct(y) - pct(x) || rec[y][0] - rec[x][0]);
    const [lw, ll] = rec[order[0]];
    let rank = 0;
    let prev = null;
    /** @type {Row[]} */
    const s = order.map((t, i) => {
      const p = Math.round(pct(t) * 1000);
      if (p !== prev) { rank = i + 1; prev = p; }
      const [w, l, dr] = rec[t];
      return [t, rank, w, l, dr, (lw - w + (l - ll)) / 2];
    });
    return { d, g, s };
  });
}
