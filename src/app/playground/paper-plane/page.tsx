import type { Metadata } from "next";
import PaperPlaneGame from "./PaperPlaneGame";

export const metadata: Metadata = {
  title: "종이비행기 날리기",
  description:
    "비행기 뒤에서 보는 시점으로, 드래그 발사 + 마이크 입김으로 더 멀리 날리는 미니게임.",
};

export default function PaperPlanePage() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center text-sm text-text-muted">
      게임을 불러오는 중…
      <PaperPlaneGame />
    </main>
  );
}
