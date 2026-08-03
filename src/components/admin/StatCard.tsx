import type { Delta } from "@/lib/admin/series";

export default function StatCard({
  label,
  delta,
  format,
}: {
  label: string;
  delta: Delta;
  format: (value: number) => string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
        {delta.current === null ? "—" : format(delta.current)}
      </p>
      <p className="mt-1 text-xs tabular-nums">
        <ChangeText ratio={delta.changeRatio} />
      </p>
    </div>
  );
}

function ChangeText({ ratio }: { ratio: number | null }) {
  if (ratio === null) {
    return <span className="text-neutral-600">전일 대비 —</span>;
  }

  const percent = `${Math.abs(ratio * 100).toFixed(1)}%`;

  if (ratio === 0) {
    return <span className="text-neutral-500">전일과 동일</span>;
  }

  return ratio > 0 ? (
    <span className="text-emerald-400">▲ {percent}</span>
  ) : (
    <span className="text-red-400">▼ {percent}</span>
  );
}
