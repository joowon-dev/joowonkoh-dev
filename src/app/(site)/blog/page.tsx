import Link from "next/link";
import PostItem from "@/components/PostItem";
import {
  getAllPostsBySection,
  SECTION_LABELS,
  type Section,
} from "@/lib/mdx";

const HERO_COPY: Record<Section, string> = {
  dev: "개발 도구, 워크플로우, 그리고 만드는 과정을 기록합니다.",
  life: "일상에서 직접 겪은 것들 — 맛집, 베이커리, 여행.",
};

export default function BlogHomePage() {
  const sections: Section[] = ["dev", "life"];
  const postsBySection = sections.map((section) => ({
    section,
    posts: getAllPostsBySection(section),
  }));

  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Archive
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        Blog
      </h1>
      <p className="mt-2 max-w-[55ch] text-sm leading-relaxed text-text-secondary">
        개발과 일상을 두 개의 섹션으로 나누어 기록합니다. 섹션별로 모아 보시거나
        최근 글을 바로 확인해 보세요.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section}
            href={`/blog/${section}`}
            className="group rounded-2xl border border-border bg-card-bg p-6 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01]"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
              Section
            </span>
            <h2 className="mt-2 font-display text-xl font-bold text-text-primary group-hover:text-accent spring-transition">
              {SECTION_LABELS[section]}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {HERO_COPY[section]}
            </p>
            <span className="mt-4 inline-block text-xs font-medium text-text-muted">
              {getAllPostsBySection(section).length}개 글 →
            </span>
          </Link>
        ))}
      </div>

      {postsBySection.map(({ section, posts }) => (
        <section key={section} className="mt-16">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
              Latest in {SECTION_LABELS[section]}
            </h2>
            <Link
              href={`/blog/${section}`}
              className="text-xs font-medium text-text-secondary spring-transition hover:text-accent"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="space-y-3 stagger-children">
            {posts.slice(0, 4).map((post) => (
              <PostItem key={post.slug} post={post} />
            ))}
            {posts.length === 0 && (
              <p className="py-8 text-center text-sm text-text-muted">
                아직 글이 없습니다.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
