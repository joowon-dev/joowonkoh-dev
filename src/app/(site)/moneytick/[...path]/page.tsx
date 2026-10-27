import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLang, OTHER_LANGS, type Lang } from "../i18n";
import Landing, { landingMetadata } from "../Landing";
import Policy, { policyMetadata } from "../privacy/Policy";

/**
 * 한국어를 뺀 11개 언어 — `/moneytick/en` 과 `/moneytick/en/privacy`.
 *
 * 두 주소를 `[lang]/page.tsx` 와 `[lang]/privacy/page.tsx` 로 나누지 않고 하나로 받는다.
 * 클라우드플레어 빌드(next-on-pages)는 **주소가 동적 조각으로 끝나야만** "다 미리
 * 만들어 둔 페이지" 로 봐 준다. `/[lang]/privacy` 는 `privacy` 로 끝나서 서버 함수로
 * 취급되고, edge 런타임이 아니라며 빌드가 멈춘다(2026-10-22). 나머지 주소 전체를 받는
 * `[...path]` 는 그 조건에 맞는다.
 *
 * 빌드 때 22장을 전부 만들어 두고, 목록에 없는 주소는 404 다.
 */

interface Props {
  params: Promise<{ path: string[] }>;
}

type Page = { lang: Lang; privacy: boolean };

function parse(path: string[]): Page | null {
  const [lang, sub, ...rest] = path;
  if (!isLang(lang) || lang === "ko" || rest.length > 0) return null;
  if (sub === undefined) return { lang, privacy: false };
  if (sub === "privacy") return { lang, privacy: true };
  return null;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return OTHER_LANGS.flatMap((lang) => [{ path: [lang] }, { path: [lang, "privacy"] }]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = parse((await params).path);
  if (!page) return {};
  return page.privacy ? policyMetadata(page.lang) : landingMetadata(page.lang);
}

export default async function MoneyTickLocalizedPage({ params }: Props) {
  const page = parse((await params).path);
  if (!page) notFound();
  return page.privacy ? <Policy lang={page.lang} /> : <Landing lang={page.lang} />;
}
