import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import type { LinkKey } from "./copy/types";
import { pagePath, type Lang } from "./i18n";

const CONTACT = "contact@joowonkoh.com";

/** 링크 이름 → 주소와 모양. 사이트 안 주소는 언어를 따라간다. */
function target(key: LinkKey, lang: Lang, mailSubject?: string): { href: string; internal: boolean; underline: boolean } {
  switch (key) {
    case "contact":
      return { href: `mailto:${CONTACT}`, internal: false, underline: false };
    case "deleteMail":
      return {
        href: `mailto:${CONTACT}${mailSubject ? `?subject=${encodeURIComponent(mailSubject)}` : ""}`,
        internal: false,
        underline: true,
      };
    case "google":
      return { href: "https://policies.google.com/technologies/partner-sites", internal: false, underline: false };
    case "privacy":
      return { href: pagePath(lang, "/privacy"), internal: true, underline: true };
    case "deleteAccount":
      return { href: pagePath(lang, "/delete-account"), internal: true, underline: true };
  }
}

const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\((contact|privacy|deleteAccount|google|deleteMail)\)/g;

/**
 * 사전 글 한 줄을 그린다. `**굵게**` 와 `[글](링크 이름)` 두 가지만 안다(copy/types.ts).
 * 개인정보처리방침을 언어마다 JSX 로 따로 쓰지 않고 글로만 두려고 만든 작은 꾸밈 규칙이다.
 */
export default function Rich({ text, lang, mailSubject }: { text: string; lang: Lang; mailSubject?: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <strong key={m.index} className="text-text-primary">
          {m[1]}
        </strong>,
      );
    } else {
      const t = target(m[3] as LinkKey, lang, mailSubject);
      const className = t.underline
        ? "font-medium text-accent underline underline-offset-4"
        : "text-accent hover:underline";
      out.push(
        t.internal ? (
          <Link key={m.index} className={className} href={t.href}>
            {m[2]}
          </Link>
        ) : (
          <a key={m.index} className={className} href={t.href}>
            {m[2]}
          </a>
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}
