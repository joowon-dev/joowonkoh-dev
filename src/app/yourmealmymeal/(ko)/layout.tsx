import "../../globals.css";

import type { ReactNode } from "react";

import YourMealMyMealDocument, { documentMetadata } from "../Document";

/** 한국어 네밥내밥(`/yourmealmymeal`, `/join`, `/privacy`, `/delete-account`)의 루트 레이아웃 — `<html lang="ko">`. */
export const metadata = documentMetadata("ko");

export default function YourMealMyMealKoLayout({ children }: { children: ReactNode }) {
  return <YourMealMyMealDocument lang="ko">{children}</YourMealMyMealDocument>;
}
