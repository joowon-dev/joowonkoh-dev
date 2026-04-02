interface CompareItem {
  label: string;
  values: [string, string];
}

interface CompareCardProps {
  headers: [string, string];
  items: CompareItem[];
}

export default function CompareCard({ headers, items = [] }: CompareCardProps) {
  if (!headers || !items || items.length === 0) return null;
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="grid grid-cols-2">
        {headers.map((header, i) => (
          <div
            key={header}
            className={`px-5 py-3 text-center text-sm font-semibold text-text-primary ${
              i === 0 ? "border-r border-border bg-accent-soft" : "bg-accent-soft"
            }`}
          >
            {header}
          </div>
        ))}
      </div>
      {items.map((item, idx) => (
        <div
          key={item.label}
          className={`grid grid-cols-2 ${idx < items.length - 1 ? "border-b border-border" : ""}`}
        >
          {item.values.map((val, i) => (
            <div
              key={i}
              className={`px-5 py-3 text-sm text-text-secondary ${
                i === 0 ? "border-r border-border" : ""
              }`}
            >
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-text-muted">
                {item.label}
              </span>
              <span className="font-medium text-text-primary">{val}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
