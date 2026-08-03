import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// 지표는 매 요청 최신이어야 한다. 정적화되면 어제 숫자가 굳는다.
export const dynamic = "force-dynamic";

// 이 레이아웃은 껍데기만 담당한다. 권한 판정은 (protected) 그룹의 레이아웃이
// 한다. 로그인·거부 페이지까지 여기서 막으면 리다이렉트가 순환한다.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {children}
    </div>
  );
}
