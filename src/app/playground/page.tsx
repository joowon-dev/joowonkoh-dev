import { visibleProjects } from "@/lib/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "직접 만들어 본 웹 미니게임과 도구 모음.",
  alternates: { canonical: "https://joowonkoh.com/playground" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: "Playground — Joowon Koh",
    description: "직접 만들어 본 웹 미니게임과 도구 모음.",
    url: "https://joowonkoh.com/playground",
  },
};

export default function PlaygroundPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Side Projects
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        Playground
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        사이드 프로젝트 모음
      </p>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 stagger-children">
        {visibleProjects.map((project) => {
          const isExternal = project.href.startsWith("http");
          return (
          <a
            key={project.title}
            href={project.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="group overflow-hidden rounded-2xl border border-border bg-card-bg shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex h-28 items-center justify-center bg-tag-bg">
              <span className="font-display text-2xl font-bold text-text-muted/40">
                {project.title.charAt(0)}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-display text-sm font-semibold text-text-primary group-hover:text-accent spring-transition">
                {project.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-tag-bg px-2.5 py-0.5 text-[10px] font-medium text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </a>
          );
        })}
      </div>
    </div>
  );
}
