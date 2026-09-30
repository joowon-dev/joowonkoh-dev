import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminSidebar, AdminTabBar } from "@/components/admin/AdminNav";
import { checkAdmin } from "@/lib/admin/auth";
import SignOutButton from "./SignOutButton";

// 지표는 매 요청 최신이어야 한다. 정적화되면 어제 숫자가 굳는다.
export const dynamic = "force-dynamic";

// 배포는 Cloudflare Pages(@cloudflare/next-on-pages)라 서버 라우트가 전부
// edge 런타임이어야 한다. Node 런타임 라우트가 하나라도 있으면 빌드가 깨진다.
export const runtime = "edge";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const check = await checkAdmin();

  if (!check.ok) {
    redirect(check.reason === "no-session" ? "/admin/login" : "/admin/denied");
  }

  return (
    <div className="flex min-h-dvh">
      <Suspense>
        <AdminSidebar email={check.identity.email} signOut={<SignOutButton />} />
      </Suspense>
      {/* 하단 탭바 높이만큼 모바일에서 아래를 비운다 */}
      <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <Suspense>
        <AdminTabBar />
      </Suspense>
    </div>
  );
}
