"use client";

import Link from "next/link";
import { useCallback } from "react";
import games from "./data/games.json";
import { buildFrames, type Day } from "./standings.mjs";
import { mountRace } from "./race.js";
import "./kbo-race.css";

// 경기 결과는 빌드 때 이미 들어와 있다. 순위 계산은 144일 × 10팀이라 한 번 돌리면 끝이다.
const FRAMES = buildFrames(games.days as Day[]);
const FIRST = FRAMES[0]?.d ?? "";
const LAST = FRAMES.at(-1)?.d ?? "";
const GAME_COUNT = games.days.reduce((n, d) => n + d.g.length, 0);
const md = (d: string) => `${+d.slice(4, 6)}월 ${+d.slice(6, 8)}일`;

export default function KboRace() {
  // React 19의 ref 콜백은 정리 함수를 돌려줄 수 있다 — rAF와 리스너를 여기서 걷는다.
  const attach = useCallback((root: HTMLDivElement | null) => {
    if (!root || FRAMES.length === 0) return;
    return mountRace(root, FRAMES);
  }, []);

  return (
    <div className="kbo-race" ref={attach}>
      {/* 사이트 머리글·본문 폭을 덮고 화면 전체를 쓴다. 나갈 길은 이 링크 하나다. */}
      <header className="kr-head">
        <Link href="/playground" className="back">
          ← Playground
        </Link>
        <h1>KBO 순위 레이스</h1>
        <span className="eyebrow">
          {games.season} 정규시즌 · {md(FIRST)} 개막 → {md(LAST)}
        </span>
      </header>

      <section className="park">
        <div className="screen">
          <canvas
            data-k="park"
            role="img"
            aria-label="10개 구단 선수가 홈 유니폼을 입고 한 줄로 달리는 도트 애니메이션. 1위가 맨 앞이고 뒤로 갈수록 게임차만큼 떨어진다."
          />
          <div className="tags" data-k="tags" aria-hidden="true" />
          <div className="banner" data-k="banner" role="status" hidden />
        </div>
      </section>

      <div className="controls">
        <button className="btn play" data-k="play" type="button">
          일시정지
        </button>
        <input data-k="scrub" id="kbo-race-scrub" type="range" min="0" max="0" defaultValue="0" aria-label="날짜 이동" />
        <div className="speed" role="group" aria-label="재생 속도">
          <button className="btn" type="button" data-speed="1" aria-pressed="true">1x</button>
          <button className="btn" type="button" data-speed="2" aria-pressed="false">2x</button>
          <button className="btn" type="button" data-speed="4" aria-pressed="false">4x</button>
        </div>
        <span className="count" data-k="count" />
      </div>

      <section className="lower">
        <aside className="board" aria-label="그날의 순위표">
          <div className="board-head">
            <span className="board-date" data-k="date" />
            <span className="board-day" data-k="dow" />
          </div>
          <div className="cols">
            <span>#</span><span /><span>팀</span><span>승-패-무</span><span>승률</span><span>차</span><span />
          </div>
          <div className="rows" data-k="rows" />
          <div className="games">
            <h2>이날 경기</h2>
            <ul className="game-list" data-k="games" />
          </div>
        </aside>

        <section className="chart">
          <div className="chart-top">
            <h2>날짜별 순위</h2>
            <span className="chart-note" data-k="chart-note">
              순위표에서 팀을 누르면 그 팀 줄을 따라 볼 수 있다
            </span>
          </div>
          <div className="chart-box">
            <div className="chart-inner">
              <canvas data-k="bump" width="306" height="104" role="img" aria-label="개막일부터 오늘까지 10개 구단 순위 변화 그래프" />
              <div className="months" data-k="months" />
            </div>
          </div>
        </section>
      </section>

      <p className="lede">
        열 개 구단 선수가 홈 유니폼을 입고 한 줄로 달린다. 맨 앞이 1위이고{" "}
        <b>앞사람과 벌어진 거리가 그날의 실제 게임차</b>다. 이름표에는 순위와 팀
        이름이 붙어 있고, 순위표와 그래프는 경기가 열린 날마다 바뀐다.
        끝까지 가면 개막일로 돌아가 다시 달린다.
      </p>
      <p className="source">
        자료: KBO 공식 기록실(koreabaseball.com) 정규시즌 {GAME_COUNT}경기 결과로 계산. {md(LAST)}까지.
        승률은 무승부를 뺀 승÷(승+패).
      </p>
    </div>
  );
}
