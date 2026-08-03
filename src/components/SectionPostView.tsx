import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import mdxComponents from "@/components/MDXComponents";
import AdSense from "@/components/AdSense";
import PostNavigation from "@/components/PostNavigation";
import TableOfContents from "@/components/TableOfContents";
import type { PostMeta } from "@/lib/mdx";

interface Props {
  meta: PostMeta;
  content: string;
  prev: PostMeta | null;
  next: PostMeta | null;
}

export default function SectionPostView({ meta, content, prev, next }: Props) {
  return (
    <div className="relative flex gap-0">
      <aside className="hidden xl:block w-0">
        <div className="sticky top-32 -ml-60 w-52">
          <TableOfContents content={content} />
        </div>
      </aside>
      <article className="animate-fade-in-up min-w-0 flex-1">
        <header className="mb-10">
          <div className="flex flex-wrap gap-2">
            {meta.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-accent-soft px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
            {meta.title}
          </h1>
          <span className="mt-3 block text-sm text-text-muted">
            {meta.date.replace(/-/g, ".")}
          </span>
        </header>

        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{
            // next-mdx-remote 6부터 기본으로 켜지는 blockJS가 MDX 안의 JS 표현식을
            // 전부 제거한다. 그러면 <DataTableCard rows={[...]} />에서 rows가 사라져
            // 컴포넌트는 호출되는데 props만 비어 있는 상태가 된다. 에러도 안 나고
            // 표만 조용히 없어져서, 글 열한 편의 표가 한동안 안 보이고 있었다.
            //
            // 이 옵션은 남의 MDX를 렌더할 때를 위한 것이다. 여기서 읽는 건 내가 쓴
            // content/ 폴더뿐이라 끈다. 위험한 호출을 막는 blockDangerousJS는
            // 기본값 그대로 켜 둔다.
            blockJS: false,
            mdxOptions: {
              rehypePlugins: [[rehypePrettyCode, { theme: "github-light" }]],
            },
          }}
        />
        <AdSense />
        <PostNavigation prev={prev} next={next} />
      </article>
    </div>
  );
}
