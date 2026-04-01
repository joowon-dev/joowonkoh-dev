import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";
import { projects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="pb-10">
        <h1 className="text-[28px] font-bold">고주원</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
          Developer & Creator
          <br />
          새로운 것을 만들고 공유합니다.
        </p>
      </section>

      {/* Featured Projects */}
      <section className="pb-10">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Featured Projects
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </section>

      {/* Recent Posts */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Recent Posts
        </h2>
        <div className="overflow-hidden rounded-lg border border-border">
          {recentPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0 hover:bg-card-bg transition-colors"
            >
              <span className="text-sm text-text-primary">{post.title}</span>
              <span className="text-xs text-text-muted">
                {post.date.replace(/-/g, ".")}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
