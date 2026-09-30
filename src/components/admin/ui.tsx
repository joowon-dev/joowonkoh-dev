import Link from "next/link";
import { formatDay, formatPercent } from "@/lib/admin/format";
import { type Period, RANGE_PRESETS, withQuery } from "@/lib/admin/period";

/** 화면 제목 + 기간 고르기. 기간은 링크(프리셋)와 GET 폼(직접 지정)이라 JS 없이도 된다. */
export function PageHeader({
  title,
  path,
  period,
  color = "var(--ink)",
  children,
}: {
  title: string;
  path: string;
  period: Period;
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl" style={{ color }}>
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {formatDay(period.start)} – {formatDay(period.end)}
          <span className="admin-num"> · {period.days}일</span>
        </p>
        {children}
      </div>
      <PeriodPicker path={path} period={period} />
    </header>
  );
}

function PeriodPicker({ path, period }: { path: string; period: Period }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-0.5">
        {RANGE_PRESETS.map((days) => {
          const active = period.preset === days;
          return (
            <Link
              key={days}
              href={withQuery(path, days === 30 ? {} : { range: String(days) })}
              aria-current={active ? "true" : undefined}
              className={`admin-num rounded-md px-3 py-1.5 text-sm ${
                active ? "bg-[var(--ink)] font-semibold text-[var(--paper)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              {days}일
            </Link>
          );
        })}
      </div>
      <details className="group relative">
        <summary
          className={`cursor-pointer list-none rounded-lg border border-[var(--rule)] px-3 py-1.5 text-sm ${
            period.preset === null ? "bg-[var(--ink)] font-semibold text-[var(--paper)]" : "bg-[var(--paper-raised)] text-[var(--ink-soft)]"
          }`}
        >
          직접 고르기
        </summary>
        <form
          action={path}
          method="get"
          className="absolute right-0 z-10 mt-2 flex w-64 flex-col gap-2 rounded-xl border border-[var(--rule)] bg-[var(--paper-raised)] p-3 shadow-lg"
        >
          <label className="text-xs text-[var(--ink-soft)]">
            시작
            <input type="date" name="from" defaultValue={period.start} max={period.end} required className="admin-num mt-1 w-full rounded-md border border-[var(--rule)] bg-[var(--paper)] px-2 py-1.5 text-sm text-[var(--ink)]" />
          </label>
          <label className="text-xs text-[var(--ink-soft)]">
            끝
            <input type="date" name="to" defaultValue={period.end} required className="admin-num mt-1 w-full rounded-md border border-[var(--rule)] bg-[var(--paper)] px-2 py-1.5 text-sm text-[var(--ink)]" />
          </label>
          <button type="submit" className="mt-1 rounded-md bg-[var(--ink)] py-2 text-sm font-semibold text-[var(--paper)]">
            이 기간 보기
          </button>
        </form>
      </details>
    </div>
  );
}

/** 숫자 하나. 지난 같은 길이 기간과 비교한 변화율을 붙인다. */
export function Stat({
  label,
  value,
  previous,
  format,
  color,
  hint,
  lowerIsBetter = false,
}: {
  label: string;
  value: number | null;
  previous?: number | null;
  format: (v: number) => string;
  color?: string;
  hint?: string;
  lowerIsBetter?: boolean;
}) {
  const change = value !== null && previous ? (value - previous) / previous : null;
  const good = change === null ? null : lowerIsBetter ? change < 0 : change > 0;

  return (
    <div className="border-l-2 py-1 pl-3" style={{ borderColor: color ?? "var(--rule)" }}>
      <p className="text-[13px] text-[var(--ink-soft)]">{label}</p>
      <p className="admin-num mt-0.5 text-[28px] font-semibold leading-tight lg:text-[32px]">
        {value === null ? "–" : format(value)}
      </p>
      <p className="admin-num text-[13px]">
        {change === null ? (
          <span className="text-[var(--ink-faint)]">{hint ?? "비교할 값 없음"}</span>
        ) : change === 0 ? (
          <span className="text-[var(--ink-faint)]">지난 기간과 같음</span>
        ) : (
          <span style={{ color: good ? "var(--up)" : "var(--down)" }}>
            {change > 0 ? "+" : "−"}
            {formatPercent(Math.abs(change))} <span className="text-[var(--ink-faint)]">지난 기간 대비</span>
          </span>
        )}
      </p>
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">{children}</div>;
}

/** 차트·표가 올라가는 판. 제목은 그 판이 무엇을 보여 주는지 말한다. */
export function Panel({
  title,
  aside,
  children,
  className = "",
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mt-8 ${className}`}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {aside && <div className="text-xs text-[var(--ink-soft)]">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

/** 표 위의 차원 탭. 링크라서 뒤로 가기·공유가 된다. */
export function Tabs({
  path,
  query,
  param,
  items,
  active,
  color,
}: {
  path: string;
  query: Record<string, string>;
  param: string;
  items: readonly { key: string; label: string }[];
  active: string;
  color: string;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex w-max gap-1 border-b border-[var(--rule)]">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={withQuery(path, { ...query, [param]: item.key })}
              scroll={false}
              aria-current={isActive ? "true" : undefined}
              className={`-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap ${
                isActive ? "font-semibold" : "border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
              style={isActive ? { borderColor: color, color } : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Notice({ tone = "warn", children }: { tone?: "warn" | "info"; children: React.ReactNode }) {
  return (
    <div
      className={`mb-6 rounded-lg px-4 py-3 text-sm ${
        tone === "warn" ? "bg-[var(--warn-bg)] text-[var(--warn-ink)]" : "bg-[var(--paper-raised)] text-[var(--ink-soft)]"
      }`}
    >
      {children}
    </div>
  );
}
