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
    <div>
      <h1 className="text-[22px] font-bold">Blog</h1>
      <p className="mt-1 text-sm text-text-muted">
        개발, 일상, 생각을 기록합니다.
      </p>
      <div className="mt-6">
        <TagFilter tags={tags} selected={selectedTag} onChange={setSelectedTag} />
      </div>
      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        {filtered.map((post) => (
          <PostItem key={post.slug} post={post} />
        ))}
        {filtered.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-text-muted">
            아직 글이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
