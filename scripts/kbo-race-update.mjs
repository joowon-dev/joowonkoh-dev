// KBO 순위 레이스(/playground/kbo-race) 데이터를 오늘까지 채운다.
//
//   npm run kbo:update                  이어서 받기 — 마지막으로 받은 날부터 오늘(KST)까지
//   npm run kbo:update -- --season 2027 새 시즌을 처음부터 받기(3월 1일부터 훑는다)
//
// KBO 기록실 화면이 쓰는 API(GetKboGameList)를 날짜마다 부른다. 남기는 건
// **끝난 정규시즌 경기**뿐이다 — 우천 취소·서스펜디드·시범경기·포스트시즌은 뺀다.
// 오늘 경기가 아직 안 끝났으면 오늘은 빈 날로 넘어가고, 다음에 돌릴 때 다시 받는다
// (마지막으로 받은 날부터 다시 훑기 때문이다).
//
// 끝나면 마지막 날 순위를 찍는다. 공식 순위표와 한 번 맞춰 볼 것:
//   https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildFrames } from "../src/app/playground/kbo-race/standings.mjs";

const FILE = fileURLToPath(new URL("../src/app/playground/kbo-race/data/games.json", import.meta.url));
const API = "https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList";

const argSeason = (() => {
  const i = process.argv.indexOf("--season");
  return i > 0 ? Number(process.argv[i + 1]) : null;
})();

/** 한국 시간 기준 오늘 "YYYYMMDD" */
function todayKst() {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  return kst.toISOString().slice(0, 10).replaceAll("-", "");
}
const toDate = (s) => new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
const toStr = (d) => d.toISOString().slice(0, 10).replaceAll("-", "");

async function gamesOn(date) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          Referer: "https://www.koreabaseball.com/Schedule/Schedule.aspx",
          "User-Agent": "Mozilla/5.0",
        },
        body: `leId=1&srId=0,1,3,4,5,7,9&date=${date}`,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { game = [] } = await res.json();
      return game
        .filter((x) => x.SR_ID === 0 && x.GAME_STATE_SC === "3" && x.CANCEL_SC_ID === "0")
        .map((x) => [x.AWAY_ID, Number(x.T_SCORE_CN), x.HOME_ID, Number(x.B_SCORE_CN)]);
    } catch (err) {
      if (attempt >= 3) throw new Error(`${date} 받기 실패: ${err.message}`);
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
}

const saved = JSON.parse(await readFile(FILE, "utf8"));
const today = todayKst();
const fresh = argSeason && argSeason !== saved.season;
const season = fresh ? argSeason : saved.season;
if (!fresh && today.slice(0, 4) !== String(season)) {
  console.log(`저장된 시즌은 ${season}년이다. 새 시즌이면 --season ${today.slice(0, 4)} 을 붙인다.`);
}
const lastOfSeason = `${season}1130`;
const end = today < lastOfSeason ? today : lastOfSeason;
const start = fresh ? `${season}0301` : saved.through;

const dates = [];
for (let d = toDate(start); toStr(d) <= end; d.setUTCDate(d.getUTCDate() + 1)) dates.push(toStr(d));

const got = new Map();
for (let i = 0; i < dates.length; i += 6) {
  const chunk = dates.slice(i, i + 6);
  const results = await Promise.all(chunk.map(gamesOn));
  chunk.forEach((d, k) => got.set(d, results[k]));
}

const kept = fresh ? [] : saved.days.filter((day) => day.d < start);
const added = dates.filter((d) => got.get(d).length).map((d) => ({ d, g: got.get(d) }));
const days = [...kept, ...added];

// 한 날짜에 한 줄씩 — 다음 갱신 때 diff가 날짜 단위로 읽힌다.
const body = [
  "{",
  `  "season": ${season},`,
  `  "through": "${end}",`,
  '  "days": [',
  days.map((d) => `    ${JSON.stringify(d)}`).join(",\n"),
  "  ]",
  "}",
  "",
].join("\n");
await writeFile(FILE, body);

const frames = buildFrames(days);
const games = days.reduce((n, d) => n + d.g.length, 0);
console.log(`${start} ~ ${end} 훑음 · 경기가 있던 날 ${added.length}일 새로 받음`);
console.log(`시즌 ${season}: 경기일 ${days.length}일 · 정규시즌 ${games}경기 · 마지막 경기 ${days.at(-1)?.d ?? "없음"}`);
if (frames.length) {
  for (const [t, r, w, l, dr, gb] of frames.at(-1).s) {
    console.log(`  ${String(r).padStart(2)}위 ${t.padEnd(2)}  ${w}-${l}-${dr}  ${gb === 0 ? "-" : gb}`);
  }
}
