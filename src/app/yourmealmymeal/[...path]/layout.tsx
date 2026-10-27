import "../../globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import YourMealMyMealDocument, { documentMetadata } from "../Document";
import { isLang, type Lang } from "../i18n";

/**
 * 한국어를 뺀 11개 언어(`/yourmealmymeal/en`, `/en/privacy` …)의 루트 레이아웃.
 * 주소의 첫 조각이 언어라서 그것으로 `<html lang>` 을 단다. 어떤 주소를 미리 만들지는 page.tsx 의
 * generateStaticParams 가 정하고, 목록에 없는 주소는 404 다(dynamicParams = false).
 */

interface Props {
  children: ReactNode;
  params: Promise<{ path: string[] }>;
}

async function langOf(params: Props["params"]): Promise<Lang> {
  const first = (await params).path[0];
  // 목록 밖 주소는 page.tsx 가 404 로 돌리므로 여기 값은 쓰이지 않는다 — 그래도 타입은 맞춰 둔다.
  return isLang(first) ? first : "en";
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  return documentMetadata(await langOf(params));
}

export default async function YourMealMyMealLocalizedLayout({ children, params }: Props) {
  return <YourMealMyMealDocument lang={await langOf(params)}>{children}</YourMealMyMealDocument>;
}
