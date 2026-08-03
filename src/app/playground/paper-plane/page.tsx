import type { Metadata } from "next";
import PaperPlaneGame from "./PaperPlaneGame";

export const metadata: Metadata = {
  title: "종이비행기 날리기",
  description:
    "비행기 뒤에서 보는 시점으로, 드래그 발사 + 마이크 입김으로 더 멀리 날리는 미니게임.",
  alternates: { canonical: "https://joowonkoh.com/playground/paper-plane" },
  // 내비에서 감춘 항목이다. 목록에 없는 페이지가 검색 결과로만 노출되면
  // 들어온 사람은 사이트에서 다시 찾아갈 길이 없다. 사이트맵 제외는
  // next-sitemap.config.js에 같이 걸어 뒀다.
  robots: { index: false, follow: false },
};

export default function PaperPlanePage() {
  return (
    <main>
      <PaperPlaneGame />
    </main>
  );
}
