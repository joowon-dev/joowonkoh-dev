// 날짜별 부캉이 기록 + 그날 롯데 경기 → 화면이 한 장씩 넘기는 하루치 기록.
//
// 롯데 결과는 따로 적지 않고 KBO 순위 레이스의 경기 기록에서 읽는다 — 그쪽을
// `npm run kbo:update` 로 채우면 여기도 같이 채워진다.

import { buildFrames } from "../kbo-race/standings.mjs";

const LT = "LT";

/**
 * @typedef {{ d: string, v: number | null, ev: string[], toast?: string, moon?: boolean, rain?: boolean }} LogDay
 * @typedef {{ opp: string, us: number, them: number, res: "W" | "L" | "D", home: boolean }} Game
 * @typedef {{
 *   d: string, stay: number, v: number | null, crowd: number, cum: number,
 *   ev: string[], toast: string | null, moon: boolean, rain: boolean,
 *   game: Game | null, played: boolean, streak: number, rank: number | null, wl: string | null,
 * }} Frame
 *   game = 그날 롯데 경기(없으면 null). played = 그날까지 경기 기록을 받아 두었는지.
 *   streak = 그날까지(모르면 마지막으로 아는 날까지)의 연승(연패는 음수). crowd = 그림에 쓸 인파(집계 없는 날은 앞날 값).
 */

/** 평소 친수공원 하루 방문객(전남일보 2026-09-22, 부산시설공단). 첫날 인파 그림에 쓴다. */
export const USUAL_VISITORS = 2000;

/**
 * @param {LogDay[]} days 날짜 오름차순
 * @param {import("../kbo-race/standings.mjs").Day[]} gameDays KBO 순위 레이스의 날짜별 경기 결과
 * @param {string} through 경기 결과를 받아 둔 마지막 날
 * @returns {Frame[]}
 */
export function buildLog(days, gameDays, through) {
  // 날짜마다 롯데 경기와 그날 끝난 뒤의 연승·순위
  const byDate = new Map();
  let streak = 0;
  const standings = buildFrames(gameDays);
  gameDays.forEach(({ d, g }, i) => {
    let game = null;
    for (const [a, sa, h, sh] of g) {
      if (a !== LT && h !== LT) continue;
      const home = h === LT;
      const us = home ? sh : sa, them = home ? sa : sh;
      const res = us > them ? "W" : us < them ? "L" : "D";
      game = { opp: home ? a : h, us, them, res, home };
      if (res === "W") streak = streak > 0 ? streak + 1 : 1;
      else if (res === "L") streak = streak < 0 ? streak - 1 : -1;
    }
    const row = standings[i].s.find((r) => r[0] === LT);
    byDate.set(d, { game, streak, rank: row[1], wl: `${row[2]}승 ${row[4]}무 ${row[3]}패` });
  });

  let cum = 0, crowd = USUAL_VISITORS, last = { streak: 0, rank: null, wl: null };
  return days.map((day, i) => {
    if (day.v != null) { cum += day.v; crowd = day.v; }
    const played = day.d <= through;
    // 경기가 없던 날(월요일·우천)은 앞의 연승·순위를 이어 쓴다
    const k = byDate.get(day.d);
    if (k) last = k;
    else for (const [d, v] of byDate) if (d <= day.d) last = v;
    return {
      d: day.d,
      stay: i + 1,
      v: day.v,
      crowd,
      cum,
      ev: day.ev,
      toast: day.toast ?? null,
      moon: !!day.moon,
      rain: !!day.rain,
      game: k?.game ?? null,
      played,
      // 그날 경기가 아직 안 들어왔어도 순위·연승은 마지막으로 아는 값을 보여 준다
      streak: last.streak,
      rank: last.rank,
      wl: last.wl,
    };
  });
}
