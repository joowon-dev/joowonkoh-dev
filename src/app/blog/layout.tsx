import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "개발, 일상, 생각을 기록합니다.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
