import type { Metadata } from "next";
import MarbleDropGame from "./MarbleDropGame";

const TITLE = "구슬 폭포 추첨기";
const DESCRIPTION =
  "사람마다 양동이가 놓이고 구슬이 쏟아집니다. 회전 바와 범퍼에 튕기다가 양동이를 가장 먼저 채운 사람이 당첨되는 추첨기.";
const URL = "https://joowonkoh.com/playground/marble-drop";
const OG_IMAGE = "/og/marble-drop.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["추첨기", "랜덤 뽑기", "사다리타기 대안", "제비뽑기", "당첨자 추첨", "구슬 게임"],
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${TITLE} 게임 화면` }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function MarbleDropPage() {
  return (
    <main>
      <MarbleDropGame />
    </main>
  );
}
