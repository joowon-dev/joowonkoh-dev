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
const DESCRIPTION = "킥플립으로 날아온 상자를 열어 보세요.";
const URL = "https://joowonkoh.com/playground/roadster-box";
/** 영상 첫 장면. 램프 앞 닫힌 상자뿐이라 내용은 안 보인다 */
const OG_IMAGE = "/playground/roadster-box/poster.jpg";

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
    images: [{ url: OG_IMAGE, width: 720, height: 1280, alt: "콘크리트 램프 앞에 놓인 택배 상자" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

export default function RoadsterBoxPage() {
  return (
    <main>
      <RoadsterBox />
    </main>
  );
}
