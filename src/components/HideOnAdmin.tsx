"use client";

import { usePathname } from "next/navigation";

/** 사이트 크롬(푸터 등)을 /admin 에서만 빼는 얇은 껍데기. 어드민은 자체 셸을 쓴다. */
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
