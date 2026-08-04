import { getSupabase } from "./supabaseClient";

export type ScoreRow = {
  id: string;
  nickname: string;
  distance: number;
  created_at: string;
};

export function sanitizeNickname(raw: string): string {
  const trimmed = raw.trim().slice(0, 12);
  return trimmed.length > 0 ? trimmed : "익명";
}

export async function fetchTopScores(limit = 10): Promise<ScoreRow[]> {
  const { data, error } = await getSupabase()
    .from("leaderboard")
    .select("*")
    .order("distance", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ScoreRow[];
}

export async function submitScore(
  nickname: string,
  distance: number,
): Promise<ScoreRow> {
  const clean = sanitizeNickname(nickname);
  const dist = Math.max(0, Math.min(100000, Math.round(distance)));
  const { data, error } = await getSupabase()
    .from("leaderboard")
    .insert({ nickname: clean, distance: dist })
    .select()
    .single();
  if (error) throw error;
  return data as ScoreRow;
}
