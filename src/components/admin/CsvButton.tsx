"use client";

/** 표를 그대로 CSV 로 내려받는다. 엑셀이 한글을 깨뜨리지 않게 BOM 을 붙인다. */
export default function CsvButton({
  filename,
  header,
  rows,
}: {
  filename: string;
  header: readonly string[];
  rows: readonly (readonly (string | number | null)[])[];
}) {
  function download() {
    const escape = (v: string | number | null) => {
      const s = v === null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={download} className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] px-3 py-1.5 text-sm font-semibold hover:border-[var(--ink-faint)]">
      CSV 내려받기
    </button>
  );
}
