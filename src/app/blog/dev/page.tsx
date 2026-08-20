import type { Metadata } from "next";
import SectionList from "@/components/SectionList";
import { getAllPostsBySection, getPopularTagsBySection } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Blog · Dev",
  description: "개발 도구, 워크플로우, 그리고 만드는 과정을 기록합니다.",
  alternates: { canonical: "https://joowonkoh.com/blog/dev" },
};

/**
 * 이 페이지는 정적으로 미리 그려져야 한다. 목록이 곧 내용이라, 서버가 내보내는
 * HTML에 글이 다 들어 있어야 크롤러도 사람도 볼 것이 있다.
 *
 * 그래서 ?tag=를 서버에서 읽지 않는다. searchParams를 받는 순간 라우트가
 * 동적으로 바뀌고, 그러면 요청마다 getAllPostsBySection이 도는데 이 함수는
 * fs로 content/를 읽는다. Cloudflare에서 동적 라우트는 edge에서 도니 fs가 없다.
 * 태그를 거르는 일은 SectionList가 브라우저에서 주소를 보고 처리한다.
 */
export default function DevSectionPage() {
  const posts = getAllPostsBySection("dev");
  const tags = getPopularTagsBySection("dev");

  return <SectionList section="dev" posts={posts} tags={tags} />;
}
