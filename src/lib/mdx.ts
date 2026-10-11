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
    immersive: data.immersive === true,
  };
}

export function getAllPostsBySection(section: Section): PostMeta[] {
  const files = listFiles(section);
  const posts = files.map((filename) => readPostMeta(section, filename));
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * 목록·홈·이전/다음 글에 보이는 글. noindex 글은 주소로만 열린다.
 *
 * 색인에서만 빼고 목록에 남겨 두면 검색으로는 안 와도 사이트를 둘러보는
 * 사람(애드센스 심사자 포함)은 그대로 읽는다. 뺀 까닭이 «믿을 수 없다»라면
 * 목록에서도 빠져야 한다. 페이지 생성(generateStaticParams)은 계속
 * getAllPostsBySection을 써서 예전 링크가 404가 되지 않게 한다.
 */
export function getListedPostsBySection(section: Section): PostMeta[] {
  return getAllPostsBySection(section).filter((p) => !p.noindex);
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
      immersive: data.immersive === true,
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

  return getListedPostsBySection(post.section)
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ post: p, shared: p.tags.filter((t) => tags.has(t)).length }))
    .filter((entry) => entry.shared > 0)
    // 많이 겹치는 순, 같으면 최신 순. 매번 같은 목록이 나와야 하므로
    // 무작위를 섞지 않는다.
    .sort((a, b) => b.shared - a.shared || (a.post.date > b.post.date ? -1 : 1))
    .slice(0, limit)
    .map((entry) => entry.post);
}

export function getAllTagsBySection(section: Section): string[] {
  const posts = getListedPostsBySection(section);
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
  const posts = getListedPostsBySection(section);
  const counts = new Map<string, number>();
  posts.forEach((post) =>
    post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)),
  );
  return Array.from(counts.entries())
    .filter(([, n]) => n >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}
