import type { Metadata } from "next";

import "./chiikawa.css";
import Cast from "./Cast";
import Download from "./Download";
import Faq from "./Faq";
import HeroContent from "./HeroContent";
import Stage from "./Stage";

const TITLE = "바탕화면 치이카와 — 창을 열면 친구들이 창 위로 뿅 (맥 · 윈도우)";
const DESCRIPTION =
  "창을 열면 치이카와 친구들이 화면 아래에서 튀어나와 그 창 위에 올라섭니다. 창 위를 걷고, 앉고, 눕고, 옆 창으로 뛰어 건너가요. 창을 끌면 같이 실려 가고 닫으면 떨어집니다. 클릭은 전부 통과해서 일하는 데 방해되지 않아요. 맥과 윈도우 모두 무료.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/desktop-chiikawa" },
  // 내비에서 감춘 항목이다(상어·야구 페이지와 같다). 사이트맵 제외는 next-sitemap.config.js 에.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://joowonkoh.com/playground/desktop-chiikawa",
  },
};

/** 앱이 하는 일. 문장 하나씩 — 위의 데모가 이미 보여 줬으니 설명은 짧게. */
const LIFE: { head: string; body: string }[] = [
  { head: "창이 생기면 뿅", body: "새 창을 열면 화면 아래에서 한 친구가 솟아올라 그 창 위에 내려앉아요." },
  { head: "창 위는 다 놀이터", body: "걷고, 앉고, 눕고, 수다 떨고, 옆 창으로 뛰어 건너가요. 창 끝에서 뛰어내리기도 해요." },
  { head: "같이 실려 가요", body: "창을 끌면 위에 선 친구들이 휘청이며 따라와요. 창을 닫으면 떨어져서 밑의 창에 착지해요." },
  { head: "쓰다듬으면 하트", body: "마우스를 가까이 대면 쳐다보고, 더 가까이 대면 팔을 들고 하트를 날려요. 자던 친구는 깨요." },
  { head: "가려지면 숨어요", body: "다른 창에 가린 부분은 안 보이게 그려요. 창 뒤에 숨은 친구는 잠시 뒤 보이는 창으로 와요." },
  { head: "일은 그대로", body: "클릭은 전부 밑의 앱으로 통과해요. 친구들 위를 눌러도 그 아래 버튼이 눌려요." },
];

export default function DesktopChiikawaPage() {
  return (
    <div className="ck-page -mt-16">
      {/* 제목 글꼴. React 가 head 로 올려 준다. 이 페이지에서만 쓰는 글꼴이라 일부러 여기서 부른다. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Jua&display=swap"
        precedence="default"
      />

      {/* 첫 화면은 본문 폭(3xl)을 벗어나 넓게 깐다 — 창 셋이 나란히 놓일 자리가 필요하다. */}
      <section className="relative left-1/2 w-[min(1180px,calc(100vw-24px))] -translate-x-1/2 pt-4">
        <Stage hero={<HeroContent />} />
      </section>

      <section className="mt-24">
        <h2 className="ck-display text-[30px] md:text-[36px]">이렇게 살아요</h2>
        <dl className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {LIFE.map((item) => (
            <div key={item.head}>
              <dt className="ck-display text-[20px] text-[#ff6f96]">{item.head}</dt>
              <dd className="mt-1.5 text-[15px] leading-[1.75] text-[#4b3a35]/75 break-keep">
                {item.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-24">
        <h2 className="ck-display text-[30px] md:text-[36px]">누가 사나요</h2>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.75] text-[#4b3a35]/75 break-keep">
          일곱 친구가 번갈아 나와요. 다들 걷고 앉고 자는 건 같지만, 한가할 때 하는 일이 달라요.
        </p>
        <div className="mt-10">
          <Cast />
        </div>
      </section>

      <section id="download" className="mt-24 scroll-mt-24">
        {/* 첫 화면의 「윈도우에서 받기」가 닿는 자리. */}
        <span id="windows" className="block scroll-mt-24" />
        <h2 className="ck-display text-[30px] md:text-[36px]">받기</h2>
        <div className="mt-6">
          <Download />
        </div>
      </section>

      <section className="mt-24">
        <h2 className="ck-display text-[30px] md:text-[36px]">궁금한 것</h2>
        <div className="mt-6">
          <Faq />
        </div>
      </section>

      <footer className="mt-20 space-y-3 border-t border-[#4b3a35]/10 pt-8 text-[13px] leading-relaxed text-[#4b3a35]/55 break-keep">
        <p>
          치이카와(ちいかわ)와 친구들은 나가노(ナガノ) 작가의 캐릭터예요. 이 앱은 팬이 만든 비공식
          무료 앱이에요. 친구들 그림은 앱이나 이 사이트에 들어 있지 않고, 켤 때 인터넷으로 받아 와요.
          받지 못하면 코드로 따라 그린 친구들이 대신 나와요.
        </p>
        <p>
          소스는{" "}
          <a
            href="https://github.com/joowon-dev/desktop-chiikawa"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#4b3a35] underline underline-offset-4"
          >
            github.com/joowon-dev/desktop-chiikawa
          </a>
          에 있어요. 친구들은 HTML 캔버스로 그리고 껍데기만 맥(Swift)·윈도우(.NET)라, 맥 앱이 1MB도 안
          돼요.
        </p>
      </footer>
    </div>
  );
}
