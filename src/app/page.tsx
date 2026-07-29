import Link from "next/link";
import { getAllPosts, postHref } from "@/lib/mdx";
import { visibleProjects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <div className="stagger-children">
      {/* Hero */}
      <section className="animate-fade-in-up pb-16">
        <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
          Developer & Creator
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          고주원
        </h1>
        <p className="mt-3 max-w-[50ch] text-base leading-relaxed text-text-secondary">
          새로운 것을 만들고 공유합니다.
        </p>
      </section>

      {/* Featured Projects */}
      <section className="animate-fade-in-up pb-16">
        <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Featured Projects
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </section>

      {/* Recent Posts */}
      <section className="animate-fade-in-up">
        <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Recent Posts
        </h2>
        <div className="space-y-3">
          {recentPosts.map((post) => (
            <Link
              key={post.slug}
              href={postHref(post)}
              className="group block rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-text-primary group-hover:text-accent spring-transition">
                  {post.title}
                </span>
                <span className="text-xs text-text-muted">
                  {post.date.replace(/-/g, ".")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
