"use client";

import { useCallback, useLayoutEffect, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MAX_CHARS, decodeHash, encodeHash, splitChars, tidy } from "./message";
import Box, { Cars } from "./Box";
import styles from "./roadster.module.css";

/* ── 주소 뒤(#) 읽기 ────────────────────────────────
   글은 해시에만 있다. 서버는 해시를 모르니 서버 쪽 값은 null 로 두고
   첫 화면을 빈 하늘로 그린다 — 받는 사람·쓰는 사람 어느 쪽이 열어도
   하이드레이션이 어긋나지 않는다. */

const HASH_EVENT = "rb-hash";

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);
  window.addEventListener(HASH_EVENT, cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
    window.removeEventListener(HASH_EVENT, cb);
  };
}

function goHash(hash: string) {
  history.pushState(null, "", hash || window.location.pathname + window.location.search);
  window.dispatchEvent(new Event(HASH_EVENT));
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 별 자리(%)와 크기. 매번 같은 하늘이 뜨게 박아 둔다. */
const STARS: [number, number, number, number][] = [
  [6, 8, 2, 0], [18, 22, 1.5, 1.1], [31, 6, 2.5, 0.4], [44, 17, 1.5, 2.2], [57, 9, 2, 1.6],
  [69, 24, 1.5, 0.8], [82, 7, 2.5, 2.6], [93, 19, 1.5, 1.3], [11, 38, 1.5, 2.9], [26, 46, 2, 0.2],
  [74, 41, 2, 1.9], [88, 52, 1.5, 0.6], [38, 31, 1, 2.4], [63, 36, 1, 0.9], [50, 48, 1.5, 3.1],
  [3, 58, 1, 1.7], [97, 34, 1, 2.1],
];

export default function RoadsterBox() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => null);
  const [run, setRun] = useState(0);

  const text = hash === null ? null : decodeHash(hash);

  return (
    /* 개강 선물처럼 레이아웃 밖으로 나와 화면을 다 쓴다 */
    <div className={`${styles.sky} fixed inset-0 z-40 overflow-y-auto text-white`}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Jua&display=swap"
        precedence="default"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {STARS.map(([x, y, s, d]) => (
          <span
            key={`${x}-${y}`}
            className={`${styles.twinkle} absolute rounded-full bg-white`}
            style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s` }}
          />
        ))}
      </div>

      {hash === null ? null : text === null ? (
        <Composer />
      ) : (
        <Delivery key={run} text={text} onReplay={() => setRun((n) => n + 1)} />
      )}
    </div>
  );
}

/* ── 받는 쪽: 착륙 → 열림 → 흩어짐 → 제자리 ───────────── */

type Phase = "run" | "jump" | "land" | "center" | "open" | "scatter" | "settle" | "done";

/** 로드스터 공개 영상 순서 그대로: 달려와서 → 분사해 떠올라 킥플립 → 착지. 그다음 상자가 열린다 */
const AT = { jump: 700, land: 1950, center: 2500, open: 3350, scatter: 3950, settle: 4950 };

function Delivery({ text, onReplay }: { text: string; onReplay: () => void }) {
  const [phase, setPhase] = useState<Phase>(() => (prefersReducedMotion() ? "done" : "run"));
  const boxRef = useRef<HTMLDivElement>(null);

  const chars = splitChars(text);
  const lines: { ch: string; i: number }[][] = [[]];
  chars.forEach((ch, i) => {
    if (ch === "\n") lines.push([]);
    else lines[lines.length - 1].push({ ch, i });
  });
  const visible = chars.filter((c) => c !== "\n").length;
  const size = visible <= 10 ? 58 : visible <= 24 ? 44 : visible <= 40 ? 34 : 27;

  useEffect(() => {
    if (phase === "done") return;
    const settleEnd = AT.settle + visible * 45 + 900;
    const timers = [
      ...(Object.entries(AT) as [Phase, number][]).map(([p, ms]) =>
        window.setTimeout(() => setPhase(p), ms),
      ),
      window.setTimeout(() => setPhase("done"), settleEnd),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
    // 한 번 시작하면 끝까지 간다. 다시 보기는 key 를 바꿔 처음부터 탄다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
    글자마다 «상자 입구에서 내 자리까지»의 거리(--ox, --oy)와 흩어질 곳(--sx, --sy)을
    단다. 그리기 전에 재야 숨은 글자가 엉뚱한 데서 번쩍이지 않는다. offsetLeft 는
    transform 을 무시하니 글자가 어디로 날아가 있든 제자리를 잰다.
  */
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const place = () => {
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      const spread = Math.min(window.innerWidth * 0.95, 760);
      box.querySelectorAll<HTMLElement>("[data-ch]").forEach((el) => {
        const cx = el.offsetLeft + el.offsetWidth / 2;
        const cy = el.offsetTop + el.offsetHeight / 2;
        el.style.setProperty("--ox", `${w / 2 - cx}px`);
        el.style.setProperty("--oy", `${h - cy}px`);
        el.style.setProperty("--sx", `${(Math.random() - 0.5) * spread + (w / 2 - cx) * 0.3}px`);
        el.style.setProperty("--sy", `${-60 - Math.random() * 240 + (h - cy) * 0.4}px`);
        el.style.setProperty("--sr", `${(Math.random() - 0.5) * 540}deg`);
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  const before = phase === "run" || phase === "jump" || phase === "land" || phase === "center";
  const letters = before || phase === "open" ? styles.hidden : phase === "scatter" ? styles.scatter : styles.settle;
  const mover =
    phase === "run" ? styles.run : phase === "jump" ? styles.jump : phase === "land" ? styles.landed : styles.center;

  return (
    <div className={`${phase === "land" ? styles.shake : ""} relative flex min-h-full flex-col items-center justify-end overflow-hidden px-2 pb-[14vh]`}>
      <p
        className={`${styles.display} absolute left-0 right-0 top-[7vh] text-center text-[16px] text-white/65 transition-opacity duration-500 ${
          before ? "opacity-100" : "opacity-0"
        }`}
      >
        {phase === "run" || phase === "jump" ? "Do a kickflip! 📦" : "착지 성공! 상자를 엽니다"}
      </p>

      {/* 무대: 바닥 위에 차 다섯 대, 그 위를 상자가 넘는다. --bw 가 상자 너비다 */}
      <div
        className={`relative w-[min(96vw,1100px)] ${before ? "" : styles.opened}`}
        style={{ "--bw": "clamp(80px, 15vw, 170px)", height: "calc(var(--bw) * 0.84)" } as React.CSSProperties}
      >
        {/* 글자 상자. 바닥이 상자 덮개 높이에 맞아서 거기서 글자가 솟는다 */}
        <div
          ref={boxRef}
          role="status"
          aria-label={text}
          className={`${letters} ${styles.display} absolute left-1/2 w-[min(92vw,600px)] -translate-x-1/2 pb-6 text-center leading-[1.25] break-keep`}
          style={{
            bottom: "calc(var(--bw) * 0.72)",
            fontSize: size,
            textShadow: "0 0 18px rgba(255,214,120,.55), 0 2px 0 rgba(0,0,0,.35)",
          }}
        >
          {lines.map((line, n) => (
            <div key={n} className="min-h-[1em]">
              {line.map(({ ch, i }) => (
                <span
                  key={i}
                  data-ch
                  aria-hidden
                  className={styles.ch}
                  style={{ "--i": (i * 7) % 13, "--j": i } as React.CSSProperties}
                >
                  {ch}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div
          className={`absolute bottom-0 left-[24%] w-[52%] transition-all duration-700 ${
            phase === "run" || phase === "jump" || phase === "land" ? "" : "translate-y-3 opacity-0"
          }`}
        >
          <Cars />
        </div>

        <div className={`${styles.mover} ${mover}`}>
          <div className={styles.hop}>
            <div className={styles.flip}>
              <Box />
            </div>
          </div>
          {phase === "run" && <SpeedLines />}
          {phase === "jump" && <Jets />}
          {phase === "land" && <Dust />}
        </div>

        <div aria-hidden className="absolute -bottom-[3px] left-[-4vw] right-[-4vw] h-[3px] rounded-full bg-white/15" />
      </div>

      <div className="relative mt-10 flex h-[52px] w-full max-w-sm gap-3 px-2">
        {phase === "done" && (
          <>
            <button
              type="button"
              onClick={onReplay}
              className={`${styles.rise} flex-1 rounded-2xl border border-white/15 bg-white/5 text-[14px] font-medium text-white/85 transition hover:bg-white/10 active:scale-[0.98]`}
            >
              다시 보기
            </button>
            <button
              type="button"
              onClick={() => goHash("")}
              className={`${styles.rise} flex-1 rounded-2xl bg-[#e31b23] text-[14px] font-bold text-white transition hover:bg-[#f2333a] active:scale-[0.98]`}
            >
              나도 보내기 🚀
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** 달려올 때 상자 뒤로 끌리는 바람 줄 */
function SpeedLines() {
  return (
    <div aria-hidden className="pointer-events-none absolute right-full top-[30%] mr-2 flex w-16 flex-col items-end gap-2.5">
      {[100, 70, 85].map((w) => (
        <span key={w} className="block h-[3px] rounded-full bg-white/50" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

/** 떠오르는 순간 바닥 분사구에서 뿜는 냉가스 */
function Jets() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-full flex justify-around px-[8%]">
      {[0, 1].map((n) => (
        <span key={n} className={`${styles.jet} block h-10 w-5 rounded-full bg-gradient-to-b from-white to-white/0`} />
      ))}
    </div>
  );
}

/** 착지하는 순간 양옆으로 퍼지는 먼지 */
function Dust() {
  const puffs = [-60, -36, -14, 14, 36, 60];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
      {puffs.map((px, n) => (
        <span
          key={px}
          className={`${styles.puff} absolute bottom-0 h-7 w-7 rounded-full bg-[#c9c3d9]/60 blur-[3px]`}
          style={{ "--px": `${px}px`, left: `calc(50% + ${px / 2}px - 14px)`, animationDelay: `${n * 25}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ── 보내는 쪽: 글을 적고 링크를 만든다 ────────────────── */

function Composer() {
  const [draft, setDraft] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const count = splitChars(draft).length;
  const ready = tidy(draft) !== "";

  const make = () => {
    if (!ready) return;
    setLink(`${window.location.origin}${window.location.pathname}${encodeHash(draft)}`);
    setCopied(false);
  };

  const copy = useCallback(async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* 클립보드를 막아 둔 브라우저 — 위에 보이는 주소를 길게 눌러 복사하면 된다 */
    }
  }, [link]);

  const share = useCallback(async () => {
    if (!link) return;
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: "🚀 로드스터 택배가 도착했어요", url: link });
    } catch {
      /* 공유 창을 닫았다 */
    }
  }, [link, copy]);

  return (
    <div className="relative mx-auto flex min-h-full max-w-md flex-col justify-center px-5 py-12">
      <header className="text-center">
        <p className={`${styles.display} text-[14px] text-[#ff8a8a]`}>Do a kickflip! 📦</p>
        <h1 className={`${styles.display} mt-1 text-[42px] leading-tight`}>로드스터 택배</h1>
        <p className="mt-2 text-[14px] text-white/60 break-keep">
          적어서 보내면 택배 상자가 로드스터처럼 차 다섯 대를 킥플립으로 넘어 착지하고, 열리면서 글을 꺼내 줘요.
        </p>
      </header>

      <div className="mx-auto mt-8 w-[120px]">
        <Box />
      </div>
      <div aria-hidden className="mx-auto h-[3px] w-[min(70vw,280px)] rounded-full bg-white/15" />

      <label className="mt-8 block">
        <span className="sr-only">상자에 넣을 말</span>
        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(splitChars(e.target.value).slice(0, MAX_CHARS).join(""));
            setLink(null);
          }}
          rows={3}
          placeholder={"상자에 넣을 말을 적어 주세요\n예) 생일 축하해! 🎂"}
          className={`${styles.display} w-full resize-none rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-[19px] leading-snug text-white placeholder:text-white/35 focus:border-[#ff6b6b] focus:outline-none`}
        />
        <span className="mt-1 block text-right text-[12px] text-white/40">
          {count} / {MAX_CHARS}
        </span>
      </label>

      {!link ? (
        <button
          type="button"
          onClick={make}
          disabled={!ready}
          className="mt-3 rounded-2xl bg-[#e31b23] py-3.5 text-[15px] font-bold transition hover:bg-[#f2333a] active:scale-[0.98] disabled:opacity-35"
        >
          로드스터에 싣기 📦
        </button>
      ) : (
        <div className={`${styles.rise} mt-3`}>
          <p className="truncate rounded-xl bg-black/30 px-3 py-2.5 font-mono text-[12px] text-white/60">{link}</p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={share}
              className="flex-1 rounded-2xl bg-[#e31b23] py-3.5 text-[15px] font-bold transition hover:bg-[#f2333a] active:scale-[0.98]"
            >
              보내기 🚀
            </button>
            <button
              type="button"
              onClick={copy}
              className="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3.5 text-[14px] font-medium text-white/85 transition hover:bg-white/10 active:scale-[0.98]"
            >
              {copied ? "복사했어요" : "링크 복사"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => goHash(encodeHash(draft))}
            className="mt-3 w-full py-2 text-[13px] text-white/55 underline underline-offset-4 hover:text-white/80"
          >
            받는 사람 화면 미리 보기
          </button>
        </div>
      )}

      <p className="mt-10 text-center text-[11px] text-white/30 break-keep">
        글은 링크 주소 안에만 담겨요. 어디에도 저장하지 않습니다.
      </p>
    </div>
  );
}
