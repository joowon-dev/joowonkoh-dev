import type { Metadata } from "next";
import TogetherMap from "./TogetherMap";

const TITLE = "같이 걸은 지도";
const DESCRIPTION =
  "두 사람의 구글 타임라인을 한 지도에 겹쳐 재생합니다. 서로 가까이 있었던 순간을 찾아 표시하고 영상으로 저장합니다. 파일은 이 기기를 벗어나지 않습니다.";
const URL = "https://joowonkoh.com/playground/together-map";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["구글 타임라인", "위치기록 시각화", "커플 지도", "이동경로 영상", "타임라인 시각화"],
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function TogetherMapPage() {
  return (
    <main>
      <TogetherMap />
    </main>
  );
}
