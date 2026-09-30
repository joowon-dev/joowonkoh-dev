/**
 * metrics_breakdown 한 행과, 같은 키를 합치는 도우미.
 *
 * 한 upsert 안에 같은 기본키가 두 번 있으면 Postgres 가 "ON CONFLICT DO UPDATE command
 * cannot affect row a second time" 으로 통째로 실패한다. GA4 는 pagePath 하나에 제목이
 * 둘(제목을 바꾼 날)인 식으로 같은 키를 여러 번 줄 수 있어서, 쓰기 전에 반드시 합친다.
 */

export type BreakdownRow = {
  source: "ga4" | "admob" | "instagram";
  metric_date: string; // YYYY-MM-DD
  dimension: string;
  dim_value: string;
  dim_label: string | null;
  metric_key: string;
  value: number;
};

export function mergeBreakdownRows(rows: readonly BreakdownRow[]): BreakdownRow[] {
  const merged = new Map<string, BreakdownRow>();
  for (const row of rows) {
    const key = [row.source, row.metric_date, row.dimension, row.dim_value, row.metric_key].join("\u0000");
    const existing = merged.get(key);
    if (existing) {
      existing.value += row.value;
      existing.dim_label ??= row.dim_label;
    } else {
      merged.set(key, { ...row });
    }
  }
  return [...merged.values()];
}

/** YYYYMMDD → YYYY-MM-DD. 형식이 다르면 조용히 넘기지 않는다. */
export function toIsoDate(yyyymmdd: string, what: string): string {
  if (!/^\d{8}$/.test(yyyymmdd)) {
    throw new Error(`${what} 날짜 형식이 예상과 다르다: "${yyyymmdd}"`);
  }
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6)}`;
}
