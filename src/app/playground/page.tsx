import { projects } from "@/lib/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "사이드 프로젝트 모음",
};

export default function PlaygroundPage() {
  return (
    <div>
      <h1 className="text-[22px] font-bold">Playground</h1>
      <p className="mt-1 text-sm text-text-muted">사이드 프로젝트 모음</p>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {projects.map((project) => (
          <a
            key={project.title}
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-lg border border-border bg-card-bg transition-colors hover:border-text-muted"
          >
            <div className="flex h-24 items-center justify-center bg-tag-bg text-2xl">
              🚀
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-text-primary">
                {project.title}
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                {project.description}
              </p>
              <div className="mt-2 flex gap-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
