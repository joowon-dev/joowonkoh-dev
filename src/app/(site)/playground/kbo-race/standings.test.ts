import { describe, expect, it } from "vitest";
import games from "./data/games.json";
import { buildFrames, type Day } from "./standings.mjs";

describe("buildFrames", () => {
  it("승·패·무를 세고 무승부는 승률에서 뺀다", () => {
    const [f] = buildFrames([{ d: "20260328", g: [["KT", 5, "LG", 3], ["SS", 2, "HH", 2]] }]);
    const row = (t: string) => f.s.find((r) => r[0] === t)!;
    expect(row("KT").slice(1)).toEqual([1, 1, 0, 0, 0]);
    expect(row("SS").slice(2)).toEqual([0, 0, 1, 0.5]);   // 0승 0패라도 1승 팀과는 0.5게임차
    expect(row("LG")[5]).toBe(1);   // 1승 0패 팀과 1게임차
  });

  it("승률이 같으면 같은 순위를 준다", () => {
    const [f] = buildFrames([{ d: "20260328", g: [["KT", 5, "LG", 3], ["NC", 4, "OB", 1]] }]);
    const ranks = Object.fromEntries(f.s.map((r) => [r[0], r[1]]));
    expect(ranks.KT).toBe(1);
    expect(ranks.NC).toBe(1);
  });

  // 저장된 데이터가 공식 순위표와 맞는지. 2026-09-25 KBO 기록실 팀 순위와 같다.
  it("2026-09-25 순위가 KBO 공식 순위표와 같다", () => {
    const frames = buildFrames(games.days as Day[]);
    const f = frames.find((x) => x.d === "20260925")!;
    expect(f.s.map(([t, r, w, l, d, gb]) => `${r} ${t} ${w}-${l}-${d} ${gb}`)).toEqual([
      "1 KT 80-48-4 0",
      "2 SS 78-52-3 3",
      "3 LG 75-56-1 6.5",
      "4 HT 71-58-2 9.5",
      "5 OB 67-62-5 13.5",
      "6 NC 61-69-2 20",
      "7 LT 59-71-2 22",
      "8 SK 58-71-5 22.5",
      "9 HH 54-75-4 26.5",
      "10 WO 45-86-4 36.5",
    ]);
  });
});
