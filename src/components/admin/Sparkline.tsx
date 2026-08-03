import type { SeriesPoint } from "@/lib/admin/series";

/**
 * 일별 시계열 하나를 그리는 SVG 선. 차트 라이브러리를 들이지 않는 이유는
 * 그릴 것이 이 한 종류뿐이기 때문이다.
 *
 * 값이 없는 날(null)에서는 선을 끊는다. 이어 버리면 수집이 실패한 구간이
 * 완만한 추세처럼 보인다.
 */
export default function Sparkline({
  series,
  width = 640,
  height = 120,
}: {
  series: readonly SeriesPoint[];
  width?: number;
  height?: number;
}) {
  const values = series
    .map((p) => p.value)
    .filter((v): v is number => v !== null);

  if (values.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center text-xs text-neutral-600">
        데이터 없음
      </div>
    );
  }

  const max = Math.max(...values);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = series.length > 1 ? width / (series.length - 1) : 0;

  const segments: string[] = [];
  let current: string[] = [];

  series.forEach((point, i) => {
    if (point.value === null) {
      if (current.length) segments.push(current.join(" "));
      current = [];
      return;
    }
    const x = i * step;
    const y = height - ((point.value - min) / span) * height;
    current.push(`${current.length === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  });
  if (current.length) segments.push(current.join(" "));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[120px] w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label={`최근 ${series.length}일 추이`}
    >
      {segments.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
