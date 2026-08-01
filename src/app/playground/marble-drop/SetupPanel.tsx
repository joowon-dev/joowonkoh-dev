"use client";

import { useMemo, useState } from "react";
import { MAX_PLAYERS, MIN_PLAYERS, parseNames } from "./setup";

interface SetupPanelProps {
  initialRaw?: string;
  onStart: (names: string[], raw: string) => void;
  onBack: () => void;
}

export default function SetupPanel({ initialRaw = "", onStart, onBack }: SetupPanelProps) {
  const [raw, setRaw] = useState(initialRaw);
  const names = useMemo(() => parseNames(raw), [raw]);

  const tooFew = names.length < MIN_PLAYERS;
  const tooMany = names.length > MAX_PLAYERS;
  const canStart = !tooFew && !tooMany;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 block text-xs text-text-muted underline-offset-4 transition hover:text-text-primary hover:underline"
      >
        ← 뒤로
      </button>
      <span className="mb-3 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Marble Drop
      </span>
      <h1 className="font-display text-2xl font-bold leading-snug tracking-tight md:text-3xl">
        구슬 폭포 추첨기
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        사람마다 양동이가 하나씩 놓이고 위에서 구슬이 쏟아집니다. 회전 바·범퍼·물레방아에
        얻어맞으며 흩어지다가, 양동이를 가장 먼저 채운 사람이 당첨.
      </p>

      <label htmlFor="players" className="mt-8 block text-xs font-medium text-text-muted">
        참가자 (줄바꿈 또는 쉼표로 구분)
      </label>
      <textarea
        id="players"
        aria-describedby="players-status"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={8}
        placeholder={"주원\n민지\n현우\n서연"}
        // 모바일에서 글꼴이 16px보다 작으면 iOS Safari가 입력창을 누르는 순간 화면을 자동
        // 확대하고, 그 상태에서 가로 스크롤이 생긴다. 작은 화면에서는 16px을 유지한다.
        className="mt-2 w-full resize-y rounded-2xl border border-border bg-card-bg p-4 font-mono text-base text-text-primary outline-none transition focus:border-accent sm:text-sm"
      />

      <div className="mt-3 flex items-center justify-between text-xs">
        <span id="players-status" role="status" aria-live="polite" className="text-text-muted">
          {names.length}명
          {tooFew && ` — ${MIN_PLAYERS}명 이상 넣어주세요`}
          {tooMany && ` — 최대 ${MAX_PLAYERS}명까지`}
        </span>
        <button
          type="button"
          onClick={() => setRaw("")}
          className="text-text-muted underline-offset-4 transition hover:text-text-primary hover:underline"
        >
          비우기
        </button>
      </div>

      {names.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {names.map((name) => (
            <span
              key={name}
              className="rounded-full bg-tag-bg px-2.5 py-0.5 text-[11px] font-medium text-text-muted"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={!canStart}
        aria-describedby="players-status"
        onClick={() => onStart(names, raw)}
        className="mt-8 w-full rounded-2xl bg-accent px-6 py-4 font-display text-sm font-semibold text-white shadow-ambient transition hover:shadow-ambient-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        구슬 쏟아붓기
      </button>
    </div>
  );
}
