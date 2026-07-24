import type { Metadata } from "next";
import PaperPlaneGame from "./PaperPlaneGame";

export const metadata: Metadata = {
  title: "종이비행기 날리기",
  description: "고양이가 탄 종이비행기를 드래그로 발사하고 입김으로 더 멀리 날려보세요.",
};

export default function PaperPlanePage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Mini Game
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        종이비행기 날리기
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        🐱 고양이가 탄 종이비행기를 드래그로 발사하고, 마이크에 훅~ 불어 더 멀리 보내보세요.
      </p>
      <div className="mt-8">
        <PaperPlaneGame />
      </div>
    </div>
  );
}
