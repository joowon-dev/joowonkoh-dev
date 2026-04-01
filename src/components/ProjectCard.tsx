import type { Project } from "@/lib/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-border bg-card-bg p-5 transition-colors hover:border-text-muted"
    >
      <h3 className="text-sm font-semibold text-text-primary">
        {project.title}
      </h3>
      <p className="mt-1 text-xs text-text-muted">{project.description}</p>
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
    </a>
  );
}
