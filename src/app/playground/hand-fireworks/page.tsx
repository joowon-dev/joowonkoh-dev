import type { Metadata } from "next";
import HandFireworks from "./HandFireworks";

const TITLE = "불꽃놀이";
const DESCRIPTION =
  "웹캠 앞에서 주먹을 쥐었다 활짝 펴면 손바닥에서 불꽃이 솟아올라 정점에서 터집니다. 손 모양만 보고 신원 식별·저장·전송 없이 브라우저 안에서만 돌아갑니다.";
const URL = "https://joowonkoh.com/playground/hand-fireworks";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
  },
};

export default function HandFireworksPage() {
  return (
    <main>
      <HandFireworks />
    </main>
  );
}
