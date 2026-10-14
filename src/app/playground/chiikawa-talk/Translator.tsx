"use client";

import { useEffect, useMemo, useState } from "react";

import { loadSprites } from "../desktop-chiikawa/sprites";
import { CHARACTERS, type Character } from "./lexicon";
import { toText, translate, type Sentence } from "./translate";

const EXAMPLE = "오늘 너무 배고파요 ㅠㅠ 맛있는 거 먹고 싶다!";

/** 친구마다 말풍선·탭 색. */
const TINT: Record<Character, string> = {
  chiikawa: "#ffd9e4",
  hachiware: "#d4e8ff",
  usagi: "#fff0b3",
};

export default function Translator() {
  const [draft, setDraft] = useState(EXAMPLE);
  const [said, setSaid] = useState(EXAMPLE);
  const [who, setWho] = useState<Character>("chiikawa");
  const [urls, setUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let alive = true;
    void loadSprites().then((r) => {
      if (alive) setUrls(r.urls);
    });
    return () => {
      alive = false;
    };
  }, []);

  const result = useMemo(() => translate(said, who), [said, who]);
  const friend = CHARACTERS.find((c) => c.id === who)!;

  return (
    <div className="mx-auto w-full max-w-[640px] px-4">
      {/* 누가 말할까 */}
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
            <Face id={c.id} url={urls.get(c.id)} className={who === c.id ? "ct-bob" : ""} />
            <span className="ct-display text-[17px]">{c.name}</span>
          </button>
        ))}
      </div>

      {/* 한글 적는 곳 */}
      <form
        className="ct-card mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSaid(draft);
        }}
      >
        <label htmlFor="ct-input" className="ct-display block text-[15px] opacity-70">
          한글로 적어 줘
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
          placeholder="예) 시험 망했어… 무서워"
          className="mt-2 w-full resize-none bg-transparent text-[17px] leading-relaxed outline-none placeholder:text-[#4b3a35]/35"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[12px] opacity-45">{friend.hint}</span>
          <button type="submit" className="ct-btn ct-display">
            통역하기 ✦
          </button>
        </div>
      </form>

      {/* 말풍선 — 친구나 문장이 바뀌면 다시 마운트해서 타자가 처음부터 */}
      <Bubble
        key={`${who}:${said}`}
        who={who}
        url={urls.get(who)}
        name={friend.name}
        sentences={result}
      />
    </div>
  );
}

function Bubble({
  who,
  url,
  name,
  sentences,
}: {
  who: Character;
  url?: string;
  name: string;
  sentences: Sentence[];
}) {
  const tokens = useMemo(() => sentences.flatMap((s) => s.tokens), [sentences]);
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

  return (
    <section aria-live="polite" className="mt-7 flex items-end gap-3">
      <Face id={who} url={url} className="ct-bob shrink-0" big />
      <div className="ct-bubble min-w-0 flex-1" style={{ background: TINT[who], ["--ct-fill" as string]: TINT[who] }}>
        <p className="ct-display text-[12px] opacity-55">{name}</p>
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
            <p className="min-w-0 text-[12.5px] leading-relaxed opacity-55 break-keep">
              {sentences.map((s) => s.source).join(" ")}
            </p>
            <button
              type="button"
              className="ct-chip shrink-0"
              onClick={() => {
                void navigator.clipboard?.writeText(toText(sentences)).then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                });
              }}
            >
              {copied ? "복사했어!" : "복사"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/** 친구 그림. 아직 못 받았거나 못 받으면 이름 첫 글자 동그라미. */
function Face({ id, url, className = "", big }: { id: Character; url?: string; className?: string; big?: boolean }) {
  const size = big ? "h-[92px] w-[92px]" : "h-[64px] w-[64px]";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- 런타임에 받은 data URL 이라 next/image 를 못 쓴다.
    return <img src={url} alt="" className={`${size} object-contain ${className}`} draggable={false} />;
  }
  const name = CHARACTERS.find((c) => c.id === id)!.name;
  return (
    <span
      aria-hidden
      className={`${size} ct-display grid place-items-center rounded-full border-[3px] border-[#4b3a35] bg-white text-[22px] ${className}`}
    >
      {name[0]}
    </span>
  );
}
