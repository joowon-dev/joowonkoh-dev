"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

import TrayMark from "../Mark";
import { EASE } from "../motion";
import { BODY, C, CARD } from "../palette";
import StoreButtons from "../StoreButtons";
import Wallpaper, { ForkRight, JOIN_SPOTS, Motif } from "../Wallpaper";

/** 앱의 src/lib/groups/inviteCode.ts와 같은 알파벳·길이. 이상한 값은 화면에도 앱 주소에도 넣지 않는다. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 6;

/**
 * 초대 페이지는 초대장이다 — 흰 바탕에 옅은 수저 무늬, 앱 아이콘 대신 아무것도 담기지 않은 빈 식판 하나,
 * 그리고 "밥 먹었어요?" 한 마디. 빈 칸을 같이 채우자는 부름이다. 주 행동은 앱처럼 노른자.
 * 단계 사이를 포크 화살표로 이어, 카톡 미리보기를 누르고 들어온 사람이
 * "코드 복사 → 설치 → 입력" 순서를 한눈에 따라가게 한다.
 */

/**
 * 주소의 코드를 읽는다. 화면에는 6자리를 그대로("AB2K9M") 보여 주지만,
 * 예전에 하이픈·공백을 넣어 공유된 링크(AB2-K9M)도 계속 열리게 걸러서 받는다.
 */
function readCode(search: string): string | null {
  const raw = new URLSearchParams(search).get("code");
  if (!raw) return null;
  const code = raw.replace(/[\s-]/g, "").toUpperCase();
  if (code.length !== LENGTH || ![...code].every((c) => ALPHABET.includes(c))) return null;
  return code;
}

/**
 * 초대 페이지는 휴대폰 한 화면에 스크롤 없이 다 보여야 한다. 카톡·인스타 안 브라우저는 위아래 막대 때문에
 * 보이는 높이가 550px 남짓까지 줄어든다(아이폰 SE 카톡 기준). 그래서 세로 간격과 식판 크기를
 * 보이는 높이(svh)에 묶어 낮은 화면에서는 줄이고, 큰 화면에서는 원래 느낌대로 넉넉하게 둔다.
 */
const TRAY = "clamp(56px, 12svh, 104px)";
const gap = (min: number, vh: number, max: number) => `clamp(${min}px, ${vh}svh, ${max}px)`;

const RISE = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * 네 칸이 모두 빈 식판. 천천히 떠 있다가 가끔 기우뚱한다.
 * 화면 높이를 따라 크기가 바뀐다(위 TRAY) — 카톡 안 브라우저처럼 낮은 화면에서는 작게, 큰 폰에서도 104px 까지만.
 */
function FloatingTray({ still }: { still: boolean }) {
  return (
    <motion.div
      animate={still ? undefined : { y: [0, -4, 0], rotate: [-1.5, 1.5, -1.5] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      className="[&>svg]:h-[var(--tray)] [&>svg]:w-[var(--tray)]"
      style={{ "--tray": TRAY } as CSSProperties}
    >
      <TrayMark size={104} lunch={false} title="아직 아무것도 담기지 않은 빈 식판" />
    </motion.div>
  );
}

/**
 * 단계 사이를 잇는 포크 화살표. 포크 갈래가 다음 단계(아래)를 가리킨다.
 * 포크는 갈래가 위로 그려져 있으니 180도 돌려 아래를 보게 하고, 거기서 조금 더 기울인다.
 * flip 이면 왼쪽에 놓여 오른쪽 아래를, 아니면 오른쪽에 놓여 왼쪽 아래를 가리킨다.
 */
function ForkArrow({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <Motif
      kind="fork"
      size={34}
      color={C.tomato}
      className={className}
      style={{ transform: `rotate(${flip ? 152 : 208}deg)` }}
    />
  );
}

function CopyIcon({ done }: { done: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {done ? (
        <path d="M5 12.5l4.5 4.5L19 7" />
      ) : (
        <>
          <rect x={8.5} y={8.5} width={11.5} height={11.5} rx={3} />
          <path d="M15.5 5.5V5a2 2 0 0 0-2-2H5.5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h.5" />
        </>
      )}
    </svg>
  );
}

/** 단계 머리말 — 번호 동그라미와 굵은 한 줄. */
function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-2 text-[18px] font-bold leading-[1.2] tracking-[-0.02em] break-keep" style={{ color: C.ink }}>
      <span
        className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
        style={{ background: C.yolk, color: C.ink }}
        aria-hidden
      >
        {n}
      </span>
      {children}
    </p>
  );
}

export default function InviteCode() {
  /** undefined = 아직 주소창을 못 읽음, null = 코드가 없거나 이상함. */
  const [code, setCode] = useState<string | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const still = useReducedMotion() ?? false;

  useEffect(() => {
    // 주소창은 붙은 뒤에만 읽을 수 있다. 초기값으로 넣으면 서버 HTML과 어긋난다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(readCode(window.location.search));
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Wallpaper spots={JOIN_SPOTS}>
      <div className="flex min-h-svh flex-col" style={{ fontFamily: BODY }}>
        <motion.main
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="relative mx-auto flex w-full max-w-[420px] flex-1 flex-col items-center justify-center px-4 text-center"
          style={{ paddingTop: gap(12, 2.4, 40), paddingBottom: gap(8, 2, 24) }}
        >
          <motion.div variants={RISE}>
            <FloatingTray still={still} />
          </motion.div>

          <motion.h1
            variants={RISE}
            className="text-[clamp(26px,4.6svh,32px)] font-black leading-[1.2] tracking-[-0.04em]"
            style={{ marginTop: gap(6, 1.6, 22) }}
          >
            밥 먹었어요?
          </motion.h1>
          <motion.p variants={RISE} className="mt-1 text-[15px] font-semibold leading-[1.45] break-keep" style={{ color: C.body }}>
            오늘 먹은 밥을 식판에 기록해 보세요!
          </motion.p>
          <motion.p
            variants={RISE}
            className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-semibold leading-[1.3] break-keep"
            style={{ background: C.yolkSoft, color: C.ink, marginTop: gap(8, 1.6, 14) }}
          >
            밥상에 초대받았어요 · 같이 채워요
          </motion.p>

          <motion.div
            variants={RISE}
            className="flex w-full flex-col items-center rounded-[24px] bg-white px-4 sm:px-6"
            style={{ ...CARD, marginTop: gap(10, 2.2, 24), paddingTop: gap(14, 2.6, 24), paddingBottom: gap(12, 2.2, 20) }}
          >
            {/* 1. 코드 복사 */}
            <div className="flex w-full flex-col items-center">
              <Step n={1}>초대코드를 복사하고</Step>

              <div className="relative flex w-full justify-center" style={{ marginTop: gap(8, 1.6, 14) }}>
                <motion.button
                  type="button"
                  onClick={copy}
                  disabled={!code}
                  whileTap={code ? { scale: 0.96 } : undefined}
                  className="inline-flex h-[48px] items-center gap-3 rounded-full px-6 disabled:cursor-default"
                  style={{ background: C.yolk, color: C.ink, opacity: code === null ? 0.5 : 1 }}
                  aria-label={code ? `초대코드 ${code} 복사하기` : "초대코드 없음"}
                >
                  <span className="text-[22px] font-bold leading-none tracking-[0.08em] tabular-nums">
                    # {code ?? (code === null ? "------" : "······")}
                  </span>
                  {code ? <CopyIcon done={copied} /> : null}
                </motion.button>
                <ForkArrow className="absolute right-[2%] top-[34px]" />
              </div>

              <div className="mt-0.5 h-[20px]" aria-live="polite">
                <AnimatePresence>
                  {copied ? (
                    <motion.p
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -6, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="text-[14px] font-bold leading-[20px]"
                      style={{ color: C.tomato }}
                    >
                      복사했어요!
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>

              {code === null ? (
                <p className="text-[14px] leading-[1.55] break-keep" style={{ color: C.sub }}>
                  링크에 초대코드가 없거나 잘렸어요.
                  <br />
                  초대한 사람에게 코드를 다시 받아 주세요.
                </p>
              ) : null}
            </div>

            {/* 2. 설치 후 입력 */}
            <div className="flex w-full flex-col items-center" style={{ marginTop: gap(4, 1, 10) }}>
              <Step n={2}>앱 설치 후 입력해주세요</Step>

              <div className="relative w-full" style={{ marginTop: gap(10, 2.4, 22) }}>
                <ForkArrow flip className="absolute -top-[30px] left-[2%]" />
                <StoreButtons compact />
              </div>

              <p
                className="flex flex-wrap items-center justify-center gap-x-1.5 text-[12.5px] leading-[1.5] break-keep"
                style={{ color: C.sub, marginTop: gap(6, 1.2, 12) }}
              >
                <span>
                  앱 아래 <b style={{ color: C.ink, fontWeight: 600 }}>모임</b> 탭
                </span>
                <ForkRight height={8} color={C.tomato} />
                <span>모임 추가</span>
                <ForkRight height={8} color={C.tomato} />
                <span>초대코드로 참여하기</span>
              </p>
            </div>
          </motion.div>

          {code ? (
            <motion.a
              variants={RISE}
              href={`yourmealmymeal://group/join?code=${code}`}
              whileTap={{ scale: 0.97 }}
              className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold"
              style={{ color: C.ink, border: `1px solid ${C.hairline}`, marginTop: gap(8, 1.6, 16) }}
            >
              이미 앱이 있다면 · 앱에서 열기
              <ForkRight height={9} color={C.ink} />
            </motion.a>
          ) : null}
        </motion.main>

        <footer className="relative px-4 text-center text-[11px] leading-[1.6]" style={{ color: C.sub, paddingBottom: gap(10, 2, 24) }}>
          <p>한 모임은 6명까지예요. 자리가 다 찼으면 참여할 수 없어요.</p>
          <p>
            <Link href="/yourmealmymeal" className="hover:underline">네밥내밥 소개</Link>
            {" · "}
            <Link href="/yourmealmymeal/privacy" className="hover:underline">개인정보처리방침</Link>
            {" · "}© 2026 네밥내밥
          </p>
        </footer>
      </div>
    </Wallpaper>
  );
}
