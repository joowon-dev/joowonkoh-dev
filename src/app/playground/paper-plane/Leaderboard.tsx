"use client";

import { useEffect, useState } from "react";
import {
  fetchTopScores,
  submitScore,
  type ScoreRow,
} from "@/lib/leaderboard";

export function Leaderboard({
  pendingDistance,
  onSubmitted,
  highlightId,
}: {
  pendingDistance: number | null;
  onSubmitted: (id: string) => void;
  highlightId: string | null;
}) {
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchTopScores(10));
    } catch {
      setError("기록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (pendingDistance == null) return;
    setSubmitting(true);
    setError(null);
    try {
      const row = await submitScore(nickname, pendingDistance);
      setNickname("");
      await load();
      onSubmitted(row.id);
    } catch {
      setError("등록에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card-bg p-4 shadow-ambient">
      <h3 className="font-display text-sm font-bold">🏆 리더보드</h3>

      {pendingDistance != null && (
        <div className="mt-3 rounded-xl bg-accent-soft p-3">
          <p className="text-xs text-accent">
            이번 기록 <b>{pendingDistance}m</b> — 이름을 남겨보세요!
          </p>
          <div className="mt-2 flex gap-2">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={12}
              placeholder="닉네임 (최대 12자)"
              className="flex-1 rounded-full border border-border px-3 py-1.5 text-xs"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              등록
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
      {loading ? (
        <p className="mt-3 text-xs text-text-muted">불러오는 중…</p>
      ) : (
        <ol className="mt-3 space-y-1">
          {rows.map((r, i) => (
            <li
              key={r.id}
              className={`flex items-center justify-between rounded-lg px-2 py-1 text-xs ${
                r.id === highlightId ? "bg-accent-soft font-bold text-accent" : ""
              }`}
            >
              <span className="text-text-secondary">
                {i + 1}. {r.nickname}
              </span>
              <span className="font-medium">{r.distance}m</span>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="text-xs text-text-muted">아직 기록이 없어요.</li>
          )}
        </ol>
      )}
    </div>
  );
}
