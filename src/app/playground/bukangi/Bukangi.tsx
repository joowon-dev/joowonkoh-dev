"use client";

import Link from "next/link";
import { useCallback } from "react";
import games from "../kbo-race/data/games.json";
import log from "./data/days.json";
import type { Day } from "../kbo-race/standings.mjs";
import { buildLog, type LogDay } from "./log.mjs";
import { mountLog } from "./scene.js";
import "./bukangi.css";

// 기록과 롯데 경기 결과는 빌드 때 이미 들어와 있다. 하루치 기록을 한 번 만들어 두고 넘기기만 한다.
const FRAMES = buildLog(log.days as LogDay[], games.days as Day[], games.through);
const md = (d: string) => `${+d.slice(4, 6)}월 ${+d.slice(6, 8)}일`;
const FIRST = FRAMES[0]?.d ?? "";
const LAST = FRAMES.at(-1)?.d ?? "";

export default function Bukangi() {
  // React 19의 ref 콜백은 정리 함수를 돌려줄 수 있다 — rAF와 리스너를 여기서 걷는다.
  const attach = useCallback((root: HTMLDivElement | null) => {
    if (!root || FRAMES.length === 0) return;
    return mountLog(root, FRAMES);
  }, []);

  return (
    <div className="bukangi" ref={attach}>
      {/* 사이트 머리글·본문 폭을 덮고 화면 전체를 쓴다. 나갈 길은 이 링크 하나다. */}
      <header className="bk-head">
        <Link href="/playground" className="back">
          ← Playground
        </Link>
        <h1>부캉이의 기록</h1>
        <span className="eyebrow">
          부산 북항 친수공원 · {md(FIRST)} 발견 → {md(LAST)}
        </span>
      </header>

      <section className="park">
        <div className="screen">
          <canvas
            data-k="park"
            role="img"
            aria-label="부산 북항 친수공원 수로를 옆에서 본 도트 애니메이션. 상어 부캉이가 수로를 뱅뱅 돌고, 난간 너머 구경꾼이 날마다 늘어난다."
          />
          <span className="tag" data-k="tag" aria-hidden="true">
            부캉이
          </span>
          <div className="banner" data-k="banner" role="status" hidden />
        </div>

        {/* 재생 조작은 늘 수로 바로 밑. */}
        <div className="controls">
          <button className="btn play" data-k="play" type="button" aria-label="일시정지" />
          <input data-k="scrub" id="bukangi-scrub" type="range" min="0" max="0" defaultValue="0" aria-label="날짜 이동" />
          <div className="speed" role="group" aria-label="재생 속도">
            <button className="btn" type="button" data-speed="1" aria-pressed="true">1x</button>
            <button className="btn" type="button" data-speed="2" aria-pressed="false">2x</button>
            <button className="btn" type="button" data-speed="4" aria-pressed="false">4x</button>
          </div>
          <span className="count" data-k="count" />
        </div>

        {/* PC에서는 수로 왼쪽 위(하늘 자리)에 얹고, 폰에서는 재생 조작 밑에 붙인다. */}
        <aside className="board" aria-label="그날의 기록">
          <div className="board-head">
            <span className="board-date" data-k="date" />
            <span className="board-day" data-k="dow" />
          </div>
          <dl className="stats">
            <div><dt>구경꾼</dt><dd data-k="visit" /></div>
            <div><dt>누적</dt><dd data-k="cum" /></div>
            <div><dt>롯데</dt><dd data-k="lotte" /></div>
            <div><dt>순위</dt><dd data-k="rank" /></div>
          </dl>
          <ul className="events" data-k="events" />
        </aside>
      </section>

      <details className="chart">
        <summary>날짜별 구경꾼 펼쳐 보기</summary>
        <div className="chart-body">
          <span className="chart-note">
            막대는 그날 방문객(천 명), 밑의 점은 그날 롯데 — 초록 승 · 빨강 패 · 회색 경기 없음
          </span>
          <canvas data-k="chart" role="img" aria-label="9월 18일부터 날짜별 친수공원 방문객 막대그래프와 그날 롯데 경기 결과" />
        </div>
      </details>

      <p className="lede">
        2026년 9월 18일 아침, 부산 북항 친수공원 수로에 몸길이 3.5m 상어가 들어왔다.
        무태상어로 추정되는 이 상어는 휘어진 수로에서 출구를 못 찾고 <b>같은 자리를 뱅뱅 돌았고</b>,
        부산시설공단이 붙인 이름 «부캉이»와 함께 추석 연휴의 명물이 됐다. 공교롭게 그날부터
        롯데가 연승을 시작해 «부캉아 가지 마»라는 말까지 나왔다. 그날그날의 구경꾼과 사건,
        롯데 경기를 하루씩 넘겨 본다. 끝까지 가면 처음 발견한 날로 돌아간다.
      </p>
      <p className="source">
        자료: 부산시설공단 방문객 집계와 국제신문·문화일보·서울신문·전남일보·데일리안·오마이뉴스 보도. 롯데 경기는 KBO 기록실.
        18일은 집계 전, 26일은 집계 중이라 막대를 비워 두었다. 인파 그림은 숫자를 줄여 그린 것이다.
      </p>
    </div>
  );
}
