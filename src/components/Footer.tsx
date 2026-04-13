import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto mt-24 max-w-3xl px-6 pb-12">
      <div className="rounded-2xl border border-border bg-card-bg/60 px-6 py-6 shadow-ambient backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            © {year} Joowon Koh. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-5 text-xs">
            <Link
              href="/about"
              className="font-medium text-text-secondary spring-transition hover:text-accent"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="font-medium text-text-secondary spring-transition hover:text-accent"
            >
              개인정보처리방침
            </Link>
            <a
              href="mailto:hello@joowonkoh.com"
              className="font-medium text-text-secondary spring-transition hover:text-accent"
            >
              Contact
            </a>
            <a
              href="https://github.com/joowonkoh"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-text-secondary spring-transition hover:text-accent"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
