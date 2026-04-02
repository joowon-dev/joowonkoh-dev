import Link from "next/link";
import type { PostMeta } from "@/lib/mdx";

interface PostNavigationProps {
  prev: PostMeta | null;
  next: PostMeta | null;
}

export default function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-16 grid grid-cols-2 gap-4">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01]"
        >
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            이전 글
          </span>
          <p className="mt-1.5 text-sm font-semibold text-text-primary group-hover:text-accent spring-transition line-clamp-2">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          className="group rounded-2xl border border-border bg-card-bg p-5 text-right shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01]"
        >
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            다음 글
          </span>
          <p className="mt-1.5 text-sm font-semibold text-text-primary group-hover:text-accent spring-transition line-clamp-2">
            {next.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
