import type { Metadata, Viewport } from "next";
import CatchersView from "./CatchersView";

/**
 * 화면을 통째로 덮는다. 18.44m가 0.4초에 사라지는 걸 느끼려면 시야를 다
 * 먹어야 해서, 이 라우트에만 viewport-fit=cover를 건다.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const TITLE = "포수 시점으로 공 받기";
const DESCRIPTION =
  "KBO 투수가 던지는 공을 포수 눈높이에서 받아 봅니다. 궤적을 그림으로 흉내내지 않고 항력과 마그누스를 적분해 계산합니다.";
const URL = "https://joowonkoh.com/playground/catchers-view";

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

export default function CatchersViewPage() {
  return (
    <main>
      <CatchersView />
    </main>
  );
}
