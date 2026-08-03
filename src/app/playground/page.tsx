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
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        사이드 프로젝트 모음
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
    </div>
  );
}
