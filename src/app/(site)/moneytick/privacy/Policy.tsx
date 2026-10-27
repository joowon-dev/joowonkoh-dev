import type { Metadata } from "next";
import type { ReactNode } from "react";

import { LANG_INFO, languageAlternates, pagePath, redirectScript, type Lang } from "../i18n";
import LanguagePicker from "../LanguagePicker";
import { LANDING } from "../copy";
import { PRIVACY } from "./copy";
import type { Block } from "./copy/types";

/**
 * 이게내연봉 개인정보처리방침 — 언어만 다르고 모양은 하나다.
 *
 * 앱의 설정 화면과 스토어가 한국어 주소(`/moneytick/privacy`)를 가리키므로, 그
 * 주소에서도 브라우저 언어를 보고 해당 번역으로 보낸다.
 */

const CONTACT = "contact@joowonkoh.com";

export function policyMetadata(lang: Lang): Metadata {
  const p = PRIVACY[lang];
  return {
    title: p.meta.title,
    description: p.meta.description,
    alternates: {
      canonical: `https://joowonkoh.com${pagePath(lang, "/privacy")}`,
      languages: languageAlternates("/privacy"),
    },
  };
}

const STRONG = "text-text-primary";
const LINK = "text-accent hover:underline";

/** `**굵게**`, `[글자](주소)`, `{email}` 만 알아듣는 아주 작은 변환기. */
function rich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)|\{email\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = m.index;
    if (m[1] !== undefined) {
      out.push(
        <strong key={key} className={STRONG}>
          {m[1]}
        </strong>,
      );
    } else if (m[2] !== undefined) {
      out.push(
        <a key={key} className={LINK} href={m[3]} target="_blank" rel="noopener noreferrer">
          {m[2]}
        </a>,
      );
    } else {
      out.push(
        <a key={key} className={LINK} href={`mailto:${CONTACT}`}>
          {CONTACT}
        </a>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function BlockView({ block, first }: { block: Block; first: boolean }) {
  if (Array.isArray(block)) {
    return (
      <ul className={`ml-5 list-disc space-y-1.5 ${first ? "" : "mt-3"}`}>
        {block.map((item, i) => (
          <li key={i}>{rich(item)}</li>
        ))}
      </ul>
    );
  }
  return <p className={first ? "" : "mt-3"}>{rich(block)}</p>;
}

export default function Policy({ lang }: { lang: Lang }) {
  const p = PRIVACY[lang];
  const info = LANG_INFO[lang];

  return (
    <div lang={info.tag} className="animate-fade-in-up">
      {lang === "ko" && (
        <script dangerouslySetInnerHTML={{ __html: redirectScript("/privacy") }} />
      )}
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
          {p.badge}
        </span>
        <LanguagePicker lang={lang} sub="/privacy" label={LANDING[lang].languageLabel} />
      </div>
      <h1
        className={`font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl ${
          info.keepAll ? "break-keep" : ""
        }`}
      >
        {p.title}
      </h1>
      <p className="mt-3 text-sm text-text-muted">{p.updated}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        {p.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">{s.h}</h2>
            {s.body.map((b, i) => (
              <BlockView key={i} block={b} first={i === 0} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
