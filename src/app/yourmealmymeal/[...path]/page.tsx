import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLang, OTHER_LANGS, type Lang } from "../i18n";
import { joinMetadata } from "../join/metadata";
import Join from "../join/Join";
import Landing, { landingMetadata } from "../Landing";
import Legal, { legalMetadata } from "../Legal";

/**
 * 한국어를 뺀 11개 언어 — `/yourmealmymeal/en`, `/en/join`, `/en/privacy`, `/en/delete-account`.
 *
 * 이게내연봉(`moneytick/[...path]`)과 같은 까닭으로 `[lang]/join/page.tsx` 처럼 나누지 않고 하나로 받는다:
 * 클라우드플레어 빌드(next-on-pages)는 주소가 동적 조각으로 끝나야만 "미리 만들어 둔 페이지" 로 봐 준다.
 * 빌드 때 44장을 전부 만들어 두고, 목록에 없는 주소는 404 다.
 */

interface Props {
  params: Promise<{ path: string[] }>;
}

type Page = { lang: Lang; kind: "landing" | "join" | "privacy" | "deleteAccount" };

const KINDS: Record<string, Page["kind"]> = {
  join: "join",
  privacy: "privacy",
  "delete-account": "deleteAccount",
};

function parse(path: string[]): Page | null {
  const [lang, sub, ...rest] = path;
  if (!isLang(lang) || lang === "ko" || rest.length > 0) return null;
  if (sub === undefined) return { lang, kind: "landing" };
  const kind = KINDS[sub];
  return kind ? { lang, kind } : null;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return OTHER_LANGS.flatMap((lang) => [
    { path: [lang] },
    { path: [lang, "join"] },
    { path: [lang, "privacy"] },
    { path: [lang, "delete-account"] },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = parse((await params).path);
  if (!page) return {};
  if (page.kind === "landing") return landingMetadata(page.lang);
  if (page.kind === "join") return joinMetadata(page.lang);
  return legalMetadata(page.lang, page.kind);
}

export default async function YourMealMyMealLocalizedPage({ params }: Props) {
  const page = parse((await params).path);
  if (!page) notFound();
  if (page.kind === "landing") return <Landing lang={page.lang} />;
  if (page.kind === "join") return <Join lang={page.lang} />;
  return <Legal lang={page.lang} kind={page.kind} />;
}
