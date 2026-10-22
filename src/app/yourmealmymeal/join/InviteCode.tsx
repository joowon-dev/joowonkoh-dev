"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

const RISE = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** 네 칸이 모두 빈 식판. 천천히 떠 있다가 가끔 기우뚱한다. */
function FloatingTray({ still }: { still: boolean }) {
  return (
    <motion.div
      animate={still ? undefined : { y: [0, -5, 0], rotate: [-1.5, 1.5, -1.5] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <TrayMark size={150} lunch={false} title="아직 아무것도 담기지 않은 빈 식판" />
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
      size={46}
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
    <p className="flex items-center justify-center gap-2 text-[20px] font-bold leading-none tracking-[-0.02em]" style={{ color: C.ink }}>
      <span
        className="flex h-[24px] w-[24px] items-center justify-center rounded-full text-[13px] font-bold"
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
      <div className="flex min-h-dvh flex-col" style={{ fontFamily: BODY }}>
        <motion.main
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="relative mx-auto flex w-full max-w-[420px] flex-1 flex-col items-center px-4 pb-10 pt-12 text-center"
        >
          <motion.div variants={RISE}>
            <FloatingTray still={still} />
          </motion.div>

          <motion.h1 variants={RISE} className="mt-7 text-[34px] font-black leading-[1.2] tracking-[-0.04em]">
            밥 먹었어요?
          </motion.h1>
          <motion.p variants={RISE} className="mt-2 text-[18px] font-semibold leading-[1.5] break-keep" style={{ color: C.body }}>
            오늘 먹은 밥을 식판에 기록해 보세요!
          </motion.p>
          <motion.p
            variants={RISE}
            className="mt-4 inline-flex items-center rounded-full px-4 py-2 text-[14px] font-semibold break-keep"
            style={{ background: C.yolkSoft, color: C.ink }}
          >
            밥상에 초대받았어요 · 같이 채워요
          </motion.p>

          <motion.div
            variants={RISE}
            className="mt-8 flex w-full flex-col items-center rounded-[28px] bg-white px-4 pb-6 pt-7 sm:px-6"
            style={CARD}
          >
            {/* 1. 코드 복사 */}
            <div className="flex w-full flex-col items-center">
              <div className="relative flex w-full justify-center">
                <Step n={1}>초대코드를 복사하고</Step>
                <ForkArrow className="absolute -bottom-[50px] right-[5%]" />
              </div>

              <motion.button
                type="button"
                onClick={copy}
                disabled={!code}
                whileTap={code ? { scale: 0.96 } : undefined}
                className="mt-7 inline-flex h-[54px] items-center gap-3 rounded-full px-7 disabled:cursor-default"
                style={{ background: C.yolk, color: C.ink, opacity: code === null ? 0.5 : 1 }}
                aria-label={code ? `초대코드 ${code} 복사하기` : "초대코드 없음"}
              >
                <span className="text-[24px] font-bold leading-none tracking-[0.08em] tabular-nums">
                  # {code ?? (code === null ? "------" : "······")}
                </span>
                {code ? <CopyIcon done={copied} /> : null}
              </motion.button>

              <div className="mt-2 h-[22px]" aria-live="polite">
                <AnimatePresence>
                  {copied ? (
                    <motion.p
                      initial={{ y: 6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -6, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="text-[15px] font-bold leading-[22px]"
                      style={{ color: C.tomato }}
                    >
                      복사했어요!
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>

              {code === null ? (
                <p className="text-[15px] leading-[1.7] break-keep" style={{ color: C.sub }}>
                  링크에 초대코드가 없거나 잘렸어요.
                  <br />
                  초대한 사람에게 코드를 다시 받아 주세요.
                </p>
              ) : null}
            </div>

            {/* 2. 설치 후 입력 */}
            <div className="mt-6 flex w-full flex-col items-center">
              <div className="relative flex w-full justify-center">
                <Step n={2}>앱 설치 후 입력해주세요</Step>
                <ForkArrow flip className="absolute -bottom-[50px] left-[5%]" />
              </div>

              <StoreButtons className="mt-[54px]" />

              <p className="mt-3 flex flex-wrap items-center justify-center gap-x-1.5 text-[13px] leading-[1.6] break-keep" style={{ color: C.sub }}>
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
              className="mt-5 inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold"
              style={{ color: C.ink, border: `1px solid ${C.hairline}` }}
            >
              이미 앱이 있다면 · 앱에서 열기
              <ForkRight height={9} color={C.ink} />
            </motion.a>
          ) : null}
        </motion.main>

        <footer className="relative px-4 pb-8 text-center text-[12px] leading-[1.8]" style={{ color: C.sub }}>
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
