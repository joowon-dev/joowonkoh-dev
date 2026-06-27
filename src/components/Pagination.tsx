"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const base =
    "min-w-9 rounded-full px-3.5 py-1.5 text-xs font-medium spring-transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="페이지 탐색"
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${base} bg-tag-bg text-text-secondary hover:bg-border hover:text-text-primary`}
        aria-label="이전 페이지"
      >
        ←
      </button>
      {pages.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${base} ${
            n === page
              ? "bg-text-primary text-bg shadow-ambient"
              : "bg-tag-bg text-text-secondary hover:bg-border hover:text-text-primary"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={`${base} bg-tag-bg text-text-secondary hover:bg-border hover:text-text-primary`}
        aria-label="다음 페이지"
      >
        →
      </button>
    </nav>
  );
}
