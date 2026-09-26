import { describe, expect, it } from "vitest";
import games from "../kbo-race/data/games.json";
import log from "./data/days.json";
import type { Day } from "../kbo-race/standings.mjs";
import { buildLog, type LogDay } from "./log.mjs";

const F = buildLog(log.days as LogDay[], games.days as Day[], games.through);
const at = (d: string) => F.find((f) => f.d === d)!;

describe("부캉이 기록", () => {
  it("첫 발견일(9월 18일)부터 하루도 빠짐없이 이어진다", () => {
    expect(F[0].d).toBe("20260918");
    for (let i = 1; i < F.length; i++) {
      const [a, b] = [F[i - 1].d, F[i].d].map((d) => Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6)));
      expect(b - a).toBe(86_400_000);
    }
    expect(F.at(-1)!.d).toBe(log.through);
  });

  it("19~25일 방문객을 더하면 보도된 누적 32만 명이 된다", () => {
    expect(at("20260925").cum).toBe(322_800);
  });

  // 스타뉴스 2026-09-24: 18~23일 5연승, 5경기 43득점, 58승 2무 71패 8위.
  it("롯데 연승·득점·순위가 기사와 같다", () => {
    const run = F.filter((f) => f.d <= "20260923" && f.game).map((f) => f.game!);
    expect(run.map((g) => g.res).join("")).toBe("WWWWW");
    expect(run.reduce((n, g) => n + g.us, 0)).toBe(43);
    expect(at("20260923")).toMatchObject({ streak: 5, rank: 8, wl: "58승 2무 71패" });
    expect(at("20260924").streak).toBe(6);   // 노컷뉴스: LG 꺾고 6연승
    expect(at("20260921").game).toBeNull();  // 월요일은 경기가 없다
    expect(at("20260921").streak).toBe(3);
    expect(at("20260926")).toMatchObject({ game: null, streak: 6 });   // 기록 대기 중이어도 마지막 연승을 보여 준다
  });
});
