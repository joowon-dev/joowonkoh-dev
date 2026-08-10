import type { Metadata } from "next";
import ImaxFrontRow from "./ImaxFrontRow";

const TITLE = "아이맥스 1열";
const DESCRIPTION =
  "웹캠 화면을 22미터 아이맥스 스크린에 걸고, 1열 좌석에서 올려다본 시점으로 보여줍니다. 목이 꺾이는 각도와 곡면 왜곡을 실제 극장 규격으로 계산합니다.";
const URL = "https://joowonkoh.com/playground/imax-front-row";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: `${TITLE} — Joowon Koh`,
    description: DESCRIPTION,
    url: URL,
  },
};

export default function ImaxFrontRowPage() {
  return (
    <main>
      <ImaxFrontRow />
    </main>
  );
}
