import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "개발자 고주원 소개",
};

export default function AboutPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        About
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        고주원
      </h1>
      <p className="mt-4 max-w-[55ch] leading-[1.8] text-text-secondary">
        안녕하세요, 개발자 고주원입니다.
        <br />
        새로운 것을 만들고 공유하는 것을 좋아합니다.
      </p>

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS"].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border bg-card-bg px-4 py-2 text-sm font-medium text-text-primary shadow-ambient spring-transition hover:shadow-ambient-hover"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Contact
        </h2>
        <div className="flex gap-5">
          <a
            href="https://github.com/joowonkoh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            GitHub
          </a>
          <a
            href="mailto:hello@joowonkoh.dev"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            Email
          </a>
        </div>
      </section>
    </div>
  );
}
