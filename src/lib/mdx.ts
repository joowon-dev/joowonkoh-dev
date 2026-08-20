import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { SECTIONS, type PostMeta, type Section } from "./sections";

export type { PostMeta, Section } from "./sections";
export { SECTIONS, SECTION_LABELS, postHref } from "./sections";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function sectionDir(section: Section): string {
  return path.join(CONTENT_ROOT, section);
}

function extractSlug(filename: string): string {
  const name = filename.replace(/\.mdx$/, "");
  const match = name.match(/^(\d+)/);
  return match ? match[1] : name;
}

function listFiles(section: Section): string[] {
  const dir = sectionDir(section);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
}

function readPostMeta(section: Section, filename: string): PostMeta {
  const slug = extractSlug(filename);
  const filePath = path.join(sectionDir(section), filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(fileContent);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    tags: data.tags ?? [],
    section,
    noindex: data.noindex === true,
  };
}

export function getAllPostsBySection(section: Section): PostMeta[] {
  const files = listFiles(section);
  const posts = files.map((filename) => readPostMeta(section, filename));
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getAllPosts(): PostMeta[] {
  const all = SECTIONS.flatMap((s) => getAllPostsBySection(s));
  return all.sort((a, b) => (a.date > b.date ? -1 : 1));
}

function findFileBySlug(section: Section, slug: string): string | null {
  const files = listFiles(section);
  return files.find((f) => extractSlug(f) === slug) ?? null;
}

export function getPostBySlugFromSection(section: Section, slug: string) {
  const filename = findFileBySlug(section, slug);
  if (!filename) throw new Error(`Post not found in ${section}: ${slug}`);

  const filePath = path.join(sectionDir(section), filename);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    meta: {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      date: data.date ?? "",
      tags: data.tags ?? [],
      section,
      noindex: data.noindex === true,
    } satisfies PostMeta,
    content,
  };
}

/**
 * 같은 주제를 다룬 다른 글.
 *
 * 이전/다음 글은 날짜순이라 주제가 이어지지 않는다 — 터미널 글 다음에
 * 맛집 후기가 붙는 식이다. 여기서는 태그가 겹치는 정도로 고른다.
 *
 * 겹치는 태그가 하나도 없으면 아예 내보내지 않는다. 자리를 채우려고
 * 최근 글을 끼워 넣으면 «관련 글»이라는 이름이 거짓말이 된다.
 */
export function getRelatedPosts(
  post: PostMeta,
  limit = 3,
): PostMeta[] {
  const tags = new Set(post.tags);
  if (tags.size === 0) return [];

  return getAllPostsBySection(post.section)
    .filter((p) => p.slug !== post.slug && !p.noindex)
    .map((p) => ({ post: p, shared: p.tags.filter((t) => tags.has(t)).length }))
    .filter((entry) => entry.shared > 0)
    // 많이 겹치는 순, 같으면 최신 순. 매번 같은 목록이 나와야 하므로
    // 무작위를 섞지 않는다.
    .sort((a, b) => b.shared - a.shared || (a.post.date > b.post.date ? -1 : 1))
    .slice(0, limit)
    .map((entry) => entry.post);
}

export function getAllTagsBySection(section: Section): string[] {
  const posts = getAllPostsBySection(section);
  const tagSet = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet);
}

/**
 * Tags worth surfacing as filters: only those used on at least `minCount`
 * posts, ordered by frequency (most used first). Keeps the filter row short
 * instead of listing dozens of one-off tags.
 */
export function getPopularTagsBySection(
  section: Section,
  minCount = 2,
): string[] {
  const posts = getAllPostsBySection(section);
  const counts = new Map<string, number>();
  posts.forEach((post) =>
    post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
  );
  return Array.from(counts.entries())
    .filter(([, n]) => n >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}
