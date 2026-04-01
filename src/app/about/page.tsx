import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "개발자 고주원 소개",
};

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-[22px] font-bold">About</h1>
      <p className="mt-4 leading-7 text-text-secondary">
        안녕하세요, 개발자 고주원입니다.
        <br />
        새로운 것을 만들고 공유하는 것을 좋아합니다.
      </p>

      <section className="mt-10">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS"].map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-border bg-card-bg px-3 py-1.5 text-sm text-text-primary"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Contact
        </h2>
        <div className="flex gap-4">
          <a
            href="https://github.com/joowonkoh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:hello@joowonkoh.dev"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Email
          </a>
        </div>
      </section>
    </div>
  );
}
