import type { Metadata } from "next";
import DdongMallang from "./DdongMallang";

const TITLE = "똥 말랑";
const DESCRIPTION =
  "고양이 배를 꾹 누르면 힘주기, 손을 떼면 심호흡. 배변 리듬을 화면이 잡아줍니다. 기록을 저장하지 않고 브라우저 안에서만 돌아갑니다.";
const URL = "https://joowonkoh.com/playground/ddong-mallang";

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

export default function DdongMallangPage() {
  return (
    <main>
      <DdongMallang />
    </main>
  );
}
