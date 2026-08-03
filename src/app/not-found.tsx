import Link from "next/link";
import type { Metadata } from "next";
import { visibleProjects } from "@/lib/projects";

/**
 * 없는 주소로 들어왔을 때.
 *
 * 기본 404는 "404 | This page could not be found." 한 줄이라 막다른 길이 된다.
 * 여기서 나갈 문을 몇 개 열어 두는 편이 낫다 — 특히 검색으로 들어와 오타나
 * 옮겨진 주소를 만난 사람에게는.
 */
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  // 없는 주소가 색인되면 검색 결과에 빈 페이지가 남는다
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/blog", label: "블로그", hint: "개발 기록과 일상" },
  { href: "/playground", label: "플레이그라운드", hint: "직접 만든 웹 미니게임" },
  { href: "/about", label: "소개", hint: "제가 누구고 무엇을 하는지" },
];

export default function NotFound() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium tracking-[0.15em] text-accent uppercase">
        404
      </span>
      <h1 className="font-display text-3xl leading-snug font-bold tracking-tight md:text-4xl">
        이 주소에는 아무것도 없습니다
      </h1>
      <p className="mt-3 max-w-[55ch] text-sm leading-relaxed break-keep text-text-secondary">
        주소가 잘못됐거나, 글이 옮겨졌거나, 제가 지웠을 수도 있습니다. 아래에서
        원하시던 곳으로 가실 수 있습니다.
      </p>

      <nav className="mt-10 flex flex-col gap-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-baseline gap-3 rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:scale-[1.01] hover:shadow-ambient-hover active:scale-[0.99]"
          >
            <span className="font-display text-sm font-semibold text-text-primary spring-transition group-hover:text-accent">
              {link.label}
            </span>
            <span className="text-xs text-text-secondary">{link.hint}</span>
            <span aria-hidden className="ml-auto text-sm text-text-muted">
              →
            </span>
          </Link>
        ))}
      </nav>

      {visibleProjects.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-[11px] font-semibold tracking-[0.15em] text-text-muted uppercase">
            바로 놀아보기
          </h2>
          <ul className="flex flex-wrap gap-2">
            {visibleProjects
              .filter((p) => !p.href.startsWith("http"))
              .map((project) => (
                <li key={project.href}>
                  <Link
                    href={project.href}
                    className="inline-block rounded-full border border-border bg-card-bg px-4 py-2 text-sm text-text-primary shadow-ambient spring-transition hover:text-accent hover:shadow-ambient-hover"
                  >
                    {project.title}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
