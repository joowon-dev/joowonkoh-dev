import type { Metadata, Viewport } from "next";
import { Barlow_Semi_Condensed } from "next/font/google";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef2f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1622" },
  ],
};

// 숫자 전용 글꼴. 좁은 폭이라 표 열이 많아도 모바일에서 버틴다.
const numeric = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin-num",
  display: "swap",
});

// 이 레이아웃은 껍데기만 담당한다. 권한 판정은 (protected) 그룹의 레이아웃이
// 한다. 로그인·거부 페이지까지 여기서 막으면 리다이렉트가 순환한다.
//
// 사이트 루트 레이아웃(Header · main 폭 제한 · Footer) 위에 전체 화면으로 덮는다.
// 플레이그라운드 풀스크린 앱과 같은 방식이다. Header/Footer 는 /admin 에서 렌더하지 않는다.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`admin-root ${numeric.variable} fixed inset-0 z-[60] overflow-y-auto font-sans antialiased`}>
      {children}
    </div>
  );
}
