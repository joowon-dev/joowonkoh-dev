"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Item = { href: string; label: string; color: string; icon: React.ReactNode };

const ITEMS: Item[] = [
  { href: "/admin", label: "오늘", color: "var(--ink)", icon: <IconHome /> },
  { href: "/admin/sns", label: "승인", color: "var(--apps)", icon: <IconCheck /> },
  { href: "/admin/web", label: "웹", color: "var(--web)", icon: <IconWeb /> },
  { href: "/admin/apps", label: "앱", color: "var(--apps)", icon: <IconApps /> },
  { href: "/admin/instagram", label: "인스타", color: "var(--insta)", icon: <IconInsta /> },
  { href: "/admin/data", label: "원본", color: "var(--ink)", icon: <IconTable /> },
];

/** 기간(range/from/to)은 화면을 옮겨도 유지한다. 나머지 쿼리(탭 등)는 화면마다 다르니 버린다. */
function periodQuery(params: URLSearchParams): string {
  const keep = new URLSearchParams();
  for (const key of ["range", "from", "to"]) {
    const value = params.get(key);
    if (value) keep.set(key, value);
  }
  const qs = keep.toString();
  return qs ? `?${qs}` : "";
}

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminSidebar({ email, signOut }: { email: string; signOut: React.ReactNode }) {
  const pathname = usePathname();
  const qs = periodQuery(useSearchParams());

  return (
    <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-[var(--rule)] px-4 py-6 lg:flex">
      <p className="px-3 text-[15px] font-semibold tracking-tight">joowonkoh.com 관리</p>
      <nav className="mt-8 flex flex-col gap-1" aria-label="관리 화면">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href + qs}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--paper-raised)] font-semibold shadow-[inset_3px_0_0_var(--nav-color)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--paper-raised)] hover:text-[var(--ink)]"
              }`}
              style={{ "--nav-color": item.color } as React.CSSProperties}
            >
              <span style={{ color: active ? item.color : undefined }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-3 text-xs text-[var(--ink-faint)]">
        <p className="truncate">{email}</p>
        <div className="mt-2">{signOut}</div>
      </div>
    </aside>
  );
}

export function AdminTabBar() {
  const pathname = usePathname();
  const qs = periodQuery(useSearchParams());

  return (
    <nav
      aria-label="관리 화면"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--rule)] bg-[var(--paper)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-6">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href + qs}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                  active ? "font-semibold" : "text-[var(--ink-faint)]"
                }`}
                style={{ color: active ? item.color : undefined }}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// 아이콘은 20px 선 그림. 라이브러리를 들일 만큼 많지 않다.
function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
function IconHome() {
  return <Svg><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></Svg>;
}
function IconCheck() {
  return <Svg><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 12.5l2.8 2.8L16.5 9" /></Svg>;
}
function IconWeb() {
  return <Svg><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></Svg>;
}
function IconApps() {
  return <Svg><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></Svg>;
}
function IconInsta() {
  return <Svg><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" /></Svg>;
}
function IconTable() {
  return <Svg><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M3 14h18M9 9v11" /></Svg>;
}
