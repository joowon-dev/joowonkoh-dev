import Link from "next/link";
import AppIcon from "@/components/AppIcon";
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
      <p className="mt-4 max-w-[58ch] leading-[1.85] break-keep text-text-secondary">
        블로그에 도구 이야기만 쓰다 보면 손이 근질거려서, 배운 것을 그때그때
        작은 것으로 만들어 봅니다. 여기 있는 것들은 전부 브라우저에서 바로
        열리고, 설치도 로그인도 회원가입도 필요 없습니다.
      </p>
      <p className="mt-3 max-w-[58ch] leading-[1.85] break-keep text-text-secondary">
        게임 엔진이나 물리 라이브러리를 쓰지 않고 충돌 계산부터 직접 짠 것이
        많습니다. 라이브러리를 얹으면 빨리 끝나지만 왜 되는지는 안 남아서요.
        아래에 각각 무엇이고 안에서 무엇이 돌아가는지 적어 두었습니다.
      </p>
      {/*
        폰 홈 화면처럼 아이콘을 늘어놓는다.
        설명글을 타일 밑에 붙이지 않는다 — 한 줄씩 다는 순간 앱 아이콘이 아니라
        다시 카드 목록이 된다. 대신 aria-label과 title에 넣어 두어 읽어주기와
        마우스 툴팁에서는 그대로 살아 있다.
      */}
      <ul className="mt-10 grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 sm:gap-x-6 md:grid-cols-5 stagger-children">
        {visibleProjects.map((project) => {
          const isExternal = project.href.startsWith("http");
          return (
            <li key={project.title}>
              <a
                href={project.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                title={project.description}
                aria-label={`${project.title} — ${project.description}`}
                className="group flex flex-col items-center gap-2 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <span className="block w-full spring-transition group-hover:-translate-y-1 group-hover:scale-[1.04] group-active:scale-[0.95]">
                  <AppIcon project={project} />
                </span>
                <span className="text-center text-[11px] leading-tight font-medium break-keep text-text-secondary group-hover:text-accent spring-transition">
                  {project.title}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      {/*
        타일 밑에는 설명을 안 붙이는 대신 여기에 몰아서 쓴다. 아이콘 격자는
        격자대로 두고, 읽고 싶은 사람은 내려와서 읽으면 된다.
      */}
      <section className="mt-16">
        <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
          무엇을 만들었나
        </h2>
        <div className="mt-6 space-y-4">
          {visibleProjects
            .filter((project) => project.blurb)
            .map((project) => {
              const isExternal = project.href.startsWith("http");
              return (
                <article
                  key={project.title}
                  className="rounded-2xl border border-border bg-card-bg p-6 shadow-ambient"
                >
                  <h3 className="font-display text-base font-semibold text-text-primary">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    {project.description}
                  </p>
                  <p className="mt-3 text-sm leading-[1.8] break-keep text-text-secondary">
                    {project.blurb}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <a
                      href={project.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
                    >
                      열어 보기 →
                    </a>
                    <span className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-tag-bg px-2.5 py-0.5 text-[10px] font-medium text-text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </div>
                </article>
              );
            })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
          만드는 과정은 블로그에
        </h2>
        <p className="mt-3 max-w-[58ch] text-sm leading-[1.8] break-keep text-text-secondary">
          여기 있는 것들을 만들면서 막혔던 지점은 대부분 글로 따로 남겼습니다.
          한글 조합 중간 상태를 오타로 세지 않는 법, 이미지 압축 파이프라인,
          Cloudflare 빌드 캐시가 말썽부린 기록 같은 것들입니다.
        </p>
        <Link
          href="/blog/dev"
          className="mt-4 inline-block text-sm font-medium text-text-secondary spring-transition hover:text-accent"
        >
          개발 글 보러 가기 →
        </Link>
      </section>
    </div>
  );
}
