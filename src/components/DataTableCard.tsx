interface DataTableCardProps {
  title?: string;
  headers: string[];
  rows: string[][];
}

export default function DataTableCard({ title, headers, rows }: DataTableCardProps) {
  if (!headers || !rows || rows.length === 0) return null;
  const cols = headers.length;
  const gridStyle = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      {title && (
        <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
          {title}
        </div>
      )}
      <div className="overflow-x-auto">
        <div className="min-w-[36rem]">
          <div
            className="grid border-b border-border bg-accent-soft/40"
            style={gridStyle}
          >
            {headers.map((h, i) => (
              <div
                key={h + i}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-primary ${
                  i < cols - 1 ? "border-r border-border" : ""
                }`}
              >
                {h}
              </div>
            ))}
          </div>
          {rows.map((row, rIdx) => (
            <div
              key={rIdx}
              className={`grid ${rIdx < rows.length - 1 ? "border-b border-border" : ""}`}
              style={gridStyle}
            >
              {row.map((cell, cIdx) => (
                <div
                  key={cIdx}
                  className={`px-4 py-3 text-sm ${
                    cIdx === 0 ? "font-medium text-text-primary" : "text-text-secondary"
                  } ${cIdx < cols - 1 ? "border-r border-border" : ""}`}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
