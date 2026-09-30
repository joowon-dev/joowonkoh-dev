/**
 * admin_breakdown RPC 결과(차원값 × 지표 합계, 세로로 긴 모양)를 표 한 줄씩으로 편다.
 * 비율 지표는 여기서 분자·분모로 계산한다 — DB 에는 합산 가능한 값만 있다.
 */

export type BreakdownTotal = {
  dim_value: string;
  dim_label: string | null;
  metric_key: string;
  total: number | string; // numeric 은 PostgREST 에서 문자열로 올 수 있다
};

export type BreakdownLine = {
  value: string;
  label: string | null;
  metrics: Record<string, number>;
};

export function pivotBreakdown(rows: readonly BreakdownTotal[]): BreakdownLine[] {
  const lines = new Map<string, BreakdownLine>();
  for (const row of rows) {
    let line = lines.get(row.dim_value);
    if (!line) {
      line = { value: row.dim_value, label: row.dim_label, metrics: {} };
      lines.set(row.dim_value, line);
    }
    line.label ??= row.dim_label;
    line.metrics[row.metric_key] = (line.metrics[row.metric_key] ?? 0) + Number(row.total);
  }
  return [...lines.values()];
}

/** 0 으로 나누면 숫자를 만들어내지 않고 null. */
export function ratio(numerator: number | undefined, denominator: number | undefined): number | null {
  if (numerator === undefined || denominator === undefined || denominator === 0) return null;
  return numerator / denominator;
}

/** 표의 한 열. 저장된 지표이거나, 다른 지표로 계산한 파생 지표. */
export type Column = {
  key: string;
  label: string;
  /** 없으면 metrics[key] 를 그대로 쓴다 */
  derive?: (m: Record<string, number>) => number | null;
  format: (value: number) => string;
  /** 막대(비중)를 그릴 열 — 기본 정렬 열이기도 하다 */
  primary?: boolean;
};

export function columnValue(line: BreakdownLine, column: Column): number | null {
  if (column.derive) return column.derive(line.metrics);
  return line.metrics[column.key] ?? null;
}

/** 내림차순, null 은 맨 뒤. 같으면 라벨/값 순으로 안정적으로. */
export function sortLines(
  lines: readonly BreakdownLine[],
  column: Column,
  direction: "asc" | "desc" = "desc",
): BreakdownLine[] {
  const sign = direction === "desc" ? -1 : 1;
  return [...lines].sort((a, b) => {
    const va = columnValue(a, column);
    const vb = columnValue(b, column);
    if (va === null && vb === null) return a.value.localeCompare(b.value);
    if (va === null) return 1;
    if (vb === null) return -1;
    if (va !== vb) return (va - vb) * sign;
    return a.value.localeCompare(b.value);
  });
}
