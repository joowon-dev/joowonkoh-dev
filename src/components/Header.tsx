"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/blog", label: "Blog" },
  // 메뉴에서는 감추지만 /portfolio 페이지 자체는 살아 있다.
  // 현재 섹션 이름을 찾는 데는 계속 쓰이므로 목록에서 지우지 않고 표시만 끈다.
  { href: "/portfolio", label: "Portfolio", hidden: true },
  { href: "/playground", label: "Playground" },
  { href: "/about", label: "About" },
];

const VISIBLE_NAV_ITEMS = NAV_ITEMS.filter((i) => !i.hidden);

function getCurrentLabel(pathname: string) {
  const item = NAV_ITEMS.find((i) => pathname.startsWith(i.href));
  return item?.label ?? "Home";
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentLabel = getCurrentLabel(pathname);

  return (
    <>
      <header className="sticky top-0 z-40">
        <div className="mx-auto max-w-3xl px-6 pt-4 pb-3">
          <nav className="flex items-center justify-between rounded-full border border-border bg-card-bg/80 px-6 py-3 shadow-ambient backdrop-blur-xl spring-transition">
            <Link
              href="/"
              className="flex items-center gap-2 spring-transition hover:opacity-70"
            >
              <Image
                src="/logo.png"
                alt="Joowon Koh"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="font-display text-base font-bold text-text-primary">
                JOOWON
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden gap-6 sm:flex">
              {VISIBLE_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium spring-transition ${
                    pathname.startsWith(item.href)
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile: current page + hamburger */}
            <div className="flex items-center gap-3 sm:hidden">
              <span className="text-sm font-medium text-accent">
                {currentLabel}
              </span>
              <button
                onClick={() => setOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-tag-bg spring-transition"
                aria-label="메뉴 열기"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-card-bg shadow-ambient-hover animate-fade-in-up p-6">
            <div className="flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-tag-bg spring-transition"
                aria-label="메뉴 닫기"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-6">
              {[{ href: "/", label: "Home" }, ...VISIBLE_NAV_ITEMS].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`text-lg font-semibold spring-transition ${
                    (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
