import type { Metadata } from "next";
import Link from "next/link";

import Game from "./Game";
import "./pepero.css";

const TITLE = "빼빼로 게임 — 링크로 보내는 막대과자 눈치 게임";
const DESCRIPTION =
  "내가 어디까지 먹을지 몰래 고르고 링크를 보내면, 친구가 반대쪽에서 어디까지 먹을지 골라요. 둘이 동시에 먹고 남은 길이가 짧을수록 찰떡 호흡. 너무 욕심내면 입술을 앙! 깨물어요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/pepero-game" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: "🍫 빼빼로 게임 도전장이 왔어요",
    description: "어디까지 먹을지 골라 봐. 너무 많이 먹으면 입술을 깨물어요!",
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
          <p className="pp-display text-[15px] text-[#e0577b]">링크로 하는 눈치 게임</p>
          <h1 className="pp-display mt-1 text-[44px] leading-tight sm:text-[54px]">
            빼빼로 게임 <span aria-hidden>🍫</span>
          </h1>
          <p className="mt-1 text-[14.5px] opacity-70 break-keep">
            누가 더 짧게 남기나? 대신 너무 먹으면 앙!
          </p>
        </header>

        <div className="mt-6">
          <Game />
        </div>
      </div>

      <p className="mx-auto max-w-[64ch] px-4 pb-5 text-center text-[11.5px] leading-relaxed opacity-55 break-keep">
        서버에 아무것도 저장하지 않아요. 고른 자리는 링크 안에만 섞여 들어가요.
        특정 과자 브랜드와 관계없는 놀이 페이지예요.
      </p>
    </div>
  );
}
