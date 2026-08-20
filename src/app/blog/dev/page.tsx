import { Suspense } from "react";
import type { Metadata } from "next";
import SectionList from "@/components/SectionList";
import { getAllPostsBySection, getPopularTagsBySection } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Blog · Dev",
  description: "개발 도구, 워크플로우, 그리고 만드는 과정을 기록합니다.",
  alternates: { canonical: "https://joowonkoh.com/blog/dev" },
};

export default function DevSectionPage() {
  const posts = getAllPostsBySection("dev");
  const tags = getPopularTagsBySection("dev");
  // SectionList가 useSearchParams로 ?tag=를 읽는다. 경계가 없으면 빌드가 막힌다.
  return (
    <Suspense fallback={null}>
      <SectionList section="dev" posts={posts} tags={tags} />
    </Suspense>
  );
}
