import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import mdxComponents from "@/components/MDXComponents";
import AdSense from "@/components/AdSense";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = getPostBySlug(slug);
    return {
      title: meta.title,
      description: meta.description,
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post: ReturnType<typeof getPostBySlug>;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{post!.meta.title}</h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-sm text-text-muted">
            {post!.meta.date.replace(/-/g, ".")}
          </span>
          <div className="flex gap-1">
            {post!.meta.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <MDXRemote
        source={post!.content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            rehypePlugins: [
              [rehypePrettyCode, { theme: "github-dark-default" }],
            ],
          },
        }}
      />
      <AdSense adSlot="1234567890" />
    </article>
  );
}
