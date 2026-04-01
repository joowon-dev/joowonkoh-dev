# joowonkoh.dev Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pretendard 폰트의 미니멀 다크모드 개인 사이트 — 포트폴리오 중심 메인, MDX 블로그, 사이드 프로젝트 플레이그라운드, AdSense 수익화

**Architecture:** Next.js 15 App Router + MDX로 정적 콘텐츠를 빌드 타임에 생성(SSG). Cloudflare Pages에 배포하며, 동적 기능이 필요한 플레이그라운드는 Workers(SSR)로 처리. @next/mdx 대신 next-mdx-remote로 content/ 디렉토리의 MDX 파일을 파싱.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Pretendard, next-mdx-remote, rehype-pretty-code, next-sitemap, @cloudflare/next-on-pages

---

## File Structure

```
joowonkoh-dev/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (Pretendard, 다크 배경, Header)
│   ├── page.tsx                # 메인 페이지 (히어로 + 프로젝트 + 최신글)
│   ├── blog/
│   │   ├── page.tsx            # 블로그 목록 (태그 필터)
│   │   └── [slug]/
│   │       └── page.tsx        # 블로그 상세 (MDX 렌더링 + AdSense)
│   ├── playground/
│   │   └── page.tsx            # 플레이그라운드 (프로젝트 카드 그리드)
│   └── about/
│       └── page.tsx            # 소개 페이지
├── components/
│   ├── Header.tsx              # 네비게이션 (로고 JK + 링크)
│   ├── ProjectCard.tsx         # 프로젝트 카드 컴포넌트
│   ├── PostItem.tsx            # 블로그 포스트 리스트 아이템
│   ├── TagFilter.tsx           # 태그 필터 (클라이언트 컴포넌트)
│   ├── AdSense.tsx             # Google AdSense 광고 컴포넌트
│   └── MDXComponents.tsx       # MDX 커스텀 컴포넌트 (코드블록 등)
├── lib/
│   ├── mdx.ts                  # MDX 파싱 (frontmatter 추출, 글 목록)
│   └── projects.ts             # 프로젝트 데이터 정의
├── content/
│   └── blog/
│       └── hello-world.mdx     # 샘플 블로그 글
├── public/
│   └── images/
├── tailwind.config.ts
├── next.config.ts
├── next-sitemap.config.js
└── package.json
```

---

### Task 1: 프로젝트 초기화 및 의존성 설치

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `.gitignore`

- [ ] **Step 1: Next.js 프로젝트 생성**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

선택 옵션: TypeScript=Yes, ESLint=Yes, Tailwind=Yes, src/=No, App Router=Yes

- [ ] **Step 2: 추가 의존성 설치**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npm install next-mdx-remote gray-matter rehype-pretty-code shiki next-sitemap
npm install -D @cloudflare/next-on-pages
```

- [ ] **Step 3: next.config.ts 설정**

`next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true, // Cloudflare Pages 호환
  },
};

export default nextConfig;
```

- [ ] **Step 4: tailwind.config.ts에 Pretendard 및 다크모드 컬러 설정**

`tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#0a0a0a",
        "card-bg": "#111111",
        border: "#222222",
        "text-primary": "#ededed",
        "text-secondary": "#888888",
        "text-muted": "#666666",
        "tag-bg": "#1a1a1a",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: .gitignore 확인**

`.gitignore`에 다음이 포함되어 있는지 확인:
```
node_modules
.next
out
.superpowers/
```

- [ ] **Step 6: 빌드 확인**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npm run dev
```

Expected: 로컬 서버가 http://localhost:3000 에서 실행됨

- [ ] **Step 7: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add package.json package-lock.json tsconfig.json next.config.ts tailwind.config.ts app/ .gitignore next-env.d.ts eslint.config.mjs postcss.config.mjs
git commit -m "chore: initialize Next.js 15 project with Tailwind CSS"
```

---

### Task 2: 루트 레이아웃 + Header 컴포넌트

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/Header.tsx`
- Create: `app/globals.css` (수정)

- [ ] **Step 1: globals.css에 Pretendard import 및 다크 배경 설정**

`app/globals.css`:
```css
@import "tailwindcss";
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");

body {
  background-color: #0a0a0a;
  color: #ededed;
  font-family: "Pretendard", system-ui, sans-serif;
}
```

- [ ] **Step 2: Header 컴포넌트 작성**

`components/Header.tsx`:
```tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-base font-bold text-text-primary">
          JK
        </Link>
        <div className="flex gap-5">
          <Link href="/blog" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Blog
          </Link>
          <Link href="/playground" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Playground
          </Link>
          <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 3: 루트 레이아웃 작성**

`app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "Joowon Koh",
    template: "%s | Joowon Koh",
  },
  description: "Developer & Creator — 새로운 것을 만들고 공유합니다.",
  metadataBase: new URL("https://joowonkoh.dev"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-bg text-text-primary font-sans antialiased">
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: 메인 페이지 임시 내용으로 확인**

`app/page.tsx`:
```tsx
export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold">고주원</h1>
      <p className="mt-2 text-text-muted">Developer & Creator</p>
    </div>
  );
}
```

- [ ] **Step 5: 브라우저에서 확인**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npm run dev
```

Expected: 다크 배경, Pretendard 폰트, 상단 네비게이션 "JK | Blog Playground About" 표시

- [ ] **Step 6: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add app/layout.tsx app/globals.css app/page.tsx components/Header.tsx
git commit -m "feat: add root layout with Pretendard font and Header navigation"
```

---

### Task 3: MDX 파싱 유틸리티 + 샘플 블로그 글

**Files:**
- Create: `lib/mdx.ts`
- Create: `content/blog/hello-world.mdx`

- [ ] **Step 1: MDX 파싱 유틸리티 작성**

`lib/mdx.ts`:
```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);

    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      date: data.date ?? "",
      tags: data.tags ?? [],
    };
  });

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    meta: {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      date: data.date ?? "",
      tags: data.tags ?? [],
    },
    content,
  };
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet);
}
```

- [ ] **Step 2: 샘플 블로그 글 작성**

`content/blog/hello-world.mdx`:
```mdx
---
title: "블로그를 시작합니다"
description: "joowonkoh.dev 블로그의 첫 번째 글입니다."
date: "2026-04-01"
tags: ["Dev", "Life"]
---

## 안녕하세요!

개발자 고주원입니다. 이 블로그에서는 개발, 일상, 그리고 다양한 생각들을 기록합니다.

### 이 블로그를 만든 이유

직접 만든 사이트에서 글을 쓰고 싶었습니다. Next.js와 MDX를 사용해서 마크다운으로 편하게 글을 쓰면서도 React 컴포넌트를 삽입할 수 있습니다.

```typescript
const greeting = "Hello, World!";
console.log(greeting);
```

앞으로 많은 글을 올리겠습니다. 감사합니다!
```

- [ ] **Step 3: 파싱 동작 확인**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npx tsx -e "const { getAllPosts } = require('./lib/mdx'); console.log(getAllPosts());"
```

Expected: hello-world 포스트 메타데이터가 출력됨

- [ ] **Step 4: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add lib/mdx.ts content/blog/hello-world.mdx
git commit -m "feat: add MDX parsing utility and sample blog post"
```

---

### Task 4: 블로그 목록 페이지 (/blog)

**Files:**
- Create: `app/blog/page.tsx`
- Create: `components/PostItem.tsx`
- Create: `components/TagFilter.tsx`

- [ ] **Step 1: PostItem 컴포넌트 작성**

`components/PostItem.tsx`:
```tsx
import Link from "next/link";
import type { PostMeta } from "@/lib/mdx";

export default function PostItem({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 hover:bg-card-bg transition-colors"
    >
      <div>
        <h3 className="text-[15px] font-semibold text-text-primary">
          {post.title}
        </h3>
        <p className="mt-1 text-sm text-text-muted line-clamp-1">
          {post.description}
        </p>
        <div className="mt-2 flex gap-1">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <span className="shrink-0 text-xs text-text-muted">
        {post.date.replace(/-/g, ".")}
      </span>
    </Link>
  );
}
```

- [ ] **Step 2: TagFilter 컴포넌트 작성 (클라이언트)**

`components/TagFilter.tsx`:
```tsx
"use client";

interface TagFilterProps {
  tags: string[];
  selected: string | null;
  onChange: (tag: string | null) => void;
}

export default function TagFilter({ tags, selected, onChange }: TagFilterProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full px-3 py-1 text-xs transition-colors ${
          selected === null
            ? "bg-text-primary text-bg font-medium"
            : "bg-tag-bg text-text-secondary hover:text-text-primary"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tag)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            selected === tag
              ? "bg-text-primary text-bg font-medium"
              : "bg-tag-bg text-text-secondary hover:text-text-primary"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 블로그 목록 페이지 작성**

`app/blog/page.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import PostItem from "@/components/PostItem";
import TagFilter from "@/components/TagFilter";
import type { PostMeta } from "@/lib/mdx";

// 빌드 타임에 생성하기 위해 별도 API route나 generateStaticParams 사용 가능
// 여기서는 간단히 fetch로 구현
export default function BlogPage() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data: { posts: PostMeta[]; tags: string[] }) => {
        setPosts(data.posts);
        setTags(data.tags);
      });
  }, []);

  const filtered = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts;

  return (
    <div>
      <h1 className="text-[22px] font-bold">Blog</h1>
      <p className="mt-1 text-sm text-text-muted">
        개발, 일상, 생각을 기록합니다.
      </p>
      <div className="mt-6">
        <TagFilter tags={tags} selected={selectedTag} onChange={setSelectedTag} />
      </div>
      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        {filtered.map((post) => (
          <PostItem key={post.slug} post={post} />
        ))}
        {filtered.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-text-muted">
            아직 글이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: API route 생성**

`app/api/posts/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { getAllPosts, getAllTags } from "@/lib/mdx";

export async function GET() {
  const posts = getAllPosts();
  const tags = getAllTags();
  return NextResponse.json({ posts, tags });
}
```

- [ ] **Step 5: 브라우저에서 /blog 확인**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npm run dev
```

Expected: http://localhost:3000/blog 에서 "Blog" 제목, 태그 필터(All/Dev/Life), hello-world 포스트 표시

- [ ] **Step 6: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add app/blog/page.tsx app/api/posts/route.ts components/PostItem.tsx components/TagFilter.tsx
git commit -m "feat: add blog list page with tag filtering"
```

---

### Task 5: 블로그 상세 페이지 (/blog/[slug])

**Files:**
- Create: `app/blog/[slug]/page.tsx`
- Create: `components/MDXComponents.tsx`

- [ ] **Step 1: MDX 커스텀 컴포넌트 작성**

`components/MDXComponents.tsx`:
```tsx
import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h2: (props) => (
    <h2 className="mt-10 mb-4 text-xl font-bold text-text-primary" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-8 mb-3 text-lg font-semibold text-text-primary" {...props} />
  ),
  p: (props) => (
    <p className="my-4 leading-7 text-text-secondary" {...props} />
  ),
  ul: (props) => (
    <ul className="my-4 list-disc pl-6 text-text-secondary" {...props} />
  ),
  ol: (props) => (
    <ol className="my-4 list-decimal pl-6 text-text-secondary" {...props} />
  ),
  li: (props) => <li className="my-1" {...props} />,
  a: (props) => (
    <a className="text-blue-400 underline hover:text-blue-300" {...props} />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-4 border-l-2 border-border pl-4 text-text-muted italic"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="my-4 overflow-x-auto rounded-lg border border-border bg-card-bg p-4 text-sm"
      {...props}
    />
  ),
  code: (props) => {
    const isInline = typeof props.children === "string";
    if (isInline) {
      return (
        <code className="rounded bg-tag-bg px-1.5 py-0.5 text-sm text-text-primary" {...props} />
      );
    }
    return <code {...props} />;
  },
};

export default components;
```

- [ ] **Step 2: 블로그 상세 페이지 작성**

`app/blog/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import mdxComponents from "@/components/MDXComponents";
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

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{post.meta.title}</h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-sm text-text-muted">
            {post.meta.date.replace(/-/g, ".")}
          </span>
          <div className="flex gap-1">
            {post.meta.tags.map((tag) => (
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
        source={post.content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            rehypePlugins: [
              [rehypePrettyCode, { theme: "github-dark-default" }],
            ],
          },
        }}
      />
    </article>
  );
}
```

- [ ] **Step 3: 브라우저에서 /blog/hello-world 확인**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npm run dev
```

Expected: http://localhost:3000/blog/hello-world 에서 MDX 블로그 글이 렌더링되고, 코드 하이라이팅 적용됨

- [ ] **Step 4: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add app/blog/\[slug\]/page.tsx components/MDXComponents.tsx
git commit -m "feat: add blog detail page with MDX rendering and code highlighting"
```

---

### Task 6: 메인 페이지 (히어로 + 프로젝트 + 최신글)

**Files:**
- Create: `lib/projects.ts`
- Create: `components/ProjectCard.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: 프로젝트 데이터 정의**

`lib/projects.ts`:
```typescript
export interface Project {
  title: string;
  description: string;
  tags: string[];
  href: string;
}

export const projects: Project[] = [
  {
    title: "joowonkoh.dev",
    description: "이 사이트! Next.js + MDX 블로그",
    tags: ["Next.js", "TypeScript"],
    href: "https://github.com/joowonkoh",
  },
  // 추후 프로젝트 추가
];
```

- [ ] **Step 2: ProjectCard 컴포넌트 작성**

`components/ProjectCard.tsx`:
```tsx
import type { Project } from "@/lib/projects";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-border bg-card-bg p-5 transition-colors hover:border-text-muted"
    >
      <h3 className="text-sm font-semibold text-text-primary">
        {project.title}
      </h3>
      <p className="mt-1 text-xs text-text-muted">{project.description}</p>
      <div className="mt-2 flex gap-1">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
```

- [ ] **Step 3: 메인 페이지 작성**

`app/page.tsx`:
```tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";
import { projects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="pb-10">
        <h1 className="text-[28px] font-bold">고주원</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-text-muted">
          Developer & Creator
          <br />
          새로운 것을 만들고 공유합니다.
        </p>
      </section>

      {/* Featured Projects */}
      <section className="pb-10">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Featured Projects
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </section>

      {/* Recent Posts */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Recent Posts
        </h2>
        <div className="overflow-hidden rounded-lg border border-border">
          {recentPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0 hover:bg-card-bg transition-colors"
            >
              <span className="text-sm text-text-primary">{post.title}</span>
              <span className="text-xs text-text-muted">
                {post.date.replace(/-/g, ".")}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: 브라우저에서 메인 페이지 확인**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npm run dev
```

Expected: http://localhost:3000 에서 히어로 + 프로젝트 그리드 + 최신 글 목록 표시

- [ ] **Step 5: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add app/page.tsx lib/projects.ts components/ProjectCard.tsx
git commit -m "feat: add main page with hero, projects grid, and recent posts"
```

---

### Task 7: 플레이그라운드 페이지 (/playground)

**Files:**
- Create: `app/playground/page.tsx`

- [ ] **Step 1: 플레이그라운드 페이지 작성**

`app/playground/page.tsx`:
```tsx
import { projects } from "@/lib/projects";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "사이드 프로젝트 모음",
};

export default function PlaygroundPage() {
  return (
    <div>
      <h1 className="text-[22px] font-bold">Playground</h1>
      <p className="mt-1 text-sm text-text-muted">사이드 프로젝트 모음</p>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {projects.map((project) => (
          <a
            key={project.title}
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-lg border border-border bg-card-bg transition-colors hover:border-text-muted"
          >
            <div className="flex h-24 items-center justify-center bg-tag-bg text-2xl">
              🚀
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-text-primary">
                {project.title}
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                {project.description}
              </p>
              <div className="mt-2 flex gap-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-tag-bg px-2 py-0.5 text-[10px] text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 브라우저에서 /playground 확인**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npm run dev
```

Expected: http://localhost:3000/playground 에서 프로젝트 카드 그리드 표시

- [ ] **Step 3: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add app/playground/page.tsx
git commit -m "feat: add playground page with project card grid"
```

---

### Task 8: About 페이지 (/about)

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: About 페이지 작성**

`app/about/page.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "개발자 고주원 소개",
};

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-[22px] font-bold">About</h1>
      <p className="mt-4 leading-7 text-text-secondary">
        안녕하세요, 개발자 고주원입니다.
        <br />
        새로운 것을 만들고 공유하는 것을 좋아합니다.
      </p>

      <section className="mt-10">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "TypeScript",
            "React",
            "Next.js",
            "Node.js",
            "Tailwind CSS",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-border bg-card-bg px-3 py-1.5 text-sm text-text-primary"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Contact
        </h2>
        <div className="flex gap-4">
          <a
            href="https://github.com/joowonkoh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:hello@joowonkoh.dev"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Email
          </a>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: 브라우저에서 /about 확인**

Expected: http://localhost:3000/about 에서 자기소개, 기술 스택, 연락처 표시

- [ ] **Step 3: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add app/about/page.tsx
git commit -m "feat: add about page with profile and contact info"
```

---

### Task 9: AdSense 컴포넌트 + 블로그 글 하단 배치

**Files:**
- Create: `components/AdSense.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: AdSense 컴포넌트 작성**

`components/AdSense.tsx`:
```tsx
"use client";

import { useEffect } from "react";

interface AdSenseProps {
  adSlot: string;
}

export default function AdSense({ adSlot }: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is injected by the script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  return (
    <div className="my-8">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
```

- [ ] **Step 2: layout.tsx에 AdSense 스크립트 추가**

`app/layout.tsx`의 `<head>` 영역에 추가:
```tsx
import Script from "next/script";

// body 태그 내 마지막에 추가:
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

- [ ] **Step 3: 블로그 상세 페이지에 AdSense 추가**

`app/blog/[slug]/page.tsx`의 `</article>` 닫기 전에 추가:
```tsx
import AdSense from "@/components/AdSense";

// article 태그 내 마지막에:
<AdSense adSlot="1234567890" />
```

- [ ] **Step 4: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add components/AdSense.tsx app/layout.tsx app/blog/\[slug\]/page.tsx
git commit -m "feat: add Google AdSense component with blog post placement"
```

> Note: `ca-pub-XXXXXXXXXXXXXXXX`와 `adSlot` 값은 AdSense 승인 후 실제 값으로 교체 필요

---

### Task 10: SEO 설정 (sitemap + robots.txt + GA)

**Files:**
- Create: `next-sitemap.config.js`
- Modify: `app/layout.tsx`
- Modify: `package.json` (postbuild 스크립트)

- [ ] **Step 1: next-sitemap 설정**

`next-sitemap.config.js`:
```javascript
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://joowonkoh.dev",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  outDir: "./out",
};
```

- [ ] **Step 2: package.json에 postbuild 스크립트 추가**

`package.json`의 scripts에 추가:
```json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

- [ ] **Step 3: Google Analytics 추가**

`app/layout.tsx`에 GA 스크립트 추가:
```tsx
import Script from "next/script";

// body 태그 내에 추가:
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

- [ ] **Step 4: 각 페이지에 메타데이터 확인**

모든 페이지에 `generateMetadata` 또는 `export const metadata`가 있는지 확인:
- `/` → layout.tsx의 기본 메타데이터
- `/blog` → 별도 metadata 추가 필요
- `/blog/[slug]` → generateMetadata 있음
- `/playground` → metadata 있음
- `/about` → metadata 있음

`app/blog/page.tsx`는 클라이언트 컴포넌트이므로 별도 layout.tsx 생성:

`app/blog/layout.tsx`:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "개발, 일상, 생각을 기록합니다.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 5: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add next-sitemap.config.js package.json app/layout.tsx app/blog/layout.tsx
git commit -m "feat: add SEO setup with sitemap, robots.txt, and Google Analytics"
```

> Note: `G-XXXXXXXXXX`는 GA 계정 생성 후 실제 측정 ID로 교체 필요

---

### Task 11: Cloudflare Pages 배포 설정

**Files:**
- Create: `wrangler.toml` (선택)
- Modify: `next.config.ts`

- [ ] **Step 1: @cloudflare/next-on-pages 설정 확인**

`next.config.ts`에서 edge runtime 호환 설정:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 2: package.json에 Cloudflare 빌드 스크립트 추가**

```json
{
  "scripts": {
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:dev": "npx wrangler pages dev .vercel/output/static --compatibility-date=2024-01-01"
  }
}
```

- [ ] **Step 3: 빌드 테스트**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npm run build
npm run pages:build
```

Expected: `.vercel/output` 디렉토리 생성, 빌드 성공

- [ ] **Step 4: 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add next.config.ts package.json
git commit -m "feat: add Cloudflare Pages build configuration"
```

- [ ] **Step 5: Cloudflare Pages 프로젝트 연결 (수동)**

1. Cloudflare 대시보드 → Pages → Create a project
2. Git 연결 → 이 레포 선택
3. Build command: `npm run pages:build`
4. Build output: `.vercel/output/static`
5. 환경 변수: `NODE_VERSION=20`
6. 커스텀 도메인: joowonkoh.dev 연결

---

### Task 12: 최종 확인 및 정리

- [ ] **Step 1: 로컬 빌드 테스트**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npm run build
```

Expected: 빌드 성공, 에러 없음

- [ ] **Step 2: 모든 페이지 확인**

```bash
cd /Users/kohjoowon/joowonkoh-dev
npm run dev
```

확인 항목:
- `/` — 히어로, 프로젝트, 최신글 표시
- `/blog` — 글 목록, 태그 필터 작동
- `/blog/hello-world` — MDX 렌더링, 코드 하이라이팅
- `/playground` — 프로젝트 카드
- `/about` — 소개, 기술 스택, 연락처
- 네비게이션 모든 링크 작동

- [ ] **Step 3: 최종 커밋**

```bash
cd /Users/kohjoowon/joowonkoh-dev
git add -A
git commit -m "chore: final cleanup and verification"
```
