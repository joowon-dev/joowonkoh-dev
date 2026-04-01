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
