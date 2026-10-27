"use client";

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-6">
      <div className="max-w-xs rounded-2xl bg-card-bg p-6 text-center shadow-ambient animate-fade-in-up">
        <div className="text-3xl">🐱🛩️</div>
        <h3 className="mt-3 font-display text-lg font-bold">놀이 방법</h3>
        <ol className="mt-3 space-y-2 text-left text-sm text-text-secondary">
          <li>1. 비행기를 <b>뒤로 당겼다 놓아</b> 발사하세요.</li>
          <li>2. 비행 중 <b>마이크에 훅~ 불어</b> 더 멀리 보내세요!</li>
          <li>3. 최고 기록을 리더보드에 남겨보세요.</li>
        </ol>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white spring-transition hover:scale-[1.02] active:scale-[0.98]"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
