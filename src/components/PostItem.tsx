import Link from "next/link";
import type { PostMeta } from "@/lib/sections";
import { postHref } from "@/lib/sections";

export default function PostItem({ post }: { post: PostMeta }) {
  return (
    <Link
      href={postHref(post)}
      className="group block rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01] active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-accent spring-transition">
            {post.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary line-clamp-1">
            {post.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-tag-bg px-2.5 py-0.5 text-[10px] font-medium text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <span className="shrink-0 text-xs text-text-muted">
          {post.date.replace(/-/g, ".")}
        </span>
      </div>
    </Link>
  );
}
