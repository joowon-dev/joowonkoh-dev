import type { Metadata } from "next";
import GlareGame from "./GlareGame";

const TITLE = "부장님 째려보기";
const DESCRIPTION =
  "웹캠에 잡힌 얼굴 개수만 세서, 나 말고 다른 사람이 다가오면 대신 째려봐 줍니다. 신원 식별·저장·전송 없이 브라우저 안에서만 돌아갑니다.";
const URL = "https://joowonkoh.com/playground/gaebari-glare";

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

export default function GaebariGlarePage() {
  return (
    <main>
      <GlareGame />
    </main>
  );
}
