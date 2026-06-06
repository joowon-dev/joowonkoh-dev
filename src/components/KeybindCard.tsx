interface Keybind {
  key: string;
  action: string;
}

interface KeybindCardProps {
  title?: string;
  prefix?: string;
  binds: Keybind[];
}

export default function KeybindCard({ title, prefix, binds = [] }: KeybindCardProps) {
  if (!binds || binds.length === 0) return null;
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      {title && (
        <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
          {title}
          {prefix && (
            <span className="ml-2 text-[11px] font-normal text-text-muted">
              prefix: <code className="rounded bg-tag-bg px-1.5 py-0.5">{prefix}</code>
            </span>
          )}
        </div>
      )}
      <div className="divide-y divide-border">
        {binds.map((b) => (
          <div key={b.key} className="flex items-start gap-4 px-5 py-3">
            <div className="shrink-0 text-right" style={{ minWidth: "5rem" }}>
              <kbd className="inline-block rounded-md border border-border bg-tag-bg px-2 py-1 text-[12px] font-medium text-accent">
                {b.key}
              </kbd>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-secondary">{b.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
