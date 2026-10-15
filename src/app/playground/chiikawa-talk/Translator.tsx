"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { CHARACTERS, type Character } from "./lexicon";
import { toText, translate } from "./translate";
import { untranslate } from "./untranslate";

/** 한글 → 먼작귀(to), 먼작귀 → 한글(from). */
type Mode = "to" | "from";

const EXAMPLE: Record<Mode, string> = {
  to: "오늘 너무 배고파요 ㅠㅠ 맛있는 거 먹고 싶다!",
  from: "야하! 우라! 푸루루루",
};

/** 친구마다 말풍선·탭 색. 누군지 모를 때는 크림색. */
const TINT: Record<Character | "unknown", string> = {
  chiikawa: "#ffd9e4",
  hachiware: "#d4e8ff",
  usagi: "#fff0b3",
  unknown: "#fffaf0",
};

const nameOf = (id: Character) => CHARACTERS.find((c) => c.id === id)!.name;

export default function Translator() {
  const [mode, setMode] = useState<Mode>("to");
  const [draft, setDraft] = useState(EXAMPLE.to);
  const [said, setSaid] = useState(EXAMPLE.to);
  const [who, setWho] = useState<Character>("chiikawa");

  /** 모드를 바꾸면서 입력도 같이 채운다. */
  const switchTo = (next: Mode, text = EXAMPLE[next]) => {
    setMode(next);
    setDraft(text);
    setSaid(text);
  };

  const forward = useMemo(() => translate(said, who), [said, who]);
  const reading = useMemo(() => untranslate(said), [said]);

  const bubble =
    mode === "to"
      ? {
          face: who as Character | null,
          label: nameOf(who),
          tokens: forward.flatMap((s) => s.tokens),
          footnote: forward.map((s) => s.source).join(" "),
          copy: toText(forward),
        }
      : {
          face: reading.who,
          label: reading.who ? `아마 ${nameOf(reading.who)}가 이렇게 말했나 봐` : "누가 한 말인지 모르겠어…",
          tokens: reading.parts.map((p) => p.meaning),
          footnote: reading.parts.map((p) => p.source).join(" "),
          copy: reading.parts.map((p) => p.meaning).join(" "),
        };

  return (
    <div className="mx-auto w-full max-w-[640px] px-4">
      {/* 어느 쪽으로 통역할까 */}
      <div role="radiogroup" aria-label="통역 방향" className="ct-switch mx-auto mb-5">
        {(["to", "from"] as const).map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={mode === m}
            onClick={() => mode !== m && switchTo(m)}
            className="ct-display"
            data-on={mode === m || undefined}
          >
            {m === "to" ? "한글 → 먼작귀" : "먼작귀 → 한글"}
          </button>
        ))}
      </div>

      {/* 누가 말할까 — 거꾸로 통역에서는 말한 친구를 짐작하니 고르지 않는다 */}
      {mode === "to" && (
        <div role="tablist" aria-label="통역할 친구" className="grid grid-cols-3 gap-3">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={who === c.id}
              onClick={() => setWho(c.id)}
              className="ct-tab"
              style={{ background: who === c.id ? TINT[c.id] : undefined }}
            >
              <Face id={c.id} className={who === c.id ? "ct-bob" : ""} />
              <span className="ct-display text-[17px]">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* 적는 곳 */}
      <form
        className="ct-card mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSaid(draft);
        }}
      >
        <label htmlFor="ct-input" className="ct-display block text-[15px] opacity-70">
          {mode === "to" ? "한글로 적어 줘" : "먼작귀 말을 적어 줘"}
        </label>
        <textarea
          id="ct-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              setSaid(draft);
            }
          }}
          rows={3}
          maxLength={300}
          placeholder={mode === "to" ? "예) 시험 망했어… 무서워" : "예) 흐에에… 우…"}
          className="mt-2 w-full resize-none bg-transparent text-[17px] leading-relaxed outline-none placeholder:text-[#4b3a35]/35"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[12px] opacity-45">
            {mode === "to"
              ? CHARACTERS.find((c) => c.id === who)!.hint
              : "소리로 짐작하는 거라 딱 맞진 않아"}
          </span>
          <button type="submit" className="ct-btn ct-display">
            통역하기 ✦
          </button>
        </div>
      </form>

      {/* 말풍선 — 내용이 바뀌면 다시 마운트해서 타자가 처음부터 */}
      <Bubble
        key={`${mode}:${who}:${said}`}
        face={bubble.face}
        label={bubble.label}
        tokens={bubble.tokens}
        footnote={bubble.footnote}
        copy={bubble.copy}
        onReverse={mode === "to" && bubble.tokens.length > 0 ? () => switchTo("from", bubble.copy) : undefined}
      />
    </div>
  );
}

function Bubble({
  face,
  label,
  tokens,
  footnote,
  copy,
  onReverse,
}: {
  face: Character | null;
  label: string;
  tokens: string[];
  footnote: string;
  copy: string;
  /** 있으면 「거꾸로 해 보기」 버튼을 띄운다. */
  onReverse?: () => void;
}) {
  const [shown, setShown] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tokens.length === 0) return;
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n + 1 >= tokens.length) window.clearInterval(id);
        return n + 1;
      });
    }, 140);
    return () => window.clearInterval(id);
  }, [tokens]);

  const empty = tokens.length === 0;
  const tint = TINT[face ?? "unknown"];

  return (
    <section aria-live="polite" className="mt-7 flex items-end gap-3">
      <Face id={face} className="ct-bob shrink-0" big />
      <div className="ct-bubble min-w-0 flex-1" style={{ background: tint, ["--ct-fill" as string]: tint }}>
        <p className="ct-display text-[12px] opacity-55">{label}</p>
        <p className="ct-display mt-1 min-h-[1.6em] text-[24px] leading-snug break-keep">
          {empty ? (
            <span className="opacity-40">…</span>
          ) : (
            tokens.slice(0, shown).map((t, i) => (
              <span key={i} className="ct-pop mr-2 inline-block">
                {t}
              </span>
            ))
          )}
        </p>
        {!empty && (
          <div className="mt-3 flex items-end justify-between gap-3 border-t-2 border-dashed border-[#4b3a35]/15 pt-2">
            <p className="min-w-0 text-[12.5px] leading-relaxed opacity-55 break-keep">{footnote}</p>
            <div className="flex shrink-0 gap-1.5">
              {onReverse && (
                <button type="button" className="ct-chip" onClick={onReverse}>
                  거꾸로 ↺
                </button>
              )}
              <button
                type="button"
                className="ct-chip"
                onClick={() => {
                  void navigator.clipboard?.writeText(copy).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  });
                }}
              >
                {copied ? "복사했어!" : "복사"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** 친구 그림(public/playground/chiikawa-talk). 누군지 모르면 「?」 동그라미. */
function Face({
  id,
  className = "",
  big,
}: {
  id: Character | null;
  className?: string;
  big?: boolean;
}) {
  const size = big ? "h-[92px] w-[92px]" : "h-[64px] w-[64px]";
  if (id) {
    return (
      <Image
        src={`/playground/chiikawa-talk/${id}.webp`}
        alt=""
        width={220}
        height={220}
        priority
        className={`${size} object-contain ${className}`}
        draggable={false}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${size} ct-display grid place-items-center rounded-full border-[3px] border-[#4b3a35] bg-white text-[22px] ${className}`}
    >
      ?
    </span>
  );
}
