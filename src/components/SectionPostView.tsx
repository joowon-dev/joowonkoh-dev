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
            mdxOptions: {
              rehypePlugins: [[rehypePrettyCode, { theme: "github-light" }]],
            },
          }}
        />
        <AdSense adSlot="1234567890" />
        <PostNavigation prev={prev} next={next} />
      </article>
    </div>
  );
}
