"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<TocItem[]>([]);

  useEffect(() => {
    // 글 본문 안의 제목만 목차로 삼는다. article 전체를 훑으면 본문 뒤에 붙는
    // «같이 읽으면 좋은 글» 같은 딸린 영역의 제목까지 목차에 끼어든다.
    const els = Array.from(
      document.querySelectorAll("[data-mdx-body] h2, [data-mdx-body] h3"),
    );
    const items: TocItem[] = els.map((el, idx) => {
      const base = el.textContent?.replace(/\s+/g, "-").replace(/[^\w가-힣-]/g, "").toLowerCase() ?? "";
      const id = `${base}-${idx}`;
      el.id = id;
      return {
        id,
        text: el.textContent ?? "",
        level: el.tagName === "H2" ? 2 : 3,
      };
    });
    setHeadings(items);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="text-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
        목차
      </p>
      <ul className="space-y-2 border-l border-border pl-3">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`block spring-transition text-[13px] leading-snug ${
                h.level === 3 ? "pl-3" : ""
              } ${
                activeId === h.id
                  ? "font-medium text-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
