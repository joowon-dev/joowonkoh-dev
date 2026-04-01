import Link from "next/link";
import type { PostMeta } from "@/lib/mdx";

export default function PostItem({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 hover:bg-card-bg transition-colors"
    >
      <div>
        <h3 className="text-[15px] font-semibold text-text-primary">
          {post.title}
        </h3>
        <p className="mt-1 text-sm text-text-muted line-clamp-1">
          {post.description}
        </p>
        <div className="mt-2 flex gap-1">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <span className="shrink-0 text-xs text-text-muted">
        {post.date.replace(/-/g, ".")}
      </span>
    </Link>
  );
}
