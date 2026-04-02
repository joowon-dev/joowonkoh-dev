import type { Project } from "@/lib/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-border bg-card-bg p-6 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.02] active:scale-[0.98]"
    >
      <h3 className="font-display text-sm font-semibold text-text-primary group-hover:text-accent spring-transition">
        {project.title}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
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
    </a>
  );
}
