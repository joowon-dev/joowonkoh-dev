interface StackItem {
  label: string;
  value: string;
}

interface StackSummaryCardProps {
  title?: string;
  items: StackItem[];
}

export default function StackSummaryCard({ title, items = [] }: StackSummaryCardProps) {
  if (!items || items.length === 0) return null;
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      {title && (
        <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
          {title}
        </div>
      )}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-4 px-5 py-3">
            <div className="shrink-0 text-right" style={{ minWidth: "6.5rem" }}>
              <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {item.label}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-text-primary">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
