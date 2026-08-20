import type { Metadata } from "next";
import SectionList from "@/components/SectionList";
import { getAllPostsBySection, getPopularTagsBySection } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Blog · Life",
  description: "일상에서 직접 겪은 것들을 기록합니다. 맛집, 베이커리, 여행.",
  alternates: { canonical: "https://joowonkoh.com/blog/life" },
};

/** 정적으로 그려야 하는 이유와 ?tag=를 서버에서 안 읽는 이유는 dev 쪽에 적어 두었다. */
export default function LifeSectionPage() {
  const posts = getAllPostsBySection("life");
  const tags = getPopularTagsBySection("life");

  return <SectionList section="life" posts={posts} tags={tags} />;
}
