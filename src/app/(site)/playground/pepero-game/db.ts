import { getSupabase } from "@/lib/supabaseClient";

import type { Outcome, Turn } from "./rules";

/**
 * 친구끼리 겨룬 판을 Supabase 에 쌓고 통계를 받아 온다.
 * 표(pepero_matches)는 직접 못 만지고 함수 두 개로만 만난다 — supabase/migrations/20261109000000_pepero_matches.sql
 *
 * 게임은 DB 없이도 돌아야 한다. 실패하면 null 을 돌려주고 화면은 통계만 빼고 그린다.
 */

export interface Stats {
  total: number;
  today: number;
  /** 이마 쿵으로 끝난 판 */
  bonk: number;
  /** 끝까지 간 판 */
  ok: number;
  /** 이 판보다 남은 길이가 짧았던 판 수(이 판이 끝까지 간 판일 때만) */
  better: number | null;
  /** 남은 길이가 가장 짧은 판 다섯 */
  top: { l: string; r: string; rest: number }[];
}

function parse(x: unknown): Stats | null {
  if (!x || typeof x !== "object") return null;
  const s = x as Record<string, unknown>;
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0);
  const top = Array.isArray(s.top)
    ? s.top.map((t: { l?: unknown; r?: unknown; rest?: unknown }) => ({
        l: String(t.l ?? ""),
        r: String(t.r ?? ""),
        rest: n(t.rest),
      }))
    : [];
  return {
    total: n(s.total),
    today: n(s.today),
    bonk: n(s.bonk),
    ok: n(s.ok),
    better: s.better === null || s.better === undefined ? null : n(s.better),
    top,
  };
}

export async function fetchStats(): Promise<Stats | null> {
  try {
    const { data, error } = await getSupabase().rpc("pepero_stats", {});
    return error ? null : parse(data);
  } catch {
    return null;
  }
}

/** 한 판 기록(같은 결과 링크는 한 번만 남는다)하고 그 판 기준 통계를 받는다 */
export async function recordMatch(code: string, l: Turn, r: Turn, o: Outcome): Promise<Stats | null> {
  try {
    const { data, error } = await getSupabase().rpc("pepero_record", {
      p_code: code,
      p_left_name: l.name,
      p_right_name: r.name,
      p_left_mm: o.left,
      p_right_mm: o.right,
      p_outcome: o.kind,
      p_rest_mm: o.kind === "ok" ? o.rest : null,
    });
    return error ? null : parse(data);
  } catch {
    return null;
  }
}

/** 「상위 몇 %」 — 끝까지 간 판 중에서 이 판보다 나은 판의 비율로 */
export function topPercent(s: Stats): number | null {
  if (s.better === null || s.ok < 3) return null;
  return Math.max(1, Math.ceil(((s.better + 1) / s.ok) * 100));
}
