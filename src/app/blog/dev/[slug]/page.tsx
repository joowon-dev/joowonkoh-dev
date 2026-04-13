import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SectionPostView from "@/components/SectionPostView";
import {
  getAllPostsBySection,
  getPostBySlugFromSection,
} from "@/lib/mdx";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPostsBySection("dev");
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = getPostBySlugFromSection("dev", slug);
    const url = `https://joowonkoh.com/blog/dev/${slug}`;
    return {
      title: meta.title,
      description: meta.description,
      openGraph: {
        type: "article",
        title: meta.title,
        description: meta.description,
        url,
        siteName: "Joowon Koh",
        locale: "ko_KR",
        publishedTime: meta.date,
        authors: ["고주원"],
        images: [{ url: "/logo.png", width: 512, height: 512, alt: meta.title }],
      },
      twitter: {
        card: "summary",
        title: meta.title,
        description: meta.description,
        images: ["/logo.png"],
      },
      alternates: { canonical: url },
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function DevPostPage({ params }: Props) {
  const { slug } = await params;

  let post: ReturnType<typeof getPostBySlugFromSection>;
  try {
    post = getPostBySlugFromSection("dev", slug);
  } catch {
    notFound();
  }

  const allPosts = getAllPostsBySection("dev");
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prev =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const next = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  return (
    <SectionPostView
      meta={post!.meta}
      content={post!.content}
      prev={prev}
      next={next}
    />
  );
}
