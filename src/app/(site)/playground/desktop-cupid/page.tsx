import type { Metadata } from "next";

import "./cupid.css";
import Demo from "./Demo";
import Download from "./Download";
import Faq from "./Faq";
import { LATEST } from "./releases";

const TITLE = "바탕화면 큐피트 — 쪽지를 활로 쏘면 친구 바탕화면에 꽂혀요 (맥 · 윈도우)";
const DESCRIPTION =
  "쪽지를 쓰고 화면 아래 활을 당겨 쏘면, 친구 바탕화면 가장자리로 화살이 날아 들어와 꽂혀요. 세게 쏠수록 깊이. 꽂힌 화살을 누르면 쪽지가 펼쳐지고, 거기서 답장을 쏴요. 친구는 코드 하나로 맺고, 회원가입은 없어요. 맥과 윈도우 모두 무료.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/desktop-cupid" },
  // 내비에서 감춘 항목이다(트리·치이카와·붙여넣기 총 페이지와 같다). 사이트맵 제외는 next-sitemap.config.js 에.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://joowonkoh.com/playground/desktop-cupid",
  },
};

const RULES: { head: string; body: string }[] = [
  { head: "코드 하나로 친구", body: "내 코드(CUPID-로 시작해요)를 보내거나 친구 코드를 넣으면 둘 다 친구가 돼요. 회원가입은 없어요." },
  { head: "당겨서 쏴요", body: "쪽지를 쓰고 「장전」하면 화면 아래에 활이 떠요. 잡고 뒤로 당겼다 놓으면 내 화면 밖으로 날아가요." },
  { head: "세게 쏠수록 깊이", body: "친구 화면 가장자리로 날아 들어와 꽂혀요. 살살 쏘면 가장자리에, 세게 쏘면 반대쪽 가까이까지." },
  { head: "누르면 펼쳐져요", body: "꽂힌 화살을 누르면 쪽지가 펼쳐지고 화살은 뽑혀요. 「답장 쏘기」로 바로 되쏘면 돼요." },
  { head: "꺼져 있어도 기다려요", body: "친구 컴퓨터가 꺼져 있었으면, 켜는 순간 밀린 화살이 차례로 날아 들어와요." },
  { head: "일은 그대로", body: "화살과 활 위만 마우스를 받고, 나머지 클릭은 밑의 앱으로 통과해요. 가만히 있을 때는 아무것도 그리지 않아요." },
];

export default function DesktopCupidPage() {
  return (
    <div className="cp-page">
      {/* 제목 글꼴. React 가 head 로 올려 준다. 이 페이지에서만 쓰는 글꼴이라 일부러 여기서 부른다. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Gaegu:wght@700&display=swap"
        precedence="default"
      />

      <header className="pt-6">
        <h1 className="cp-display text-[44px] leading-[1.15] md:text-[60px] break-keep">
          쪽지를 쏘면
          <br />
          친구 화면에 <span className="text-[#e0174f]">꽂혀요</span>
        </h1>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.75] text-[#3b2430]/75 break-keep">
          쪽지를 쓰고 바탕화면 아래의 활을 당겨 쏘면, 친구 컴퓨터 화면 가장자리로 화살이 날아 들어와 꽂혀요.
          세게 쏠수록 깊이. 친구가 화살을 누르면 쪽지가 펼쳐져요.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#mac"
            className="rounded-[12px] bg-[#e0174f] px-5 py-3 text-[15px] font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff9bb8]"
          >
            맥에서 받기
          </a>
          <a
            href="#windows"
            className="rounded-[12px] bg-white px-5 py-3 text-[15px] font-semibold text-[#3b2430] shadow-[0_0_0_1px_rgba(59,36,48,0.16)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff9bb8]"
          >
            윈도우에서 받기
          </a>
          <span className="self-center text-[13px] text-[#3b2430]/55">무료 · {LATEST.version}</span>
        </div>
      </header>

      {/* 데모는 본문 폭(3xl)을 벗어나 넓게 깐다 — 바탕화면 둘이 나란히 놓일 자리가 필요하다. */}
      <section className="relative left-1/2 mt-12 w-[min(1180px,calc(100vw-24px))] -translate-x-1/2">
        <Demo />
      </section>

      <section className="mt-24">
        <h2 className="cp-display text-[34px] md:text-[42px]">이렇게 주고받아요</h2>
        <dl className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {RULES.map((item) => (
            <div key={item.head}>
              <dt className="cp-display text-[22px] text-[#e0174f]">{item.head}</dt>
              <dd className="mt-1.5 text-[15px] leading-[1.75] text-[#3b2430]/72 break-keep">{item.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="download" className="mt-24 scroll-mt-24">
        {/* 첫 화면의 「맥에서 받기」「윈도우에서 받기」가 닿는 자리. */}
        <span id="mac" className="block scroll-mt-24" />
        <span id="windows" className="block scroll-mt-24" />
        <h2 className="cp-display text-[34px] md:text-[42px]">받기</h2>
        <div className="mt-6">
          <Download />
        </div>
      </section>

      <section className="mt-24">
        <h2 className="cp-display text-[34px] md:text-[42px]">궁금한 것</h2>
        <div className="mt-6">
          <Faq />
        </div>
      </section>

      <footer className="mt-20 space-y-3 border-t border-[#3b2430]/10 pt-8 text-[13px] leading-relaxed text-[#3b2430]/55 break-keep">
        <p>
          쪽지는 받는 사람에게 전하려고 서버에 글 그대로 저장돼요. 끝에서 끝 암호화가 아니라서 서버를
          운영하는 사람은 볼 수 있어요. 민감한 내용은 보내지 마세요.
        </p>
        <p>
          소스는{" "}
          <a
            href="https://github.com/joowon-dev/desktop-cupid"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#3b2430] underline underline-offset-4"
          >
            github.com/joowon-dev/desktop-cupid
          </a>
          에 있어요. 활과 화살은 HTML로 그리고 껍데기만 맥(Swift)·윈도우(.NET)라 앱이 작아요. 이 페이지의
          활과 화살은 앱과 같은 코드로 돌아요.
        </p>
      </footer>
    </div>
  );
}
