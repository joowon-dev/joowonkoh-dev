import type { Metadata } from "next";
import SectionList from "@/components/SectionList";
import { getAllPostsBySection, getPopularTagsBySection } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Blog · Life",
  description: "일상에서 직접 겪은 것들을 기록합니다. 맛집, 베이커리, 여행.",
  alternates: { canonical: "https://joowonkoh.com/blog/life" },
};

export default function LifeSectionPage() {
  const posts = getAllPostsBySection("life");
  const tags = getPopularTagsBySection("life");
  return <SectionList section="life" posts={posts} tags={tags} />;
}
