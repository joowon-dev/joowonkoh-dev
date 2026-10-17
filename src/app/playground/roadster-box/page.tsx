import type { Metadata, Viewport } from "next";
import RoadsterBox from "./RoadsterBox";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05060f",
};

/*
  보내는 사람이 적은 글은 # 뒤에만 있어서 미리보기 카드에는 안 뜬다.
  대화방에는 «택배가 도착했다»까지만 보이고, 내용은 열어야 보인다.
*/
const TITLE = "🚀 로드스터 택배가 도착했어요";
const DESCRIPTION = "착륙하면 상자가 열려요. 눌러서 받아 보세요.";
const URL = "https://joowonkoh.com/playground/roadster-box";

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
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

export default function RoadsterBoxPage() {
  return (
    <main>
      <RoadsterBox />
    </main>
  );
}
