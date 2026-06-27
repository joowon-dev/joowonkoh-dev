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

export function getAllTagsBySection(section: Section): string[] {
  const posts = getAllPostsBySection(section);
  const tagSet = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet);
}
