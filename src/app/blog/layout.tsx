import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "개발, 일상, 생각을 기록합니다.",
  // 하위 페이지(/blog/dev·/blog/life·글 상세)는 각자 자기 canonical을 지정한다.
  alternates: { canonical: "https://joowonkoh.com/blog" },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
