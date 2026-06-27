export type Section = "dev" | "life";

export const SECTIONS: Section[] = ["dev", "life"];

export const SECTION_LABELS: Record<Section, string> = {
  dev: "Dev",
  life: "Life",
};

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  section: Section;
  /** When true, the post is excluded from search indexing (robots noindex + sitemap). */
  noindex?: boolean;
}

export function postHref(post: Pick<PostMeta, "section" | "slug">): string {
  return `/blog/${post.section}/${post.slug}`;
}
