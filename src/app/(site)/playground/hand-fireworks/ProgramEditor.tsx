"use client";

import { useState } from "react";
import { BURST_HUES, BURST_KINDS, type BurstKind, type Shot } from "./firework";
import {
  MAX_SHOTS,
  addShot,
  removeShot,
  replaceShot,
  suggestShot,
  type Program,
} from "./program";

const KIND_LABELS: Record<BurstKind, string> = {
  peony: "국화",
  ring: "고리",
  willow: "버들가지",
  double: "겹불꽃",
};

/**
 * 한 발을 나타내는 그림. 폭발 모양을 그대로 줄인 것이라 이름을 안 읽어도 뭔지 안다.
 * 색은 실제로 터질 색을 그대로 쓴다 — 팔레트 견본이 아니라 «이 발이 어떻게 보일지»다.
 */
export function ShotGlyph({ shot, size = 28 }: { shot: Shot; size?: number }) {
  const c = `hsl(${shot.hue}, 95%, 62%)`;
  const dim = `hsl(${shot.hue}, 90%, 45%)`;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden className="shrink-0">
      {shot.kind === "peony" && (
        <>
          <g stroke={c} strokeWidth="1.6" strokeLinecap="round">
            <path d="M16 16 L16 5 M16 16 L24 8 M16 16 L27 16 M16 16 L24 24 M16 16 L16 27 M16 16 L8 24 M16 16 L5 16 M16 16 L8 8" />
          </g>
          <g fill={c}>
            {[
              [16, 4],
              [25, 7],
              [28, 16],
              [25, 25],
              [16, 28],
              [7, 25],
              [4, 16],
              [7, 7],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" />
            ))}
          </g>
        </>
      )}
      {shot.kind === "ring" && (
        <>
          <circle cx="16" cy="16" r="10" fill="none" stroke={dim} strokeWidth="1.2" />
          <g fill={c}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <circle key={i} cx={16 + Math.cos(a) * 10} cy={16 + Math.sin(a) * 10} r="2.1" />
              );
            })}
          </g>
        </>
      )}
      {shot.kind === "willow" && (
        <g stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M16 12 C10 14 7 20 7 27" />
          <path d="M16 12 C13 15 12 21 12 28" />
          <path d="M16 12 C19 15 20 21 20 28" />
          <path d="M16 12 C22 14 25 20 25 27" />
          <circle cx="16" cy="11" r="2.4" fill={c} stroke="none" />
        </g>
      )}
      {shot.kind === "double" && (
        <>
          <g fill={c}>
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return (
                <circle key={i} cx={16 + Math.cos(a) * 11} cy={16 + Math.sin(a) * 11} r="1.9" />
              );
            })}
          </g>
          <g fill={`hsl(${(shot.hue + 150) % 360}, 95%, 66%)`}>
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i / 6) * Math.PI * 2 + 0.5;
              return (
                <circle key={i} cx={16 + Math.cos(a) * 5} cy={16 + Math.sin(a) * 5} r="1.8" />
              );
            })}
          </g>
        </>
      )}
    </svg>
  );
}

export function shotLabel(shot: Shot): string {
  return `${KIND_LABELS[shot.kind]} · ${hueName(shot.hue)}`;
}

/** 색 이름. 팔레트 밖 색이 저장돼 있을 수 있어 각도로 가른다. */
function hueName(hue: number): string {
  if (hue < 20 || hue >= 330) return "빨강";
  if (hue < 40) return "주황";
  if (hue < 70) return "금색";
  if (hue < 165) return "초록";
  if (hue < 200) return "청록";
  if (hue < 250) return "파랑";
  if (hue < 300) return "보라";
  return "분홍";
}

export default function ProgramEditor({
  program,
  onChange,
  /** 다음에 나갈 칸. 어디까지 왔는지 보여준다 */
  cursor,
}: {
  program: Program;
  onChange: (next: Program) => void;
  cursor: number | null;
}) {
  /** 열려 있는 편집 칸. 하나씩만 연다 — 여럿 열면 패널이 세로로 한없이 길어진다 */
  const [editing, setEditing] = useState<number | null>(null);
  const full = program.length >= MAX_SHOTS;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card-bg p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">불꽃 세팅</h2>
        {program.length > 0 && (
          <button
            onClick={() => {
              onChange([]);
              setEditing(null);
            }}
            className="text-xs text-text-muted underline underline-offset-2 hover:text-text-primary"
          >
            무작위로 돌려놓기
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-text-muted">
        {program.length === 0
          ? "지금은 쏠 때마다 무작위입니다. 발을 추가하면 짠 순서대로 나갑니다."
          : `${program.length}발을 이 순서로 반복합니다. 칸을 누르면 바꿉니다.`}
      </p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {program.map((shot, i) => {
          const isNext = cursor === i;
          return (
            <li key={i}>
              <button
                onClick={() => setEditing(editing === i ? null : i)}
                aria-label={`${i + 1}번째 발 ${shotLabel(shot)}${isNext ? " (다음 차례)" : ""}`}
                aria-expanded={editing === i}
                className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-[#0b1026] transition ${
                  editing === i
                    ? "ring-2 ring-accent"
                    : isNext
                      ? "ring-2 ring-white/70"
                      : "ring-1 ring-white/10 hover:ring-white/30"
                }`}
              >
                <ShotGlyph shot={shot} />
                <span className="absolute left-1 top-0.5 text-[10px] text-white/40">{i + 1}</span>
              </button>
            </li>
          );
        })}

        {!full && (
          <li>
            <button
              onClick={() => {
                onChange(addShot(program, suggestShot(program)));
                setEditing(program.length);
              }}
              aria-label="발 추가"
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-border text-xl text-text-muted transition hover:border-accent hover:text-accent"
            >
              +
            </button>
          </li>
        )}
      </ul>

      {editing !== null && program[editing] && (
        <div className="mt-4 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">
              {editing + 1}번째 발 — {shotLabel(program[editing])}
            </p>
            <button
              onClick={() => {
                onChange(removeShot(program, editing));
                setEditing(null);
              }}
              className="text-xs text-text-muted underline underline-offset-2 hover:text-text-primary"
            >
              이 발 빼기
            </button>
          </div>

          <p className="mt-3 text-[11px] tracking-[0.1em] text-text-muted uppercase">모양</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BURST_KINDS.map((kind) => {
              const on = program[editing].kind === kind;
              return (
                <button
                  key={kind}
                  onClick={() => onChange(replaceShot(program, editing, { ...program[editing], kind }))}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                    on ? "bg-accent text-white" : "border border-border hover:border-accent"
                  }`}
                >
                  <ShotGlyph shot={{ kind, hue: program[editing].hue }} size={16} />
                  {KIND_LABELS[kind]}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] tracking-[0.1em] text-text-muted uppercase">색</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BURST_HUES.map((hue) => {
              const on = program[editing].hue === hue;
              return (
                <button
                  key={hue}
                  onClick={() => onChange(replaceShot(program, editing, { ...program[editing], hue }))}
                  aria-label={hueName(hue)}
                  aria-pressed={on}
                  style={{ background: `hsl(${hue}, 95%, 60%)` }}
                  className={`h-7 w-7 rounded-full transition ${
                    on ? "ring-2 ring-accent ring-offset-2 ring-offset-card-bg" : "hover:scale-110"
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
