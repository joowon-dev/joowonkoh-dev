import type { CSSProperties, ReactNode } from "react";

import { appStoreUrl, playStoreUrl, type Lang } from "./i18n";
import { C } from "./palette";

/* 스토어 주소는 언어마다 조금 다르다(i18n.ts 의 appStoreUrl·playStoreUrl). */

/** 사과 모양(직접 그린 단순 도형). */
function AppleGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill={color} aria-hidden>
      <path d="M12 7.2c-1.3-1.1-3.6-1.4-5.2-.2C4.6 8.6 4.4 12.4 5.9 15.6c1 2.2 2.6 4.6 4.3 4.3.7-.1 1.1-.5 1.8-.5s1.1.4 1.8.5c1.7.3 3.3-2.1 4.3-4.3.4-.9.7-1.9.8-2.8-1.6-.6-2.6-2.1-2.6-3.8 0-1.3.6-2.4 1.6-3.1-1.6-1.4-4.1-1.1-5.9.3Z" />
      <path d="M12.4 6.2c.1-1.9 1.4-3.5 3.3-3.9.1 1.9-1.3 3.6-3.3 3.9Z" />
    </svg>
  );
}

/** 재생 삼각형(직접 그린 단순 도형). */
function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[20px] w-[20px]" aria-hidden>
      <path d="M4.5 3.2 14 12l-9.5 8.8c-.4-.2-.6-.6-.6-1.1V4.3c0-.5.2-.9.6-1.1Z" fill="#35D0FF" />
      <path d="M14 12 4.5 3.2c.3-.1.7-.1 1.1.1l11 6.1L14 12Z" fill="#3BE17A" />
      <path d="M14 12l2.6 2.6-11 6.1c-.4.2-.8.2-1.1.1L14 12Z" fill="#FF4A5C" />
      <path d="M16.6 9.4 19.8 11.2c.9.5.9 1.2 0 1.7l-3.2 1.7L14 12l2.6-2.6Z" fill="#FFD233" />
    </svg>
  );
}

function StoreButton({
  href,
  glyph,
  store,
  dark,
  compact,
  download,
}: {
  href: string;
  glyph: ReactNode;
  store: string;
  dark: boolean;
  compact: boolean;
  download: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`flex ${compact ? "h-[var(--store-h,48px)]" : "h-[54px]"} min-w-0 flex-1 items-center justify-center gap-2.5 rounded-full px-4 transition-transform hover:-translate-y-0.5 active:translate-y-0`}
      style={
        dark
          ? { background: "#000000", color: "#FFFFFF" }
          : { background: C.surface, color: "#000000", border: `1px solid ${C.hairline}` }
      }
    >
      {glyph}
      <span className="flex flex-col items-start leading-none">
        <span className="text-[10px] opacity-75">{download}</span>
        <span className="mt-[3px] whitespace-nowrap text-[16px] font-semibold tracking-[-0.01em]">{store}</span>
      </span>
    </a>
  );
}

/**
 * App Store(검정) · Google Play(흰색) 알약 버튼 한 줄. 공식 배지처럼 흑백으로 둔다.
 * compact 는 한 화면에 다 들어가야 하는 초대 페이지용 — 조금 낮고, 화면 높이를 따라 더 낮아진다.
 */
export default function StoreButtons({
  lang,
  download,
  className = "",
  compact = false,
  style,
}: {
  lang: Lang;
  /** 스토어 이름 위의 작은 글 — "다운로드". */
  download: string;
  className?: string;
  compact?: boolean;
  /** compact 일 때 `--store-h` 로 높이를 바꿀 수 있다. */
  style?: CSSProperties;
}) {
  return (
    <div className={`flex w-full gap-2.5 ${className}`} style={style}>
      <StoreButton href={appStoreUrl(lang)} glyph={<AppleGlyph color="#FFFFFF" />} store="App Store" dark compact={compact} download={download} />
      <StoreButton href={playStoreUrl(lang)} glyph={<PlayGlyph />} store="Google Play" dark={false} compact={compact} download={download} />
    </div>
  );
}
