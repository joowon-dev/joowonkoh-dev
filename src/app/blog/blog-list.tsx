"use client";

import { useState } from "react";
import PostItem from "@/components/PostItem";
import TagFilter from "@/components/TagFilter";
import type { PostMeta } from "@/lib/mdx";

export default function BlogList({ posts, tags }: { posts: PostMeta[]; tags: string[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filtered = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts;

  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Archive
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        Blog
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        개발, 일상, 생각을 기록합니다.
      </p>
      <div className="mt-8">
        <TagFilter tags={tags} selected={selectedTag} onChange={setSelectedTag} />
      </div>
      <div className="mt-6 space-y-3 stagger-children">
        {filtered.map((post) => (
          <PostItem key={post.slug} post={post} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-text-muted">
            아직 글이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
