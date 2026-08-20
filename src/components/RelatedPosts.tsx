import Link from "next/link";
import type { PostMeta } from "@/lib/sections";
import { postHref } from "@/lib/sections";

/**
 * 같은 주제를 다룬 다른 글.
 *
 * 아래 PostNavigation은 날짜순 이전/다음이라 주제가 이어지지 않는다.
 * 터미널 이야기를 읽다가 다음 글로 넘어가면 맛집 후기가 나오는 식이다.
 * 읽던 흐름을 이어 주는 건 날짜가 아니라 겹치는 태그다.
 *
 * 겹치는 글이 없으면 lib/mdx의 getRelatedPosts가 빈 배열을 주고,
 * 여기서 아무것도 그리지 않는다.
 */
export default function RelatedPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-4 text-[11px] font-semibold tracking-[0.15em] text-text-muted uppercase">
        같이 읽으면 좋은 글
      </h2>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={`${post.section}/${post.slug}`}>
            <Link
              href={postHref(post)}
              className="group block rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:scale-[1.01] hover:shadow-ambient-hover"
            >
              <h3 className="text-sm font-semibold text-text-primary spring-transition group-hover:text-accent">
                {post.title}
              </h3>
              {post.description && (
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed break-keep text-text-secondary">
                  {post.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-tag-bg px-2.5 py-0.5 text-[10px] font-medium text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
                <span className="ml-auto text-xs text-text-muted">
                  {post.date.replace(/-/g, ".")}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
