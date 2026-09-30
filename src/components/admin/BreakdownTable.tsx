"use client";

import { useMemo, useState } from "react";
import { type BreakdownLine, columnValue, sortLines } from "@/lib/admin/breakdown";
import { COLUMN_SETS, type ColumnSet, type LabelKind, lineName } from "@/lib/admin/columns";

const FIRST_ROWS = 20;

/**
 * 차원별 표. 머리글을 누르면 그 열로 정렬, 한 번 더 누르면 뒤집는다.
 * 이름 아래에 주 지표의 전체 대비 비중을 가는 막대로 그린다. 모바일은 첫 열을 붙인 채 옆으로 민다.
 */
export default function BreakdownTable({
  lines,
  columns: setName,
  labelKind,
  color,
  searchable = false,
  nameHeader,
}: {
  lines: readonly BreakdownLine[];
  columns: ColumnSet;
  labelKind: LabelKind;
  color: string;
  searchable?: boolean;
  nameHeader: string;
}) {
  const columns = COLUMN_SETS[setName];
  const primary = columns.find((c) => "primary" in c && c.primary) ?? columns[0];
  const [sortKey, setSortKey] = useState(primary.key);
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const sortColumn = columns.find((c) => c.key === sortKey) ?? primary;
  const total = lines.reduce((sum, l) => sum + (columnValue(l, primary) ?? 0), 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? lines.filter((l) => {
          const { title, sub } = lineName(labelKind, l.value, l.label);
          return `${title} ${sub ?? ""}`.toLowerCase().includes(q);
        })
      : lines;
    return sortLines(filtered, sortColumn, direction);
  }, [lines, query, sortColumn, direction, labelKind]);

  const shown = showAll ? visible : visible.slice(0, FIRST_ROWS);

  function sortBy(key: string) {
    if (key === sortKey) setDirection((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setDirection("desc");
    }
  }

  if (lines.length === 0) {
    return <p className="rounded-xl bg-[var(--paper-raised)] px-4 py-10 text-center text-sm text-[var(--ink-faint)]">이 기간에는 값이 없어요</p>;
  }

  return (
    <div>
      {searchable && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름이나 경로로 찾기"
          className="mb-3 w-full rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] px-3 py-2 text-sm placeholder:text-[var(--ink-faint)] sm:w-72"
        />
      )}
      <div className="-mx-4 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-[12px] text-[var(--ink-soft)] [&>th]:border-b [&>th]:border-[var(--rule)]">
              <th scope="col" className="sticky left-0 z-[1] bg-[var(--paper)] py-2 pl-4 pr-3 font-medium sm:pl-0">
                {nameHeader}
              </th>
              {columns.map((c) => {
                const active = c.key === sortKey;
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (direction === "desc" ? "descending" : "ascending") : "none"} className="px-3 py-2 text-right font-medium whitespace-nowrap">
                    <button type="button" onClick={() => sortBy(c.key)} className={active ? "font-semibold text-[var(--ink)]" : "hover:text-[var(--ink)]"}>
                      {c.label}
                      <span aria-hidden="true" className="ml-0.5 inline-block w-2">{active ? (direction === "desc" ? "↓" : "↑") : ""}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.map((line) => {
              const { title, sub } = lineName(labelKind, line.value, line.label);
              const share = total > 0 ? (columnValue(line, primary) ?? 0) / total : 0;
              return (
                <tr key={line.value} className="align-top">
                  <th scope="row" className="sticky left-0 z-[1] max-w-[46vw] border-b border-[var(--grid)] bg-[var(--paper)] py-2.5 pl-4 pr-3 text-left font-normal sm:max-w-md sm:pl-0">
                    <span className="line-clamp-2 break-all">{title}</span>
                    {sub && <span className="mt-0.5 block truncate text-[12px] text-[var(--ink-faint)]">{sub}</span>}
                    {/* 주 지표 비중 — 이름 아래 가는 막대 */}
                    <span aria-hidden="true" className="mt-1.5 block h-[3px] rounded-full" style={{ width: `${Math.max(share * 100, 0.5)}%`, background: color, opacity: 0.7 }} />
                  </th>
                  {columns.map((c) => {
                    const v = columnValue(line, c);
                    const isPrimary = c.key === primary.key;
                    return (
                      <td key={c.key} className={`admin-num border-b border-[var(--grid)] px-3 py-2.5 text-right whitespace-nowrap ${isPrimary ? "font-semibold" : ""}`}>
                        {v === null ? "–" : c.format(v)}
                        {isPrimary && <span className="ml-1.5 text-[11px] font-normal text-[var(--ink-faint)]">{(share * 100).toFixed(share < 0.1 ? 1 : 0)}%</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--ink-soft)]">
        <span className="admin-num">
          {visible.length}개 중 {shown.length}개
        </span>
        {visible.length > FIRST_ROWS && (
          <button type="button" onClick={() => setShowAll((v) => !v)} className="rounded-md px-2 py-1 font-semibold hover:bg-[var(--paper-raised)]" style={{ color }}>
            {showAll ? "20개만 보기" : "전부 보기"}
          </button>
        )}
      </div>
    </div>
  );
}
