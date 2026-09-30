import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { type BreakdownTotal, pivotBreakdown } from "./breakdown";
import type { SnsDraft } from "./sns";
import type { CollectionRun, MetricRow, Source } from "./types";

/** PostgREST 는 한 번에 1000행까지만 준다. 90일 × 두 기간이면 넘으므로 나눠 받는다. */
const PAGE = 1000;

type Page<T> = { data: T[] | null; error: { message: string } | null };

async function fetchAll<T>(query: (from: number, to: number) => PromiseLike<Page<T>>): Promise<T[]> {
  const all: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await query(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    all.push(...(data ?? []));
    if (!data || data.length < PAGE) return all;
  }
}

/** metrics_daily 를 기간으로. 소스 합계 — 카드·추이·원본 표가 쓴다. */
export async function loadDaily(start: string, end: string): Promise<MetricRow[]> {
  const supabase = await createServerSupabase();
  const rows = await fetchAll<MetricRow>((from, to) =>
    supabase
      .from("metrics_daily")
      .select("source, metric_date, entity, metric_key, value")
      .gte("metric_date", start)
      .lte("metric_date", end)
      .order("metric_date")
      .order("source")
      .order("entity")
      .order("metric_key")
      .range(from, to),
  );
  // numeric 은 문자열로 올 수 있다
  return rows.map((r) => ({ ...r, value: Number(r.value) }));
}

export async function loadRuns(): Promise<CollectionRun[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("collection_runs")
    .select("source, last_run_at, last_success, status, error");
  if (error) throw new Error(error.message);
  return (data ?? []) as CollectionRun[];
}

/** 한 차원의 기간 합계를 표 한 줄씩으로. 합계는 DB(admin_breakdown)가 낸다. */
export async function loadBreakdown(source: Source, dimension: string, start: string, end: string) {
  const supabase = await createServerSupabase();
  const rows = await fetchAll<BreakdownTotal>((from, to) =>
    supabase
      .rpc("admin_breakdown", { p_source: source, p_dimension: dimension, p_start: start, p_end: end })
      .order("dim_value")
      .order("metric_key")
      .range(from, to),
  );
  return pivotBreakdown(rows);
}

/** 조회가 막혀도(권한, 테이블 없음) 화면은 뜨게 한다. 이유는 화면에 적는다. */
export async function settle<T>(promise: Promise<T>, fallback: T): Promise<{ value: T; error: string | null }> {
  try {
    return { value: await promise, error: null };
  } catch (err) {
    return { value: fallback, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * SNS 승인함 — 최근 7일 초안. 대기·결정·게시를 한 번에 받아 화면에서 나눈다.
 * 하루에 수십 건이라 200행이면 충분하다.
 */
export async function loadSnsDrafts(now: Date): Promise<SnsDraft[]> {
  const supabase = await createServerSupabase();
  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("sns_drafts")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as SnsDraft[];
}
