import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-base font-bold text-text-primary">
          JK
        </Link>
        <div className="flex gap-5">
          <Link href="/blog" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Blog
          </Link>
          <Link href="/playground" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Playground
          </Link>
          <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
