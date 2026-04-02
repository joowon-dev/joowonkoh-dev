"use client";

interface TagFilterProps {
  tags: string[];
  selected: string | null;
  onChange: (tag: string | null) => void;
}

export default function TagFilter({ tags, selected, onChange }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full px-4 py-1.5 text-xs font-medium spring-transition ${
          selected === null
            ? "bg-text-primary text-bg shadow-ambient"
            : "bg-tag-bg text-text-secondary hover:text-text-primary hover:bg-border"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tag)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium spring-transition ${
            selected === tag
              ? "bg-text-primary text-bg shadow-ambient"
              : "bg-tag-bg text-text-secondary hover:text-text-primary hover:bg-border"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
