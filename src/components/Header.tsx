import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
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
          <div className="flex gap-6">
            <Link
              href="/blog"
              className="text-sm font-medium text-text-secondary spring-transition hover:text-text-primary"
            >
              Blog
            </Link>
            <Link
              href="/playground"
              className="text-sm font-medium text-text-secondary spring-transition hover:text-text-primary"
            >
              Playground
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-text-secondary spring-transition hover:text-text-primary"
            >
              About
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
