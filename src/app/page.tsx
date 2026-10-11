import type { Metadata } from "next";
import Link from "next/link";
import {
  getListedPostsBySection,
  getPopularTagsBySection,
  SECTION_LABELS,
} from "@/lib/mdx";
import { visibleProjects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";
import PostItem from "@/components/PostItem";

// 제목·설명·OG는 루트 레이아웃 값을 그대로 쓴다. canonical만 홈 주소로 지정한다.
export const metadata: Metadata = {
  alternates: { canonical: "https://joowonkoh.com" },
};

/**
 * 홈에서 소개하는 주제. 블로그 태그와 1:1로 맞물려 있어서, 카드를 누르면
 * 그 주제의 글 목록으로 바로 간다. 설명은 실제로 그 태그에 쌓인 글에서
 * 뽑은 것이라 글이 없는 주제를 광고하지 않는다.
 */
const TOPICS: { title: string; body: string; href: string }[] = [
  {
    title: "게임과 시각화를 직접 짜며 배운 것",
    body: "코인 밀기 추첨기가 공정한지 300판을 돌려 카이제곱으로 재 보고, 포수 시점 공은 구종마다 곡선을 깎는 대신 중력·항력·마그누스를 적분했습니다. 물리 라이브러리를 얹지 않고 왜 그렇게 움직이는지까지 남깁니다.",
    href: "/blog/dev?tag=게임",
  },
  {
    title: "데스크톱 앱과 브라우저 입력 다루기",
    body: "일하는 화면 위에 얹히는 야구 게임이 전역 단축키를 시스템에 빼앗긴 일, 두 번째 모니터로 창이 못 넘어가던 좌표계, 자리를 비우면 창을 점령하는 맥 앱. 출시한 앱에서 실제로 막혔던 지점들입니다.",
    href: "/blog/dev?tag=데스크톱",
  },
  {
    title: "AI 코딩 도구를 실무에 붙이기",
    body: "Claude Code의 Plan Mode, Hooks, CLAUDE.md, statusline, /compact와 /clear. 문서를 옮겨 적는 대신 매일 쓰는 흐름에 넣어 보고, 어디서 토큰이 새는지·어느 지점에서 사람이 다시 붙어야 하는지 적습니다.",
    href: "/blog/dev?tag=Claude+Code",
  },
];

export default function Home() {
  const devPosts = getListedPostsBySection("dev");
  const lifePosts = getListedPostsBySection("life");
  const recentDev = devPosts.slice(0, 5);
  const recentLife = lifePosts.slice(0, 3);
  const devTags = getPopularTagsBySection("dev").slice(0, 12);
  const totalPosts = devPosts.length + lifePosts.length;

  return (
    <div className="stagger-children">
      {/* Hero */}
      <section className="animate-fade-in-up pb-16">
        <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
          Developer &amp; Creator
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          고주원
        </h1>
        <p className="mt-4 max-w-[58ch] leading-[1.85] break-keep text-text-secondary">
          안녕하세요, 개발자 고주원입니다. 낮에는 130만 명이 쓰는 서비스를
          만들고, 밤에는 제 이름을 건 작은 제품을 만듭니다. 이 사이트는 그
          과정에서 실제로 써 본 도구와 직접 부딪힌 문제를 기록해 두는
          공간입니다.
        </p>
        <p className="mt-3 max-w-[58ch] leading-[1.85] break-keep text-text-secondary">
          지금까지 {totalPosts}개의 글을 썼습니다. 대부분은 직접 만든 게임과
          데스크톱 앱을 짜면서 부딪힌 문제, 그리고 AI 코딩 도구를 실무에 붙인
          기록이고, 나머지는 직접 가 보고 남긴 맛집
          기록입니다. 어느 쪽이든 남이 쓴 소개를 옮기지 않고, 제가 켜 보고
          막히고 고친 순서 그대로 적습니다. 검색해서 들어오신 분이 한 줄이라도
          시간을 아끼셨다면 그걸로 충분하다고 생각합니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-5 text-sm">
          <Link
            href="/blog"
            className="font-medium text-text-secondary spring-transition hover:text-accent"
          >
            글 전체 보기 →
          </Link>
          <Link
            href="/about"
            className="font-medium text-text-secondary spring-transition hover:text-accent"
          >
            제가 누구인지 →
          </Link>
        </div>
      </section>

      {/* 무엇을 쓰는가 */}
      <section className="animate-fade-in-up pb-16">
        <h2 className="mb-2 font-display text-xl font-bold tracking-tight md:text-2xl">
          이 사이트에서 다루는 것
        </h2>
        <p className="mb-6 max-w-[58ch] text-sm leading-relaxed break-keep text-text-secondary">
          크게 세 갈래입니다. 각 카드를 누르면 그 주제로 쌓인 글만 모아서 볼 수
          있습니다.
        </p>
        <div className="space-y-4">
          {TOPICS.map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="group block rounded-2xl border border-border bg-card-bg p-6 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01]"
            >
              <h3 className="font-display text-base font-semibold text-text-primary spring-transition group-hover:text-accent">
                {topic.title}
              </h3>
              <p className="mt-2 text-sm leading-[1.75] break-keep text-text-secondary">
                {topic.body}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Posts — Dev */}
      <section className="animate-fade-in-up pb-16">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
            최근 개발 글
          </h2>
          <Link
            href="/blog/dev"
            className="text-xs font-medium text-text-secondary spring-transition hover:text-accent"
          >
            {devPosts.length}개 전체 보기 →
          </Link>
        </div>
        <div className="space-y-3">
          {recentDev.map((post) => (
            <PostItem key={post.slug} post={post} />
          ))}
        </div>

        {devTags.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
              주제로 찾기
            </h3>
            <ul className="flex flex-wrap gap-2">
              {devTags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/blog/dev?tag=${encodeURIComponent(tag)}`}
                    className="inline-block rounded-full border border-border bg-card-bg px-3.5 py-1.5 text-xs text-text-secondary shadow-ambient spring-transition hover:text-accent hover:shadow-ambient-hover"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Recent Posts — Life */}
      {recentLife.length > 0 && (
        <section className="animate-fade-in-up pb-16">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
              최근 {SECTION_LABELS.life} 글
            </h2>
            <Link
              href="/blog/life"
              className="text-xs font-medium text-text-secondary spring-transition hover:text-accent"
            >
              {lifePosts.length}개 전체 보기 →
            </Link>
          </div>
          <p className="mb-5 max-w-[58ch] text-sm leading-relaxed break-keep text-text-secondary">
            직접 가서 먹고 찍은 것만 올립니다. 협찬이나 초대를 받은 적은 아직
            없고, 사진도 전부 그날 제가 찍은 것입니다. 보정한 사진을 쓴 글은
            본문에 그렇게 적어 둡니다.
          </p>
          <div className="space-y-3">
            {recentLife.map((post) => (
              <PostItem key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects */}
      <section className="animate-fade-in-up">
        <h2 className="mb-2 font-display text-xl font-bold tracking-tight md:text-2xl">
          직접 만든 것들
        </h2>
        <p className="mb-6 max-w-[58ch] text-sm leading-relaxed break-keep text-text-secondary">
          글로만 쓰지 않고 실제로 만들어 봅니다. 브라우저에서 바로 열리는
          것들이라 설치 없이 눌러 보시면 됩니다. 만드는 과정은 대부분 블로그에
          따로 적어 두었습니다.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
        <Link
          href="/playground"
          className="mt-6 inline-block text-sm font-medium text-text-secondary spring-transition hover:text-accent"
        >
          플레이그라운드 전체 보기 →
        </Link>
      </section>
    </div>
  );
}
