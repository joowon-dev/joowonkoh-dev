"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import PostItem from "@/components/PostItem";
import TagFilter from "@/components/TagFilter";
import Pagination from "@/components/Pagination";
import type { PostMeta, Section } from "@/lib/sections";
import { SECTION_LABELS } from "@/lib/sections";

const SECTION_DESCRIPTIONS: Record<Section, string[]> = {
  dev: [
    "개발 도구와 워크플로우에 대한 글을 모았습니다. AI 코딩 에이전트를 실무에 붙이는 법, 터미널과 셸 환경을 다듬는 법, 그리고 이 블로그를 포함해 직접 만든 것들을 굴리며 겪은 문제가 대부분입니다.",
    "공식 문서를 요약하는 글은 쓰지 않습니다. 전부 제 맥북에서 실제로 실행해 보고, 안 되면 왜 안 됐는지까지 적습니다. 설정 파일과 명령어는 그대로 복사해서 쓸 수 있게 통째로 올려 둡니다.",
  ],
  life: [
    "일상에서 직접 겪은 것들을 기록합니다. 지금은 맛집과 베이커리 후기가 대부분입니다.",
    "직접 가서 제 돈으로 먹고, 그 자리에서 찍은 사진만 씁니다. 협찬이나 초대를 받은 적은 아직 없습니다. 가격과 영업시간은 다녀온 날 기준이라 가시기 전에 한 번 더 확인하시는 편이 안전합니다.",
  ],
};

const PAGE_SIZE = 10;

export default function SectionList({
  section,
  posts,
  tags,
}: {
  section: Section;
  posts: PostMeta[];
  tags: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  /*
   * 주소에 걸린 태그는 붙은 다음에 읽는다.
   *
   * useSearchParams로 읽으면 이 컴포넌트가 Suspense 경계 안으로 들어가고,
   * 서버가 내보내는 HTML에서 글 목록이 통째로 빠진다. 배포하고 나서야 알았다 —
   * /blog/dev가 머리말과 꼬리말만 남은 19단어짜리 페이지가 되어 있었다.
   *
   * 서버(page.tsx)에서 searchParams로 받는 방법도 안 된다. 받는 순간 라우트가
   * 동적이 되는데, 목록을 만드는 함수가 fs로 content/를 읽어서 Cloudflare
   * edge에서는 돌지 않는다.
   *
   * 그래서 첫 화면은 전체 목록을 그대로 내보내고 태그는 나중에 건다. 걸러진
   * 목록이 잠깐 전체로 보였다 좁혀지는데, 목록 페이지에서는 그쪽이 맞는 방향의
   * 손해다 — 빈 화면보다 전체 목록이 낫다.
   */
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tag");
    // 주소창은 리액트 밖의 상태고, window는 그릴 때가 아니라 붙은 뒤에만 있다.
    // useState 초기값으로 넣으면 서버에서도 실행돼 하이드레이션이 어긋난다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (fromUrl && tags.includes(fromUrl)) setSelectedTag(fromUrl);
  }, [tags]);

  const filtered = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    setPage(1);
    // scroll: false — 태그만 바꿨는데 화면이 맨 위로 튀면 고르던 자리를 잃는다
    router.replace(tag ? `${pathname}?tag=${encodeURIComponent(tag)}` : pathname, {
      scroll: false,
    });
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        {SECTION_LABELS[section]}
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        Blog · {SECTION_LABELS[section]}
      </h1>
      {SECTION_DESCRIPTIONS[section].map((paragraph) => (
        <p
          key={paragraph}
          className="mt-3 max-w-[58ch] text-sm leading-[1.8] break-keep text-text-secondary"
        >
          {paragraph}
        </p>
      ))}
      <p className="mt-4 text-xs text-text-muted">
        지금까지 {posts.length}개 · 태그로 걸러 보실 수 있습니다
      </p>
      <div className="mt-8">
        <TagFilter
          tags={tags}
          selected={selectedTag}
          onChange={handleTagChange}
        />
      </div>
      <div className="mt-6 space-y-3 stagger-children">
        {paged.map((post) => (
          <PostItem key={post.slug} post={post} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-text-muted">
            아직 글이 없습니다.
          </p>
        )}
      </div>
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onChange={handlePageChange}
      />
    </div>
  );
}
