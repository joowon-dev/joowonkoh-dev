"use client";

import { useId, useState } from "react";
import {
  formatDay,
  formatDuration,
  formatInt,
  formatPercent,
  formatShortDay,
  formatUsd,
} from "@/lib/admin/format";
import type { SeriesPoint } from "@/lib/admin/series";

/** 서버 컴포넌트는 함수를 넘길 수 없어서 형식은 이름으로 받는다. */
export type ValueFormat = "int" | "usd" | "percent" | "duration";

const FORMATTERS: Record<ValueFormat, (v: number) => string> = {
  int: formatInt,
  usd: formatUsd,
  percent: formatPercent,
  duration: formatDuration,
};

export type ChartSeries = {
  label: string;
  color: string;
  points: readonly SeriesPoint[];
  /** 지난 기간처럼 비교용이면 점선·흐리게 */
  muted?: boolean;
};

const W = 800;
const H = 220;

/**
 * 일별 추이. 값이 없는 날(null)은 선을 끊는다 — 이어 버리면 수집이 빠진 구간이
 * 완만한 추세처럼 보인다. 마우스를 올리거나 손가락으로 누른 날의 값을 위에 적는다.
 */
export default function TrendChart({
  series,
  format = "int",
  height = 220,
}: {
  series: readonly ChartSeries[];
  format?: ValueFormat;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const gradientId = useId();
  const fmt = FORMATTERS[format];

  const main = series[0];
  const days = main?.points.length ?? 0;
  const values = series.flatMap((s) => s.points.map((p) => p.value)).filter((v): v is number => v !== null);

  if (!main || values.length === 0) {
    return (
      <div className="admin-graph flex items-center justify-center rounded-xl text-sm text-[var(--ink-faint)]" style={{ height }}>
        이 기간에는 값이 없어요
      </div>
    );
  }

  const max = niceMax(Math.max(...values));
  const x = (i: number) => (days > 1 ? (i / (days - 1)) * W : W / 2);
  const y = (v: number) => H - (v / max) * H;

  const active = hover ?? days - 1;
  const activePoint = main.points[active];

  function onPointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(days - 1, Math.round(ratio * (days - 1)))));
  }

  return (
    <div>
      {/* 읽는 날의 값 — 기본은 마지막 날 */}
      <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span className="text-[var(--ink-soft)]">{activePoint ? formatDay(activePoint.date) : ""}</span>
        {series.map((s) => {
          const v = s.points[active]?.value ?? null;
          return (
            <span key={s.label} className="inline-flex items-baseline gap-1.5">
              <span className="inline-block h-2 w-2 translate-y-[-1px] rounded-full" style={{ background: s.color, opacity: s.muted ? 0.45 : 1 }} />
              <span className="text-[var(--ink-soft)]">{s.label}</span>
              <span className="admin-num font-semibold">{v === null ? "–" : fmt(v)}</span>
            </span>
          );
        })}
      </div>

      <div
        className="admin-graph relative touch-pan-y rounded-xl"
        style={{ height }}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${main.label} 일별 추이, 최고 ${fmt(Math.max(...values))}`}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={main.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={main.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {!main.muted && <path d={areaPath(main.points, x, y)} fill={`url(#${gradientId})`} />}
          {[...series].reverse().map((s) => (
            <path
              key={s.label}
              d={linePath(s.points, x, y)}
              fill="none"
              stroke={s.color}
              strokeWidth={s.muted ? 1.5 : 2.25}
              strokeDasharray={s.muted ? "5 5" : undefined}
              strokeOpacity={s.muted ? 0.55 : 1}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <line x1={x(active)} x2={x(active)} y1={0} y2={H} stroke="var(--ink-faint)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
        {activePoint?.value !== null && activePoint && (
          <span
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--paper-raised)]"
            style={{ left: `${(x(active) / W) * 100}%`, top: `${(y(activePoint.value) / H) * 100}%`, background: main.color }}
          />
        )}
        {/* 눈금 — HTML 이라 차트를 늘여도 글자가 찌그러지지 않는다 */}
        <span className="admin-num pointer-events-none absolute right-2 top-1 text-[11px] text-[var(--ink-faint)]">{fmt(max)}</span>
        <span className="admin-num pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[var(--ink-faint)]">{fmt(max / 2)}</span>
      </div>

      <div className="admin-num mt-1.5 flex justify-between text-[11px] text-[var(--ink-faint)]">
        <span>{formatShortDay(main.points[0].date)}</span>
        {days > 2 && <span>{formatShortDay(main.points[Math.floor((days - 1) / 2)].date)}</span>}
        <span>{formatShortDay(main.points[days - 1].date)}</span>
      </div>
    </div>
  );
}

function linePath(points: readonly SeriesPoint[], x: (i: number) => number, y: (v: number) => number): string {
  let d = "";
  let pen = false;
  points.forEach((p, i) => {
    if (p.value === null) {
      pen = false;
      return;
    }
    d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`;
    pen = true;
  });
  return d;
}

/** 채움은 끊긴 구간마다 따로 닫는다 */
function areaPath(points: readonly SeriesPoint[], x: (i: number) => number, y: (v: number) => number): string {
  let d = "";
  let run: number[] = [];
  const close = () => {
    if (run.length > 1) {
      d += `M${x(run[0]).toFixed(1)},${H}`;
      for (const i of run) d += `L${x(i).toFixed(1)},${y(points[i].value!).toFixed(1)}`;
      d += `L${x(run[run.length - 1]).toFixed(1)},${H}Z`;
    }
    run = [];
  };
  points.forEach((p, i) => (p.value === null ? close() : run.push(i)));
  close();
  return d;
}

/** 축 최댓값을 1·2·2.5·5 × 10ⁿ 로 올린다 — 눈금이 읽기 좋은 숫자가 되게 */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (value <= step * exp) return step * exp;
  }
  return 10 * exp;
}
