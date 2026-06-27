"use client";

import { useState } from "react";
import PostItem from "@/components/PostItem";
import TagFilter from "@/components/TagFilter";
import Pagination from "@/components/Pagination";
import type { PostMeta, Section } from "@/lib/sections";
import { SECTION_LABELS } from "@/lib/sections";

const SECTION_DESCRIPTIONS: Record<Section, string> = {
  dev: "개발, 도구, 워크플로우에 대한 글을 모았습니다.",
  life: "일상에서 직접 겪은 것들을 기록합니다. 맛집, 베이커리, 여행.",
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {SECTION_DESCRIPTIONS[section]}
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
