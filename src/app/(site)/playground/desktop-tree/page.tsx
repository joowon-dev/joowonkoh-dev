import type { Metadata } from "next";

import "./tree.css";
import Demo from "./Demo";
import Download from "./Download";
import Faq from "./Faq";
import { LATEST } from "./releases";

const TITLE = "바탕화면 트리 — 창의 빨강·노랑·초록 단추로 꾸미는 크리스마스 트리 (맥 · 윈도우)";
const DESCRIPTION =
  "지금 떠 있는 창마다 빨강·노랑·초록 방울이 크리스마스 트리에 달려요. 트리의 빨강을 누르면 그 창이 닫히고 방울이 떨어지고, 노랑은 접고, 초록은 키워요. 트리는 끌어서 옮기고, 별을 끌어서 크기를 정해요. 맥과 윈도우 모두 무료.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/desktop-tree" },
  // 내비에서 감춘 항목이다(상어·치이카와·붙여넣기 총 페이지와 같다). 사이트맵 제외는 next-sitemap.config.js 에.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://joowonkoh.com/playground/desktop-tree",
  },
};

/** 방울 셋이 하는 일. 맥 창의 단추와 같은 색, 같은 뜻이다. */
const BALLS: { color: string; name: string; head: string; body: string }[] = [
  { color: "#ff5f57", name: "빨강", head: "닫아요", body: "그 창이 닫히고, 그 창의 방울 셋이 트리에서 떨어져 바닥에 튀어요. 저장 안 한 문서는 그 앱이 먼저 물어봐요." },
  { color: "#febc2e", name: "노랑", head: "접어요", body: "창이 Dock으로 접히고 방울의 불이 꺼져요. 꺼진 방울을 다시 누르면 창이 돌아와요." },
  { color: "#28c840", name: "초록", head: "키워요", body: "창이 화면에 꽉 차게 자라고 초록 방울도 같이 커져요. 한 번 더 누르면 원래 자리로 돌아가요." },
];

const RULES: { head: string; body: string }[] = [
  { head: "창 하나에 방울 셋", body: "새 창을 열면 방울 셋이 튀어나와 달리고, 창을 닫으면 떨어져요. 트리가 지금 내 화면의 모습이에요." },
  { head: "아무 데나 달려요", body: "방울은 창마다 묶지 않고 트리 여기저기에 흩어 달아요. 그래서 켤 때마다 다른 트리가 돼요." },
  { head: "올리면 알려 줘요", body: "방울에 마우스를 올리면 같은 창의 셋이 같이 켜지고, 어느 앱의 창인지 이름표가 떠요." },
  { head: "끌어서 옮기고, 별을 끌어서 키워요", body: "잎이나 기둥을 잡고 끌면 어디든 옮겨져요. 꼭대기 별을 잡고 끌면 손톱만 한 크기부터 큼직한 크기까지 마음대로예요." },
  { head: "일은 그대로", body: "방울과 트리 몸통만 마우스를 받아요. 그 둘레의 빈 데는 클릭이 밑의 앱으로 통과해요." },
  { head: "조용히 서 있어요", body: "가만히 있을 때 움직이는 것은 꼬마전구뿐이에요. 그것도 메뉴에서 끌 수 있어요." },
];

export default function DesktopTreePage() {
  return (
    <div className="dt-page">
      {/* 제목 글꼴. React 가 head 로 올려 준다. 이 페이지에서만 쓰는 글꼴이라 일부러 여기서 부른다. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&display=swap"
        precedence="default"
      />

      <header className="pt-6">
        <h1 className="dt-display text-[38px] leading-[1.2] md:text-[52px] break-keep">
          창을 닫으면
          <br />
          방울이 떨어져요
        </h1>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.75] text-[#16203a]/75 break-keep">
          지금 떠 있는 창마다 빨강·노랑·초록 방울이 트리에 달려요. 맥 창 왼쪽 위의 그 단추 셋이에요. 트리의
          방울을 누르면 그 창이 닫히고, 접히고, 커져요.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#mac"
            className="rounded-[12px] bg-[#141d33] px-5 py-3 text-[15px] font-semibold text-[#ffe9a8] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2ab3f]"
          >
            맥에서 받기
          </a>
          <a
            href="#windows"
            className="rounded-[12px] bg-white px-5 py-3 text-[15px] font-semibold text-[#16203a] shadow-[0_0_0_1px_rgba(22,32,58,0.16)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2ab3f]"
          >
            윈도우에서 받기
          </a>
          <span className="self-center text-[13px] text-[#16203a]/55">무료 · {LATEST.version}</span>
        </div>
      </header>

      {/* 데모는 본문 폭(3xl)을 벗어나 넓게 깐다 — 창과 트리가 같이 보일 자리가 필요하다. */}
      <section className="relative left-1/2 mt-12 w-[min(1080px,calc(100vw-24px))] -translate-x-1/2">
        <Demo />
      </section>

      <section className="mt-24">
        <h2 className="dt-display text-[30px] md:text-[36px]">방울 셋</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-3">
          {BALLS.map((ball) => (
            <li key={ball.name} className="rounded-[20px] bg-white p-5 shadow-[0_0_0_1px_rgba(22,32,58,0.1)]">
              <span
                aria-hidden
                className="block h-7 w-7 rounded-full shadow-[inset_0_-3px_4px_rgba(0,0,0,0.18),inset_0_0_0_0.5px_rgba(0,0,0,0.2)]"
                style={{ background: ball.color }}
              />
              <p className="mt-4 text-[18px] font-bold text-[#16203a]">
                {ball.name} — {ball.head}
              </p>
              <p className="mt-1.5 text-[14px] leading-[1.75] text-[#16203a]/70 break-keep">{ball.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24">
        <h2 className="dt-display text-[30px] md:text-[36px]">이렇게 굴러가요</h2>
        <dl className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {RULES.map((item) => (
            <div key={item.head}>
              <dt className="text-[17px] font-bold text-[#14613a]">{item.head}</dt>
              <dd className="mt-1.5 text-[15px] leading-[1.75] text-[#16203a]/72 break-keep">{item.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="download" className="mt-24 scroll-mt-24">
        {/* 첫 화면의 「맥에서 받기」「윈도우에서 받기」가 닿는 자리. */}
        <span id="mac" className="block scroll-mt-24" />
        <span id="windows" className="block scroll-mt-24" />
        <h2 className="dt-display text-[30px] md:text-[36px]">받기</h2>
        <div className="mt-6">
          <Download />
        </div>
      </section>

      <section className="mt-24">
        <h2 className="dt-display text-[30px] md:text-[36px]">궁금한 것</h2>
        <div className="mt-6">
          <Faq />
        </div>
      </section>

      <footer className="mt-20 space-y-3 border-t border-[#16203a]/10 pt-8 text-[13px] leading-relaxed text-[#16203a]/55 break-keep">
        <p>
          소스는{" "}
          <a
            href="https://github.com/joowon-dev/desktop-tree"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#16203a] underline underline-offset-4"
          >
            github.com/joowon-dev/desktop-tree
          </a>
          에 있어요. 트리와 방울은 HTML로 그리고 껍데기만 맥(Swift)·윈도우(.NET)라 앱이 작아요. 이 페이지의
          트리는 앱과 같은 코드로 돌아요.
        </p>
      </footer>
    </div>
  );
}
