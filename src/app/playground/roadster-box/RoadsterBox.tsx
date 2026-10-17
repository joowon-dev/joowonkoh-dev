"use client";

import { useCallback, useLayoutEffect, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MAX_CHARS, decodeHash, encodeHash, splitChars, tidy } from "./message";
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
      {/* 별은 쓰는 화면에만. 받는 화면은 영상이 다 덮는다 */}
      {text === null && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {STARS.map(([x, y, s, d]) => (
            <span
              key={`${x}-${y}`}
              className={`${styles.twinkle} absolute rounded-full bg-white`}
              style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s` }}
            />
          ))}
        </div>
      )}

      {hash === null ? null : text === null ? (
        <Composer />
      ) : (
        <Delivery key={run} text={text} onReplay={() => setRun((n) => n + 1)} />
      )}
    </div>
  );
}

/* ── 받는 쪽: 영상 → 열린 상자에서 글자가 흩어졌다 모인다 ─────
   영상은 힉스필드로 뽑은 세 컷을 이어 붙인 것이다: 상자가 램프를 타고 벽을
   올라가 킥플립 → 연기 속 착지 → 덮개가 열리며 빛. 글은 사람마다 다르니
   영상에 넣지 않고, 마지막 컷 위에 DOM 글자로 얹는다. */

const CLIP = "/playground/roadster-box/delivery.mp4";
const POSTER = "/playground/roadster-box/poster.jpg";
/** 영상 마지막 프레임. 움직임 줄이기 설정이면 영상 대신 이걸 띄운다 */
const FINAL = "/playground/roadster-box/final.jpg";
/** 영상 끝에서 몇 초 전에 글자가 튀어나오나. 덮개가 다 열리고 빛이 솟는 때에 맞췄다 */
const LETTERS_BEFORE_END = 2.6;
/** 마지막 프레임에서 열린 상자 입구의 높이(위에서부터, 프레임 높이 비율) */
const BOX_MOUTH = 0.53;

type Phase = "ready" | "play" | "scatter" | "settle" | "done";

function Delivery({ text, onReplay }: { text: string; onReplay: () => void }) {
  const [phase, setPhase] = useState<Phase>(() => (prefersReducedMotion() ? "done" : "play"));
  const calm = phase === "done" && prefersReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const chars = splitChars(text);
  const lines: { ch: string; i: number }[][] = [[]];
  chars.forEach((ch, i) => {
    if (ch === "\n") lines.push([]);
    else lines[lines.length - 1].push({ ch, i });
  });
  const visible = chars.filter((c) => c !== "\n").length;
  const size = visible <= 10 ? 58 : visible <= 24 ? 46 : visible <= 40 ? 37 : 30;
  /* 가장 긴 줄이 프레임 폭(cqw)을 넘지 않게 줄인다. 폰에서는 프레임이 화면보다 좁아진다 */
  const longest = Math.max(1, ...lines.map((l) => l.length));
  const fontSize = `min(${size}px, ${Math.floor(96 / Math.min(longest, 12))}cqw)`;

  /* 소리 없는 영상이라 대부분 바로 돈다. 막히면(저전력 모드 등) 눌러서 시작한다 */
  useEffect(() => {
    videoRef.current?.play().catch(() => setPhase("ready"));
  }, []);

  useEffect(() => {
    if (phase === "scatter") {
      const t = window.setTimeout(() => setPhase("settle"), 1000);
      return () => window.clearTimeout(t);
    }
    if (phase === "settle") {
      const t = window.setTimeout(() => setPhase("done"), visible * 45 + 900);
      return () => window.clearTimeout(t);
    }
  }, [phase, visible]);

  const onTime = () => {
    const v = videoRef.current;
    if (!v || phase !== "play" || !v.duration) return;
    if (v.currentTime >= v.duration - LETTERS_BEFORE_END) setPhase("scatter");
  };

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
      const spread = Math.min(window.innerWidth * 0.95, 560);
      box.querySelectorAll<HTMLElement>("[data-ch]").forEach((el) => {
        const cx = el.offsetLeft + el.offsetWidth / 2;
        const cy = el.offsetTop + el.offsetHeight / 2;
        el.style.setProperty("--ox", `${w / 2 - cx}px`);
        el.style.setProperty("--oy", `${h - cy}px`);
        el.style.setProperty("--sx", `${(Math.random() - 0.5) * spread + (w / 2 - cx) * 0.3}px`);
        el.style.setProperty("--sy", `${-60 - Math.random() * 260 + (h - cy) * 0.4}px`);
        el.style.setProperty("--sr", `${(Math.random() - 0.5) * 540}deg`);
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  const letters =
    phase === "ready" || phase === "play" ? styles.hidden : phase === "scatter" ? styles.scatter : styles.settle;

  return (
    <div className="flex min-h-full items-center justify-center bg-black">
      {/*
        영상 프레임(9:16). 폰에서는 화면 높이를 다 채우고 옆이 잘린다 — 상자가
        가운데라 잘려도 괜찮다. 넓은 화면에서는 세로 프레임이 가운데 선다.
        글자 위치는 이 프레임 높이 기준이라 어느 쪽이든 상자 입구에 맞는다.
      */}
      <div className="relative aspect-[9/16] h-[100dvh] max-w-full overflow-hidden [container-type:inline-size]">
        {calm ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={FINAL} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            src={CLIP}
            poster={POSTER}
            muted
            playsInline
            preload="auto"
            onTimeUpdate={onTime}
            onEnded={() => setPhase((p) => (p === "play" ? "scatter" : p))}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {phase === "ready" && (
          <button
            type="button"
            onClick={() => {
              setPhase("play");
              void videoRef.current?.play();
            }}
            className="absolute inset-0 flex flex-col items-center justify-end bg-black/30 pb-[18vh]"
          >
            <span className={`${styles.display} animate-pulse rounded-full bg-white/15 px-6 py-3 text-[18px] backdrop-blur`}>
              📦 눌러서 택배 받기
            </span>
          </button>
        )}

        {/* 글자 상자. 바닥이 열린 상자 입구 높이에 맞아서 거기서 글자가 솟는다 */}
        <div
          ref={boxRef}
          role="status"
          aria-label={text}
          className={`${letters} ${styles.display} pointer-events-none absolute left-1/2 w-[min(92%,520px)] -translate-x-1/2 pb-5 text-center leading-[1.25] break-keep`}
          style={{
            bottom: `${(1 - BOX_MOUTH) * 100}%`,
            fontSize,
            // 뒤가 금빛 기둥이라 밝다. 어두운 테두리를 먼저 둘러야 흰 글자가 읽힌다
            textShadow: "0 0 3px rgba(60,30,0,.9), 0 2px 14px rgba(0,0,0,.65), 0 0 28px rgba(255,200,90,.6)",
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

        <div className="absolute inset-x-0 bottom-0 flex h-[124px] items-end gap-3 bg-gradient-to-t from-black/80 to-transparent px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
          {phase === "done" && (
            <>
              <button
                type="button"
                onClick={onReplay}
                className={`${styles.rise} h-[52px] flex-1 rounded-2xl border border-white/20 bg-white/10 text-[14px] font-medium text-white/90 backdrop-blur transition hover:bg-white/15 active:scale-[0.98]`}
              >
                다시 보기
              </button>
              <button
                type="button"
                onClick={() => goHash("")}
                className={`${styles.rise} h-[52px] flex-1 rounded-2xl bg-[#e31b23] text-[14px] font-bold text-white transition hover:bg-[#f2333a] active:scale-[0.98]`}
              >
                나도 보내기 📦
              </button>
            </>
          )}
        </div>
      </div>
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
          적어서 보내면 택배 상자가 로드스터처럼 벽을 타고 올라가 킥플립으로 날아와 착지하고, 열리면서 글을 꺼내 줘요.
        </p>
      </header>

      {/* 영상 첫 장면을 미리 보여 준다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={POSTER}
        alt="콘크리트 램프 앞에 놓인 택배 상자"
        className="mx-auto mt-8 aspect-[9/16] w-[150px] rounded-2xl object-cover shadow-[0_10px_40px_rgba(0,0,0,.6)] ring-1 ring-white/10"
      />

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
