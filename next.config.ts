import fs from "fs";
import path from "path";
import type { NextConfig } from "next";

/**
 * 글 주소가 예전에는 /blog/<슬러그>였다. 개발과 일상을 섹션으로 나누면서
 * /blog/dev/<슬러그>, /blog/life/<슬러그>로 옮겼는데 옛 주소를 그대로 끊어 놨다.
 *
 * 서치 콘솔에 404가 11개 잡혀 있었고 대부분이 이 옛 주소였다. 이미 색인돼
 * 있던 글들이라 검색에서 들어오던 사람이 빈 화면을 맞고 있었다는 뜻이다.
 *
 * 목록을 손으로 적지 않고 content/에서 만든다. 손으로 적으면 구글이 알려준
 * 열한 개만 덮게 되는데, 실제로 밖에 나가 있는 옛 주소는 그보다 많다.
 * 글이 늘어도 이 함수가 알아서 따라간다.
 */
function postRedirects() {
  const root = path.join(process.cwd(), "content");
  const sections = ["dev", "life"] as const;
  const seen = new Set<string>();
  const redirects: { source: string; destination: string; permanent: boolean }[] =
    [];

  for (const section of sections) {
    const dir = path.join(root, section);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".mdx")) continue;

      const name = file.replace(/\.mdx$/, "");
      const slug = name.match(/^(\d+)/)?.[1];
      if (!slug) continue;

      const destination = `/blog/${section}/${slug}`;

      // 숫자만 쓴 옛 주소와, 파일 이름을 그대로 쓴 옛 주소 둘 다 들어와 있다
      for (const source of [`/blog/${slug}`, `/blog/${name}`]) {
        if (seen.has(source)) continue;
        seen.add(source);
        redirects.push({ source, destination, permanent: true });
      }
    }
  }

  return redirects;
}

/**
 * 위 규칙으로 안 잡히는 것들. 글 번호가 바뀌었거나 주소 모양이 아예 달랐다.
 *
 * /blog/my-app-hotfix는 여기 없다. 대응하는 글이 남아 있지 않아서, 아무 데로나
 * 보내는 대신 404를 그대로 둔다. 없어진 글에는 404가 맞는 답이다.
 */
const MOVED: { source: string; destination: string }[] = [
  // 이미지 압축 글. 04-05-02로 냈다가 04-21-02로 다시 번호를 매겼다
  {
    source: "/blog/2026040502-blog-image-compression",
    destination: "/blog/dev/2026042102",
  },
  // 상태줄 글이 한동안 최상위 주소에 있었다
  { source: "/statusline", destination: "/blog/dev/2026040302" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      ...postRedirects(),
      ...MOVED.map((m) => ({ ...m, permanent: true })),
    ];
  },
};

export default nextConfig;
