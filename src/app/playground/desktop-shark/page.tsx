import type { Metadata } from "next";

import "./shark.css";
import Download from "./Download";
import Faq from "./Faq";
import HeroContent from "./HeroContent";
import SharkIcon from "./SharkIcon";
import Stage from "./Stage";

const TITLE =
  "바탕화면 상어 — 일하는 동안 저절로 크는 데스크톱 상어 키우기 (맥 · 윈도우)";
const DESCRIPTION =
  "바탕화면에 상어가 삽니다. 클릭하면 그 자리에 밥이 떨어지고 상어가 달려와 뭅니다. 타자를 치면 작은 밥이 떨어집니다. 창이 클릭을 삼키지 않아서 하던 일은 그대로 하면 되고, 먹은 만큼 자라 여섯 종의 도감을 채웁니다. 맥과 윈도우 모두 받을 수 있습니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "https://joowonkoh.com/playground/desktop-shark",
  },
  // 내비에서 감춘 항목이다. 목록에 없는 페이지가 검색 결과로만 노출되면
  // 들어온 사람은 사이트에서 다시 찾아갈 길이 없다. 사이트맵 제외는
  // next-sitemap.config.js에 같이 걸어 뒀다.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://joowonkoh.com/playground/desktop-shark",
  },
};

/** 앱이 하는 일. 문장 하나씩 — 위의 데모가 이미 보여 줬으니 설명은 짧게. */
const LIFE: { head: string; body: string }[] = [
  {
    head: "켜 두면 그냥 살아요",
    body: "창을 띄우는 앱이 아니에요. 바탕화면 위에 얇게 얹혀서 흐릿한 그림자가 화면을 가로질러 지나가요.",
  },
  {
    head: "클릭은 큰 밥",
    body: "아무 데나 클릭하면 그 자리에 큰 밥(10점)이 떨어지고, 상어가 헤엄쳐 와서 물어요.",
  },
  {
    head: "타자는 작은 밥",
    body: "타자를 치면 아무 데나 작은 밥(1점)이 떨어져요. 어떤 키였는지는 앱도 몰라요. 몇 번인지만 세요.",
  },
  {
    head: "일은 그대로",
    body: "창이 마우스를 절대 받지 않아요. 누르던 버튼은 그대로 눌리고 치던 글자는 그대로 찍혀요.",
  },
  {
    head: "먹은 만큼 자라요",
    body: "1단계에서 6단계까지 몸 길이가 일곱 배가 되고 점점 진해져요. 단계가 바뀌면 바로 알아봐요.",
  },
  {
    head: "굶기면 보채요",
    body: "배가 부르면 가장자리를 천천히 돌고, 오래 굶으면 화면 가운데로 나와 빙빙 맴돌아요.",
  },
];

/** 도감 — 이 앱의 «오래 하는 이유»라 순서와 조건을 정확히 적는다. */
const SPECIES: { key: string; name: string; unlock: string; hint: string }[] = [
  { key: "white", name: "백상아리", unlock: "처음부터", hint: "가장 흔하고 가장 상어다운 상어." },
  { key: "tiger", name: "뱀상어", unlock: "백상아리 6단계 + 누적 20,000점", hint: "통통하고 코가 뭉툭해요." },
  { key: "hammer", name: "귀상어", unlock: "뱀상어 6단계 + 누적 42,000점", hint: "머리가 옆으로 뻗었어요." },
  { key: "thresher", name: "환도상어", unlock: "귀상어 6단계 + 누적 66,000점", hint: "꼬리가 몸만큼 길어요." },
  { key: "saw", name: "톱상어", unlock: "환도상어 6단계 + 누적 92,000점", hint: "코가 톱이에요." },
  { key: "whale", name: "고래상어", unlock: "톱상어 6단계 + 누적 120,000점", hint: "가장 크고 가장 느려요. 아무도 해치지 않아요." },
];

const KEYS: { key: string; win: string; action: string }[] = [
  { key: "⌥⇧S", win: "Alt+Shift+S", action: "밥 주기 멈추기 / 다시. 남이 화면을 볼 때만 끄면 돼요" },
  { key: "⌥⇧R", win: "Alt+Shift+R", action: "도감 · 랭킹 · 계정 창" },
  { key: "⌥⇧H", win: "Alt+Shift+H", action: "숨기기 / 다시 부르기" },
];

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="sk-display text-[32px] text-[#0f2a3a] md:text-[38px]">{children}</h2>;
}

export default function DesktopSharkPage() {
  return (
    <div className="sk-page -mt-16">
      {/* 제목 글꼴. React 가 head 로 올려 준다. 이 페이지에서만 쓰는 글꼴이라 일부러 여기서 부른다. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap"
        precedence="default"
      />

      {/* 첫 화면은 본문 폭(3xl)을 벗어나 넓게 깐다 — 바탕화면처럼 보여야 한다. */}
      <section className="relative left-1/2 w-[min(1180px,calc(100vw-24px))] -translate-x-1/2 pt-4">
        <Stage hero={<HeroContent />} />
      </section>

      <section className="mt-24">
        <Heading>이렇게 살아요</Heading>
        <dl className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {LIFE.map((item) => (
            <div key={item.head}>
              <dt className="sk-display text-[21px] text-[#1b8db8]">{item.head}</dt>
              <dd className="mt-1.5 text-[15px] leading-[1.75] text-[#0f2a3a]/75 break-keep">{item.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-24">
        <Heading>도감</Heading>
        <p className="mt-3 max-w-[56ch] text-[15px] leading-[1.75] text-[#0f2a3a]/75 break-keep">
          여섯 종이 순서대로 열려요. <strong className="font-semibold text-[#0f2a3a]">점수만 쌓아서는 안 열려요</strong>{" "}
          — 앞의 상어를 6단계까지 다 키워야 다음이 나와요. 다 키운 상어는 고정해 둘 수 있고, 지나온 단계와 연
          종으로는 언제든 돌아갈 수 있어요.
        </p>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2">
          {SPECIES.map((s, i) => (
            <li
              key={s.key}
              className="flex items-center gap-4 rounded-[22px] bg-[#06141e] px-4 py-3.5 text-[rgba(230,246,252,0.95)] shadow-[0_14px_30px_-16px_rgba(6,20,30,0.9)]"
            >
              <SharkIcon species={s.key} width={92} height={46} light className="shrink-0" />
              <div className="min-w-0">
                <p className="sk-display text-[19px] leading-tight">
                  <span className="mr-1.5 text-[rgba(127,211,240,0.8)]">{i + 1}</span>
                  {s.name}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-[rgba(230,246,252,0.6)] break-keep">{s.hint}</p>
                <p className="mt-1 text-[12px] text-[rgba(127,211,240,0.85)] break-keep">{s.unlock}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-[13.5px] leading-relaxed text-[#0f2a3a]/60 break-keep">
          보통 일하는 리듬이면 시간당 5,000점쯤 쌓여요. 한 마리는 하루, 여섯 종을 다 여는 데는 한 주 남짓.
        </p>
      </section>

      <section className="mt-24">
        <Heading>랭킹</Heading>
        <p className="mt-3 max-w-[56ch] text-[15px] leading-[1.75] text-[#0f2a3a]/75 break-keep">
          처음 밥을 준 순간 별명이 저절로 만들어져요(상어0000 같은 것). 랭킹에는 별명, 상어 실루엣, 계급, 점수가
          나와요. <strong className="font-semibold text-[#0f2a3a]">계정은 몰래 야구와 같은 걸 써요</strong> — 야구의
          복구 코드를 넣으면 같은 사람으로 이어져요. 올리기 싫으면 끄면 되고, 그래도 상어는 그대로 커요.
        </p>
      </section>

      <section className="mt-24">
        <Heading>조작</Heading>
        <p className="mt-3 text-[15px] leading-[1.75] text-[#0f2a3a]/75 break-keep">
          클릭과 타자는 그냥 일하는 거라 조작이 아니에요. 알아 둘 키는 셋뿐이에요.
        </p>
        <div className="mt-6 overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(15,42,58,0.08)]">
          {KEYS.map((k, i) => (
            <div key={k.key} className={`flex items-center gap-4 px-5 py-3.5 ${i > 0 ? "border-t border-[#0f2a3a]/8" : ""}`}>
              <kbd className="sk-display w-[58px] shrink-0 rounded-lg bg-[#e6f1f5] py-1 text-center text-[17px] text-[#0f2a3a]">
                {k.key}
              </kbd>
              <span className="min-w-0 text-[14.5px] leading-relaxed text-[#0f2a3a]/75 break-keep">
                {k.action}
                <span className="ml-2 text-[12.5px] text-[#0f2a3a]/45">윈도우 {k.win}</span>
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13.5px] leading-relaxed text-[#0f2a3a]/60 break-keep">
          나머지(지금 단계, 모니터 고르기, 종료)는 메뉴 막대의 지느러미(윈도우는 알림 영역)에 있어요.
        </p>
      </section>

      <section id="download" className="mt-24 scroll-mt-24">
        {/* 첫 화면의 「윈도우에서 받기」가 닿는 자리. */}
        <span id="windows" className="block scroll-mt-24" />
        <Heading>받기</Heading>
        <div className="mt-6">
          <Download />
        </div>
      </section>

      <section className="mt-24">
        <Heading>궁금한 것</Heading>
        <div className="mt-6">
          <Faq />
        </div>
      </section>

      <footer className="mt-20 border-t border-[#0f2a3a]/10 pt-8 text-[13px] leading-relaxed text-[#0f2a3a]/55 break-keep">
        <p>
          소스는{" "}
          <a
            href="https://github.com/joowon-dev/desktop-shark"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#0f2a3a] underline underline-offset-4"
          >
            github.com/joowon-dev/desktop-shark
          </a>
          에 있어요. 상어와 물살은 HTML 캔버스로 그리고 껍데기만 맥(Swift)·윈도우(.NET)라, 맥 앱이 1MB도 안 돼요. 위의
          데모도 앱과 같은 코드로 헤엄쳐요.
        </p>
      </footer>
    </div>
  );
}
