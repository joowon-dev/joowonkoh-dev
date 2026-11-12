import type { Metadata } from "next";

import "./gun.css";
import Arsenal from "./Arsenal";
import Download from "./Download";
import Faq from "./Faq";
import Range from "./Range";

const TITLE = "붙여넣기 총 — 복사한 글자를 한 글자씩 쏴서 붙여넣기 (맥 · 윈도우)";
const DESCRIPTION =
  "복사한 글자가 총알이 됩니다. ⌘V(윈도우는 Ctrl+V)를 누르면 총이 글자 커서로 날아와 한 글자씩 쏴서 붙여넣어요. 권총·기관총·샷건·저격총 네 자루, 자주 쓰는 글은 탄창으로 저장. 쏠 글이 없으면 평소 붙여넣기 그대로예요. 맥과 윈도우 모두 무료.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/paste-gun" },
  // 내비에서 감춘 항목이다(상어·치이카와 페이지와 같다). 사이트맵 제외는 next-sitemap.config.js 에.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://joowonkoh.com/playground/paste-gun",
  },
};

/** 총이 지키는 규칙. 위의 사격장이 이미 보여 줬으니 설명은 짧게. */
const RULES: { head: string; body: string }[] = [
  { head: "복사는 그대로, 붙여넣기만 총으로", body: "복사는 평소처럼 하면 돼요. 복사할 때마다 그 글이 탄창에 한 발씩 쌓여요." },
  { head: "쏠 게 없으면 끼어들지 않아요", body: "탄창이 비었거나 그림·파일을 복사했을 때는 원래 붙여넣기가 그대로 나가요." },
  { head: "복사한 순서대로 나가요", body: "이름, 전화, 주소를 차례로 복사해 두고 칸마다 쏘면 돼요. 기관총이면 한 번에 다 채워요." },
  { head: "자주 쓰는 글은 탄창으로", body: "인사말, 계좌번호, 주소 같은 것은 이름을 붙여 저장해 두고 갈아 끼워요." },
  { head: "방금 복사한 게 먼저예요", body: "저장한 탄창을 끼운 채로 뭔가 복사하면, 붙여넣기는 방금 복사한 그 글을 쏴요." },
  { head: "일은 그대로", body: "총과 HUD 위를 눌러도 클릭은 밑의 앱으로 통과해요. 보기 싫은 날은 HUD를 숨기고 쏴요." },
];

export default function PasteGunPage() {
  return (
    <div className="pg-page -mt-16">
      {/* 제목·숫자 글꼴. React 가 head 로 올려 준다. 이 페이지에서만 쓰는 글꼴이라 일부러 여기서 부른다. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600&family=Black+Han+Sans&display=swap"
        precedence="default"
      />

      {/* 첫 화면은 본문 폭(3xl)을 벗어나 넓게 깐다 — 총이 날아올 자리가 필요하다. */}
      <section className="relative left-1/2 w-[min(1180px,calc(100vw-24px))] -translate-x-1/2 pt-4">
        <Range />
      </section>

      <section className="mt-24">
        <h2 className="pg-display text-[32px] md:text-[38px]">총 네 자루</h2>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.75] text-[#1a212c]/72 break-keep">
          글자 하나가 총알 한 발이에요. 총마다 다른 것은 쏘는 빠르기와 한 번에 나가는 양이고, 위
          사격장에서 바꿔 가며 쏴 볼 수 있어요.
        </p>
        <div className="mt-8">
          <Arsenal />
        </div>
      </section>

      <section className="mt-24">
        <h2 className="pg-display text-[32px] md:text-[38px]">이렇게 굴러가요</h2>
        <dl className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {RULES.map((item) => (
            <div key={item.head}>
              <dt className="text-[17px] font-bold text-[#8a5f0c]">{item.head}</dt>
              <dd className="mt-1.5 text-[15px] leading-[1.75] text-[#1a212c]/72 break-keep">{item.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="download" className="mt-24 scroll-mt-24">
        {/* 첫 화면의 「윈도우에서 받기」가 닿는 자리. */}
        <span id="windows" className="block scroll-mt-24" />
        <h2 className="pg-display text-[32px] md:text-[38px]">받기</h2>
        <div className="mt-6">
          <Download />
        </div>
      </section>

      <section className="mt-24">
        <h2 className="pg-display text-[32px] md:text-[38px]">궁금한 것</h2>
        <div className="mt-6">
          <Faq />
        </div>
      </section>

      <footer className="mt-20 space-y-3 border-t border-[#1a212c]/10 pt-8 text-[13px] leading-relaxed text-[#1a212c]/55 break-keep">
        <p>
          소스는{" "}
          <a
            href="https://github.com/joowon-dev/paste-gun"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#1a212c] underline underline-offset-4"
          >
            github.com/joowon-dev/paste-gun
          </a>
          에 있어요. 총과 글자는 HTML 캔버스로 그리고 껍데기만 맥(Swift)·윈도우(.NET)라, 앱이 2MB도 안
          돼요. 이 페이지의 사격장은 앱과 같은 코드로 돌아요.
        </p>
      </footer>
    </div>
  );
}
