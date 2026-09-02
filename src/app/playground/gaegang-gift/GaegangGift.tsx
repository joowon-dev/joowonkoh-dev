"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatPercent, semesterStatus, SEMESTER_END, SEMESTER_START } from "./semester";
import styles from "./gift.module.css";

/** 뚜껑이 날아가고 나서 속을 보여주기까지. 짧으면 선물처럼 안 보이고 길면 지루하다. */
const REVEAL_MS = 950;

const CONFETTI_COLORS = ["#f4c95d", "#ef6f6c", "#5bc0be", "#c77dff", "#f7f7f2", "#7bd389"];

interface Piece {
  id: number;
  left: number;
  color: string;
  dx: number;
  dur: number;
  delay: number;
  spin: number;
  w: number;
  h: number;
}

function makeConfetti(): Piece[] {
  return Array.from({ length: 44 }, (_, id) => ({
    id,
    left: 50 + (Math.random() - 0.5) * 46,
    color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
    dx: (Math.random() - 0.5) * 420,
    dur: 2.4 + Math.random() * 2.2,
    delay: Math.random() * 0.35,
    spin: 360 + Math.random() * 900,
    w: 6 + Math.random() * 6,
    h: 9 + Math.random() * 8,
  }));
}

const KST_DATE = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
});

export default function GaegangGift() {
  const [opened, setOpened] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [confetti, setConfetti] = useState<Piece[]>([]);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  const open = useCallback(() => {
    if (opened) return;
    setOpened(true);
    setNow(new Date());
    setConfetti(makeConfetti());
  }, [opened]);

  /*
    시계는 상자를 연 뒤에만 돈다. 서버에서 날짜를 한 번도 안 그리기 때문에
    하이드레이션에서 시각이 어긋날 일이 없다 — 첫 화면은 어느 쪽에서 그려도
    닫힌 상자 하나뿐이다.
  */
  useEffect(() => {
    if (!opened) return;
    const reveal = window.setTimeout(() => setRevealed(true), REVEAL_MS);
    const tick = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.clearTimeout(reveal);
      window.clearInterval(tick);
    };
  }, [opened]);

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const status = useMemo(() => (now ? semesterStatus(now) : null), [now]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* 클립보드를 막아 둔 브라우저 — 주소창을 복사하면 되니 조용히 넘어간다 */
    }
  }, []);

  return (
    /*
      다른 플레이그라운드와 같이 fixed로 레이아웃을 벗어난다. 헤더 아래 좁은
      단 안에 갇히면 «대화방에서 열린 선물»이 아니라 블로그 글의 삽화가 된다.
      열고 나면 카드만큼 길어져서 세로 스크롤은 열어 둔다.
    */
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#141a2e] text-white">
      <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-6 py-16">
      <Backdrop />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {!opened && (
          <p className="mb-8 rounded-full bg-white/10 px-4 py-1.5 text-[12px] font-medium tracking-[0.12em] text-white/70">
            개강 선물
          </p>
        )}

        <button
          type="button"
          onClick={open}
          disabled={opened}
          aria-label={opened ? "열린 선물 상자" : "선물 상자 열기"}
          className="relative outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#141a2e] rounded-3xl disabled:cursor-default"
        >
          <GiftBox opened={opened} />
        </button>

        {!opened && (
          <p className="mt-8 animate-pulse text-[15px] text-white/75">
            눌러서 열어보세요
          </p>
        )}

        {revealed && status && now && (
          <div className={`${styles.rise} mt-10 w-full`}>
            <ProgressCard
              progress={status.progress}
              daysLeft={status.daysLeft}
              phase={status.phase}
              now={now}
            />

            <button
              type="button"
              onClick={copyLink}
              className="mt-6 w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 text-[14px] font-medium text-white/85 transition hover:bg-white/10 active:scale-[0.98]"
            >
              {copied ? "링크를 복사했어요" : "나도 친구 놀리기 — 링크 복사"}
            </button>
          </div>
        )}
      </div>

      {/* 색종이는 화면 전체에 뿌린다. 클릭을 먹지 않게 pointer-events를 끈다. */}
      {opened && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {confetti.map((p) => (
            <span
              key={p.id}
              className={styles.piece}
              style={
                {
                  position: "absolute",
                  top: "38%",
                  left: `${p.left}%`,
                  width: p.w,
                  height: p.h,
                  borderRadius: 2,
                  background: p.color,
                  "--dx": `${p.dx}px`,
                  "--dur": `${p.dur}s`,
                  "--delay": `${p.delay}s`,
                  "--spin": `${p.spin}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

/** 진행률 카드. 이 페이지가 하고 싶은 말은 전부 여기에 있다. */
function ProgressCard({
  progress,
  daysLeft,
  phase,
  now,
}: {
  progress: number;
  daysLeft: number;
  phase: "before" | "during" | "after";
  now: Date;
}) {
  if (phase === "after") {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 text-center">
        <p className="text-[15px] text-white/70">학기 진행률</p>
        <p className="mt-3 font-display text-4xl font-bold">100%</p>
        <p className="mt-4 text-[15px] text-white/80">방학입니다 🎉 마음껏 노세요.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-7">
      <p className="text-center text-[13px] tracking-[0.14em] text-white/55">학기 진행률</p>

      {/*
        바는 소수점 단위로만 움직인다. 1초마다 갱신하지만 보통은 눈에 안 띈다 —
        «열심히 봐도 안 자라는 막대»가 이 선물의 내용물이다. width에 transition을
        걸어 두면 갱신 순간이 튀지 않고 스르륵 흐른다.
      */}
      <div className="mt-5 h-3.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#f4c95d] to-[#ef6f6c] transition-[width] duration-1000 ease-linear"
          style={{ width: `max(6px, ${progress * 100}%)` }}
        />
      </div>

      <p className="mt-4 text-center font-display text-4xl font-bold tabular-nums">
        {formatPercent(progress)}
      </p>

      <div className="mt-2 flex justify-between text-[12px] text-white/45">
        <span>개강 {KST_DATE.format(new Date(SEMESTER_START))}</span>
        <span>종강 {KST_DATE.format(new Date(SEMESTER_END))}</span>
      </div>

      <hr className="my-6 border-white/10" />

      <p className="text-center text-[15px] text-white/80">
        종강까지{" "}
        <strong className="font-display text-xl font-bold text-[#f4c95d] tabular-nums">
          {daysLeft}일
        </strong>{" "}
        남았어요
      </p>
      <p className="mt-2 text-center text-[13px] leading-relaxed text-white/45">
        {phase === "before"
          ? "아직 개강도 안 했네요. 그래도 종강은 저 멀리 있습니다."
          : `${KST_DATE.format(now)} 기준. 네, 이게 선물이에요.`}
      </p>
    </div>
  );
}

/** 리본 묶인 선물 상자. 뚜껑만 따로 떼어 두어 열 때 날려 보낸다. */
function GiftBox({ opened }: { opened: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`h-56 w-56 sm:h-64 sm:w-64 ${opened ? "" : styles.bob}`}
      role="presentation"
    >
      <defs>
        <linearGradient id="gift-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef6f6c" />
          <stop offset="1" stopColor="#c9433f" />
        </linearGradient>
        <linearGradient id="gift-lid-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5837f" />
          <stop offset="1" stopColor="#d64d49" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="178" rx="62" ry="10" fill="#000" opacity="0.28" />

      {/* 상자 몸통 */}
      <g className={opened ? styles.recoil : undefined}>
        <rect x="38" y="78" width="124" height="96" rx="8" fill="url(#gift-body)" />
        <rect x="90" y="78" width="20" height="96" fill="#f4c95d" />
        {/* 열리면 안쪽 어둠이 보인다 */}
        {opened && <rect x="44" y="78" width="112" height="12" rx="4" fill="#5a1b1a" />}
      </g>

      {/* 뚜껑 + 리본. 열면 통째로 날아간다 */}
      <g className={opened ? styles.lid : undefined}>
        <rect x="28" y="60" width="144" height="26" rx="7" fill="url(#gift-lid-g)" />
        <rect x="90" y="60" width="20" height="26" fill="#f4c95d" />
        <path
          d="M100 60 C100 40 76 30 72 44 C69 55 88 60 100 60 Z"
          fill="#f4c95d"
        />
        <path
          d="M100 60 C100 40 124 30 128 44 C131 55 112 60 100 60 Z"
          fill="#f4c95d"
        />
        <circle cx="100" cy="57" r="7" fill="#ffdf8a" />
      </g>
    </svg>
  );
}

/** 배경의 흐릿한 빛무리. 상자가 조명 아래 놓인 것처럼 보이게 한다. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-[30%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4c95d] opacity-[0.13] blur-[90px]" />
      <div className="absolute bottom-0 left-1/2 h-[300px] w-[520px] -translate-x-1/2 translate-y-1/3 rounded-full bg-[#5bc0be] opacity-[0.10] blur-[100px]" />
    </div>
  );
}
