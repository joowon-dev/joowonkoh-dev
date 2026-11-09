import type { Metadata } from "next";

import Game from "./Game";
import "./pepero.css";

const TITLE = "막대과자 게임 — 링크로 주고받는 치킨 게임";
const DESCRIPTION =
  "꾹 누르는 동안 막대과자를 먹고, 떼면 멈춰요. 얼마나 먹을지 정해 도전장 링크를 보내면 친구도 모른 채 정하고, 둘이 동시에 먹는 장면이 공개돼요. 더 많이 먹으면 이기지만 만나 버리면 입술을 앙!";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/pepero-game" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: "🍫 막대과자 도전장이 왔어요!",
    description: "얼마나 먹을지 정하고 링크로 붙자. 먼저 겁먹는 사람이 진다!",
    url: "https://joowonkoh.com/playground/pepero-game",
  },
};

export default function PeperoGamePage() {
  return (
    // 사이트 헤더·푸터 없이 화면을 꽉 채운다(HideOnAdmin 의 OWN_SHELL).
    <>
      {/* 제목 글꼴. 이 페이지에서만 쓰는 글꼴이라 일부러 여기서 부른다. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Jua&display=swap"
        precedence="default"
      />
      <Game />
      <p className="sr-only">
        {DESCRIPTION} 기록은 링크 속에만 들어 있고 아무것도 저장하지 않아요. 특정 과자 브랜드와 관계없는 놀이
        페이지예요.
      </p>
    </>
  );
}
