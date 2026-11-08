import type { Metadata } from "next";
import Link from "next/link";

import Game from "./Game";
import "./pepero.css";

const TITLE = "빼빼로 게임 — 친구랑 실시간으로 하는 막대과자 치킨 게임";
const DESCRIPTION =
  "링크로 친구를 부르고 둘이 동시에 버튼을 꾹! 누르는 동안 양쪽에서 막대과자를 먹고, 손을 떼면 멈춰요. 더 많이 먹은 사람이 이기지만, 상대가 멈췄는데 계속 먹으면 입술을 앙! 먼저 겁먹는 사람이 진다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/pepero-game" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: "🍫 빼빼로 게임 한 판 할래?",
    description: "버튼 꾹 누르는 동안 먹고, 떼면 멈춰. 먼저 겁먹는 사람이 진다!",
    url: "https://joowonkoh.com/playground/pepero-game",
  },
};

export default function PeperoGamePage() {
  return (
    // 사이트 헤더·푸터 없이 화면을 꽉 채운다(HideOnAdmin 의 OWN_SHELL).
    <div className="pp-page relative flex min-h-[100dvh] flex-col overflow-x-hidden">
      {/* 제목 글꼴. 이 페이지에서만 쓰는 글꼴이라 일부러 여기서 부른다. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Jua&display=swap"
        precedence="default"
      />

      <nav className="px-4 pt-4">
        <Link href="/playground" className="pp-chip pp-display inline-block">
          ← 놀이터
        </Link>
      </nav>

      <div className="flex-1 pt-5 pb-12 sm:pt-8">
        <header className="mx-auto max-w-[560px] px-4 text-center">
          <p className="pp-display text-[15px] text-[#e0577b]">친구랑 실시간 치킨 게임</p>
          <h1 className="pp-display mt-1 text-[44px] leading-tight sm:text-[54px]">
            빼빼로 게임 <span aria-hidden>🍫</span>
          </h1>
          <p className="mt-1 text-[14.5px] opacity-70 break-keep">
            꾹 누르면 냠냠, 떼면 멈춤. 먼저 겁먹는 사람이 진다!
          </p>
        </header>

        <div className="mt-6">
          <Game />
        </div>
      </div>

      <p className="mx-auto max-w-[64ch] px-4 pb-5 text-center text-[11.5px] leading-relaxed opacity-55 break-keep">
        대결 중 누른·뗀 시각만 실시간으로 오가고, 아무것도 저장하지 않아요.
        특정 과자 브랜드와 관계없는 놀이 페이지예요.
      </p>
    </div>
  );
}
