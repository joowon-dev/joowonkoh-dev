import type { Metadata } from "next";
import Link from "next/link";

import { COPY } from "./copy";
import type { Block } from "./copy/types";
import { languageAlternates, LANG_INFO, ORIGIN, pagePath, type Lang } from "./i18n";
import { CARD } from "./palette";
import RedirectScript from "./RedirectScript";
import Rich from "./Rich";

type Kind = "privacy" | "deleteAccount";
const SUB = { privacy: "/privacy", deleteAccount: "/delete-account" } as const;

/**
 * 개인정보처리방침·계정 삭제 안내의 머리 정보.
 * 한국어는 원래 있던 그대로(제목·설명·대표 주소)에 언어별 주소 목록만 더한다.
 */
export function legalMetadata(lang: Lang, kind: Kind): Metadata {
  const doc = COPY[lang][kind];
  const url = `${ORIGIN}${pagePath(lang, SUB[kind])}`;
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: url, languages: languageAlternates(SUB[kind]) },
    ...(lang === "ko"
      ? {}
      : {
          openGraph: {
            type: "website",
            locale: LANG_INFO[lang].ogLocale,
            siteName: COPY[lang].appName,
            title: doc.title,
            description: doc.description,
            url,
            images: [{ url: `${ORIGIN}/yourmealmymeal/og-main-v3.png`, width: 1200, height: 630 }],
          },
        }),
  };
}

function BlockView({ block, lang, mailSubject }: { block: Block; lang: Lang; mailSubject?: string }) {
  if ("p" in block) {
    return (
      <p>
        <Rich text={block.p} lang={lang} mailSubject={mailSubject} />
      </p>
    );
  }
  const items = "ul" in block ? block.ul : block.ol;
  const List = "ul" in block ? "ul" : "ol";
  return (
    <List className={`ml-5 space-y-1.5 ${"ul" in block ? "list-disc" : "list-decimal"}`}>
      {items.map((item, i) => (
        <li key={i}>
          <Rich text={item} lang={lang} mailSubject={mailSubject} />
        </li>
      ))}
    </List>
  );
}

/**
 * 개인정보처리방침·계정 삭제 안내 한 장. 글은 copy/<언어>.ts 에 있고 여기서는 틀만 그린다.
 * 한국어가 아닌 판에는 "어긋나면 한국어판이 우선한다" 는 한 줄과 한국어판 링크를 단다.
 */
export default function Legal({ lang, kind }: { lang: Lang; kind: Kind }) {
  const copy = COPY[lang];
  const doc = copy[kind];
  const mailSubject = kind === "deleteAccount" ? copy.deleteAccount.mailSubject : undefined;

  return (
    <div className="animate-fade-in-up">
      <RedirectScript lang={lang} sub={SUB[kind]} />
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">
        {copy.legal.badge}
      </span>
      <h1 className="font-display text-[28px] font-bold leading-[1.3] tracking-[-0.02em] md:text-[32px]">{doc.title}</h1>
      <p className="mt-3 text-sm text-text-muted">
        {copy.legal.updated}: {doc.updatedAt}
      </p>
      {lang === "ko" ? null : (
        <p className="mt-2 text-sm text-text-muted">
          {copy.legal.koreanPrevails}{" "}
          <Link className="font-medium text-accent underline underline-offset-4" href={`${pagePath("ko", SUB[kind])}?lang=ko`} lang="ko">
            {copy.legal.koreanLink}
          </Link>
        </p>
      )}

      <div
        className="mt-8 space-y-10 rounded-[28px] bg-white p-6 text-[15.5px] leading-[1.85] text-text-secondary sm:p-10"
        style={CARD}
      >
        {doc.sections.map((s) => (
          <section key={s.h}>
            <h2 className="mb-3 font-display text-[19px] font-bold text-text-primary">{s.h}</h2>
            <div className="space-y-3">
              {s.blocks.map((b, i) => (
                <BlockView key={i} block={b} lang={lang} mailSubject={mailSubject} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
