import type { Metadata } from "next";

import "./talk.css";
import Translator from "./Translator";

const TITLE = "먼작귀 통역기 — 한글로 말하면 치이카와 친구들 말로";
const DESCRIPTION =
  "한글로 적으면 치이카와·하치와레·우사기 말로 바꿔 줍니다. 배고프면 「냠…」, 신나면 「야하!」, 무서우면 「어떻게든 되라─!」.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/chiikawa-talk" },
  // 바탕화면 치이카와처럼 내비에서 감춘 팬 페이지다. 사이트맵 제외는 next-sitemap.config.js 에.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://joowonkoh.com/playground/chiikawa-talk",
  },
};

/** 제목 둘레의 반짝이 자리(%)와 박자. */
const STARS: [number, number, number, string][] = [
  [8, 18, 0, "✦"],
  [88, 12, 0.6, "✧"],
  [16, 70, 1.2, "✧"],
  [80, 62, 0.3, "✦"],
  [50, 4, 1.8, "✧"],
];

export default function ChiikawaTalkPage() {
  return (
    <div className="ct-page -mt-16">
      {/* 제목 글꼴. 이 페이지에서만 쓰는 글꼴이라 일부러 여기서 부른다. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Jua&display=swap"
        precedence="default"
      />

      {/* 본문 폭을 벗어나 하늘을 넓게 깐다. */}
      <section className="ct-sky relative left-1/2 w-[min(1080px,calc(100vw-16px))] -translate-x-1/2 overflow-hidden rounded-b-[40px] pt-24 pb-28">
        <header className="relative mx-auto max-w-[640px] px-4 text-center">
          {STARS.map(([x, y, delay, ch]) => (
            <span
              key={`${x}-${y}`}
              aria-hidden
              className="ct-star text-[22px]"
              style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }}
            >
              {ch}
            </span>
          ))}
          <p className="ct-display text-[15px] text-[#e07a9b]">먼가 작고 귀여운 녀석들의 말</p>
          <h1 className="ct-display mt-1 text-[44px] leading-tight sm:text-[56px]">먼작귀 통역기</h1>
          <p className="mt-2 text-[14.5px] opacity-65 break-keep">
            한글로 적으면 친구들 말로 바꿔 줄게. 누가 말할지 골라 봐!
          </p>
        </header>

        <div className="mt-8">
          <Translator />
        </div>
      </section>

      <p className="mx-auto mt-6 max-w-[64ch] px-4 text-center text-[12.5px] leading-relaxed text-[#4b3a35]/55 break-keep">
        팬이 만든 비공식 놀이 페이지예요. 치이카와 IP의 모든 권리는 원작자 및 판권사에 있으며,
        저작권자의 요청이 있을 시 예고 없이 삭제될 수 있습니다. 통역은 규칙으로 지어낸 것이라 원작 설정과 달라요.
      </p>
    </div>
  );
}
