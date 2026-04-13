import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "개발자 고주원 — 새로운 도구와 워크플로우를 만들고, 그 과정을 공유합니다.",
  alternates: {
    canonical: "https://joowonkoh.com/about",
  },
};

const TECH_STACK = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Tailwind CSS",
  "Python",
  "PostgreSQL",
  "Cloudflare",
];

const FOCUS_AREAS = [
  {
    title: "AI 코딩 워크플로우",
    body: "Claude Code, Codex, Gemini CLI 같은 에이전트 기반 도구를 실무 흐름에 녹여내는 방법을 연구하고 정리합니다. oh-my-claudecode 프로젝트도 이 관심사의 연장선입니다.",
  },
  {
    title: "터미널과 개발자 생산성",
    body: "tmux, fzf, ripgrep, cmux, Warp 같은 도구로 매일의 개발 환경을 다듬는 것을 좋아합니다. 작은 자동화가 모여 큰 차이를 만든다고 믿습니다.",
  },
  {
    title: "프론트엔드 & 디자인 시스템",
    body: "Next.js · Tailwind · MDX 기반의 정적 사이트와 디자인 시스템을 직접 만들고 운영합니다. 이 블로그 자체가 하나의 실험장입니다.",
  },
  {
    title: "기록과 공유",
    body: "직접 부딪히며 배운 것을 글, 코드, 오픈소스로 남기는 것에 가치를 둡니다. 누군가의 검색 결과 한 줄을 줄여줄 수 있다면 충분하다고 생각합니다.",
  },
];

const TIMELINE = [
  {
    period: "2026 —",
    title: "joowonkoh.com 운영",
    body: "개인 블로그와 실험 공간을 직접 설계·개발하여 운영 중입니다. MDX 기반의 콘텐츠 파이프라인과 자동화된 빌드 흐름을 갖추고 있습니다.",
  },
  {
    period: "2025 —",
    title: "oh-my-claudecode 메인테이너",
    body: "Claude Code를 중심으로 한 에이전트 워크플로우 도구 모음을 만들고 공개합니다. 슬래시 커맨드, 스킬, MCP 서버 통합을 다룹니다.",
  },
  {
    period: "이전",
    title: "백엔드 · 풀스택 개발",
    body: "다양한 규모의 서비스에서 백엔드와 풀스택 개발을 경험했습니다. 사용자에게 직접 닿는 인터페이스를 만드는 일에 가장 큰 즐거움을 느낍니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        About
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        고주원 · Joowon Koh
      </h1>
      <p className="mt-4 max-w-[60ch] leading-[1.85] text-text-secondary">
        안녕하세요. 새로운 것을 만들고, 그 과정에서 배운 것을 글로 남기는 개발자
        고주원입니다. AI 코딩 도구, 터미널 워크플로우, 그리고 직접 만드는 작은
        제품들에 가장 많은 시간을 씁니다. 이 사이트는 제가 매일 사용하는 도구와
        실험을 기록하는 공간입니다.
      </p>
      <p className="mt-3 max-w-[60ch] leading-[1.85] text-text-secondary">
        모든 글은 실제로 직접 사용해 보고, 막혔던 부분과 해결한 과정을 가능한
        한 솔직하게 적으려고 합니다. 검색해서 들어오신 분이 단 한 줄이라도 시간을
        아끼셨다면, 이 블로그의 목적은 충분히 달성된 것이라고 생각합니다.
      </p>

      <section className="mt-14">
        <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          What I Focus On
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FOCUS_AREAS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient"
            >
              <h3 className="mb-2 font-display text-base font-semibold text-text-primary">
                {item.title}
              </h3>
              <p className="text-sm leading-[1.7] text-text-secondary">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Timeline
        </h2>
        <ol className="space-y-5 border-l border-border pl-6">
          {TIMELINE.map((item) => (
            <li key={item.title} className="relative">
              <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
                {item.period}
              </p>
              <h3 className="mt-1 font-display text-base font-semibold text-text-primary">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-[1.7] text-text-secondary">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
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
        <p className="max-w-[55ch] text-sm leading-[1.8] text-text-secondary">
          협업 제안, 질문, 오타 제보 모두 환영합니다. 아래 채널 중 편한 곳으로
          연락 주세요. 가능한 한 빠르게 답장드리려고 노력합니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-5">
          <a
            href="https://github.com/joowonkoh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            GitHub →
          </a>
          <a
            href="mailto:hello@joowonkoh.com"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            hello@joowonkoh.com →
          </a>
          <Link
            href="/privacy"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            개인정보처리방침 →
          </Link>
        </div>
      </section>
    </div>
  );
}
