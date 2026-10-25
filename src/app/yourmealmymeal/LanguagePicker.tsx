"use client";

import { useRouter } from "next/navigation";

import { LANG_INFO, LANGS, pagePath, STORAGE_KEY, type Lang, type Sub } from "./i18n";
import { C } from "./palette";

/**
 * 언어 고르기. 12개라 기본 `<select>` 를 알약 모양으로만 다듬었다 — 휴대폰에서는 운영체제의 선택 시트가 뜬다.
 *
 * 고른 언어를 기억해 둔다. 다음에 한국어 주소로 들어와도 브라우저 언어 대신 이걸 따라간다(redirectScript).
 * 주소 뒤의 `?code=…` 는 그대로 들고 간다 — 초대 페이지에서 언어를 바꿔도 코드가 남아야 한다.
 * `?lang=` 은 떼어 낸다. 남아 있으면 고른 언어보다 그쪽이 먼저라 도로 돌아간다.
 */
export default function LanguagePicker({
  lang,
  sub,
  label,
  className = "",
  compact = false,
}: {
  lang: Lang;
  sub: Sub;
  label: string;
  className?: string;
  /** 지구본과 언어 약자(EN)만 보인다. 누르면 똑같이 운영체제 선택 시트가 뜬다 — 초대 페이지 구석용. */
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{label}</span>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute left-2.5 h-3.5 w-3.5"
        fill="none"
        stroke={C.sub}
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
          const q = new URLSearchParams(window.location.search);
          q.delete("lang");
          const search = q.toString();
          router.push(`${pagePath(next, sub)}${search ? `?${search}` : ""}${window.location.hash}`);
        }}
        className={`cursor-pointer appearance-none rounded-full py-1 pl-7 pr-6 text-[12px] font-medium outline-none focus-visible:ring-2 ${
          compact ? "absolute inset-0 opacity-0" : ""
        }`}
        style={{ background: "rgba(46,30,20,0.06)", color: C.sub }}
      >
        {LANGS.map((l) => (
          <option key={l} value={l} lang={LANG_INFO[l].tag}>
            {LANG_INFO[l].label}
          </option>
        ))}
      </select>
      {compact ? (
        <span
          aria-hidden
          className="pointer-events-none rounded-full py-1 pl-7 pr-6 text-[11px] font-semibold uppercase tracking-[0.04em]"
          style={{ background: "rgba(46,30,20,0.06)", color: C.sub }}
        >
          {lang === "zh-hans" ? "简" : lang === "zh-hant" ? "繁" : lang}
        </span>
      ) : null}
      <svg
        aria-hidden
        viewBox="0 0 10 6"
        className="pointer-events-none absolute right-2.5 h-1.5 w-2.5"
        fill="none"
        stroke={C.sub}
        strokeWidth="1.4"
      >
        <path d="M1 1l4 4 4-4" />
      </svg>
    </label>
  );
}
