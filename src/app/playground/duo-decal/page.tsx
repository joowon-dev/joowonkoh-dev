import type { Metadata } from "next";
import Link from "next/link";

import "./duo.css";
import DuoStudio from "./DuoStudio";

const TITLE = "듀오 데칼코마니 — 접었다 펴면 반쪽이 찍혀 나오는 폴더블";
const DESCRIPTION =
  "사진을 올리면 iPhone Duo 처럼 생긴 폴더블 화면에 뜨고, 끝까지 접었다 펴면 한쪽이 반대쪽에 거울처럼 찍혀 나옵니다. 데칼코마니가 된 사진은 그대로 저장할 수 있어요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/duo-decal" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://joowonkoh.com/playground/duo-decal",
  },
};

export default function DuoDecalPage() {
  return (
    // 애플 제품 페이지처럼 보이도록 사이트 헤더·푸터 없이 그린다(HideOnAdmin 의 OWN_SHELL).
    <div className="duo-page min-h-[100dvh]">
      <nav className="duo-localnav" aria-label="듀오 데칼코마니">
        <div className="duo-localnav-inner">
          <span className="duo-localnav-title">Duo 데칼코마니</span>
          <div className="duo-localnav-actions">
            <Link href="/playground" className="duo-navpill duo-navpill-ghost">
              놀이터
            </Link>
            <label htmlFor="duo-file" className="duo-navpill duo-navpill-blue">
              사진 올리기
            </label>
          </div>
        </div>
      </nav>

      <header className="px-4 pt-14 pb-10 text-center sm:pt-20">
        <p className="duo-eyebrow">Duo 데칼코마니</p>
        <h1 className="duo-h1 mt-3">닮았어요, 닮았어요.</h1>
        <p className="duo-sub mx-auto mt-5 max-w-[34ch] break-keep">
          접는 순간 반쪽이 반대쪽에 찍힙니다. 펼치면 데칼코마니.
        </p>
      </header>

      <section className="duo-alt px-4 pt-14 pb-24 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="duo-h2 mb-8 px-2 sm:mb-12 sm:px-8">접어서 찍어보기.</h2>
          <DuoStudio />
        </div>

        <div className="duo-buybar mt-10">
          <div className="duo-buybar-inner">
            <span>₩0부터</span>
            <label htmlFor="duo-file" className="duo-navpill duo-navpill-blue">
              사진 올리기
            </label>
          </div>
        </div>
      </section>

      <footer className="duo-alt border-t border-black/10 px-4 py-6">
        <p className="duo-footnote mx-auto max-w-[980px]">
          팬이 만든 비공식 놀이 페이지입니다. Apple 및 iPhone은 Apple Inc.의 상표이며, 이 페이지는 Apple과 관련이 없습니다.
          기기는 CSS로 다시 그린 것이고, 올린 사진은 이 브라우저 밖으로 나가지 않아요.
        </p>
      </footer>
    </div>
  );
}
