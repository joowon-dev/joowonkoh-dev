import type { Metadata } from "next";
import Portfolio from "@/components/portfolio/Portfolio";

export const metadata: Metadata = {
  title: "Portfolio — 고주원",
  description:
    "풀스택 개발자 고주원의 포트폴리오. 130만 대국민 서비스부터 실사용자 1만+의 개인 서비스까지, 분석부터 운영까지 직접 만듭니다.",
  alternates: {
    canonical: "https://joowonkoh.com/portfolio",
  },
  openGraph: {
    title: "Portfolio — 고주원 · Joowon Koh",
    description:
      "130만 대국민 서비스부터 실사용자 1만+의 개인 서비스까지 — 분석부터 운영까지 직접 끌고 가는 풀스택 개발자.",
    url: "https://joowonkoh.com/portfolio",
  },
};

export default function PortfolioPage() {
  return <Portfolio />;
}
