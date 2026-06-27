import type { PostMeta } from "@/lib/sections";

const SITE_URL = "https://joowonkoh.com";
const AUTHOR = "고주원";

interface Props {
  meta: PostMeta;
}

/**
 * Renders schema.org BlogPosting structured data for a blog post.
 * Helps search engines and AI understand the page as an article with
 * a headline, author, and publish date.
 */
export default function ArticleJsonLd({ meta }: Props) {
  const url = `${SITE_URL}/blog/${meta.section}/${meta.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    inLanguage: "ko-KR",
    keywords: meta.tags.join(", "),
    image: `${SITE_URL}/logo.png`,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Person",
      name: AUTHOR,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR,
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
