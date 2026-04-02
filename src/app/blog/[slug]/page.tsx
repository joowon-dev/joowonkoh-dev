import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import mdxComponents from "@/components/MDXComponents";
import AdSense from "@/components/AdSense";
import PostNavigation from "@/components/PostNavigation";
import TableOfContents from "@/components/TableOfContents";
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

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <div className="relative">
      <aside className="absolute -left-60 top-0 hidden xl:block">
        <TableOfContents content={post!.content} />
      </aside>
      <article className="animate-fade-in-up">
        <header className="mb-10">
        <div className="flex flex-wrap gap-2">
          {post!.meta.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-accent-soft px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
          {post!.meta.title}
        </h1>
        <span className="mt-3 block text-sm text-text-muted">
          {post!.meta.date.replace(/-/g, ".")}
        </span>
      </header>

      <MDXRemote
        source={post!.content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            rehypePlugins: [
              [rehypePrettyCode, { theme: "github-light" }],
            ],
          },
        }}
      />
      <AdSense adSlot="1234567890" />
      <PostNavigation prev={prevPost} next={nextPost} />
    </article>
    </div>
  );
}
