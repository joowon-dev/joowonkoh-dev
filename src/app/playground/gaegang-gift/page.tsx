import type { Metadata, Viewport } from "next";
import GaegangGift from "./GaegangGift";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#141a2e",
};

/*
  카톡 미리보기에 «종강»이라는 단어를 절대 넣지 않는다. 열기 전까지 정체를
  모르는 것이 이 장난감의 전부라서, 제목·설명·이미지 어디에도 힌트가 없어야 한다.
  대화방에 뜨는 카드는 딱 리본 묶인 상자 하나로 보인다.
*/
const TITLE = "🎁 개강 선물이 도착했어요";
const DESCRIPTION = "눌러서 열어보세요.";
const URL = "https://joowonkoh.com/playground/gaegang-gift";
const OG_IMAGE = "/og/gaegang-gift.jpg";

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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "리본이 묶인 선물 상자" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function GaegangGiftPage() {
  return (
    <main>
      <GaegangGift />
    </main>
  );
}
