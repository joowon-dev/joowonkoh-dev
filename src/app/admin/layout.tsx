import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// 이 레이아웃은 껍데기만 담당한다. 권한 판정은 (protected) 그룹의 레이아웃이
// 한다. 로그인·거부 페이지까지 여기서 막으면 리다이렉트가 순환한다.
//
// 동적 렌더링과 edge 런타임 선언도 (protected)로 내렸다. 로그인·거부 페이지는
// 서버에서 읽을 것이 없어 정적으로 두는 편이 낫다.
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
