"use client";

import { useRouter } from "next/navigation";

import { LANG_INFO, LANGS, pagePath, STORAGE_KEY, type Lang } from "./i18n";

/**
 * 언어 고르기.
 *
 * 12개라 버튼으로 늘어놓으면 첫 화면을 다 먹는다 — 기본 `<select>` 를 알약 모양으로만
 * 다듬었다. 휴대폰에서는 운영체제의 선택 시트가 뜬다.
 *
 * 고른 언어를 기억해 둔다. 다음에 한국어 주소로 들어와도 브라우저 언어 대신 이걸
 * 따라간다(`redirectScript`). 한국어를 고르면 한국어에 머문다.
 */
export default function LanguagePicker({
  lang,
  sub = "",
  label,
}: {
  lang: Lang;
  sub?: "" | "/privacy";
  label: string;
}) {
  const router = useRouter();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[rgba(60,60,67,0.6)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <circle cx="8" cy="8" r="6.5" />
        <path d="M1.5 8h13M8 1.5c2 2 2.8 4 2.8 6.5S10 12.5 8 14.5C6 12.5 5.2 10.5 5.2 8S6 3.5 8 1.5Z" />
      </svg>
      <select
        value={lang}
        onChange={(e) => {
          const next = e.target.value as Lang;
          try {
            localStorage.setItem(STORAGE_KEY, next);
          } catch {
            // 사생활 보호 모드 등에서 막혀도 이번 이동은 된다.
          }
          router.push(pagePath(next, sub));
        }}
        className="cursor-pointer appearance-none rounded-full bg-[rgba(118,118,128,0.12)] py-1.5 pl-8 pr-8 text-[13px] font-medium tracking-[-0.08px] text-[rgba(60,60,67,0.85)] outline-none spring-transition hover:bg-[rgba(118,118,128,0.18)] focus-visible:ring-2 focus-visible:ring-[#34C759]"
      >
        {LANGS.map((l) => (
          <option key={l} value={l} lang={LANG_INFO[l].tag}>
            {LANG_INFO[l].label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 10 6"
        className="pointer-events-none absolute right-3 h-1.5 w-2.5 text-[rgba(60,60,67,0.5)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M1 1l4 4 4-4" />
      </svg>
    </label>
  );
}
