"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EASE } from "../motion";
import { BODY, HAND } from "../palette";

/** 앱의 src/lib/groups/inviteCode.ts와 같은 알파벳·길이. 이상한 값은 화면에도 앱 주소에도 넣지 않는다. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 6;

/**
 * 스토어 주소. ASC 앱 ID(eas.json ascAppId)와 안드로이드 패키지 이름(app.json)으로 만든다.
 * 2026-10-13 기준 두 스토어 모두 공개 전(iOS 판매 중단 · Play 검토 중)이라 공개되기 전에는 열리지 않을 수 있다.
 */
const APP_STORE_URL = "https://apps.apple.com/kr/app/id6812959704";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.joowonkoh.yourmealmymeal";

/**
 * 초대 페이지는 앱의 크림·누룽지 색 대신 밝은 회색 종이에 까만 펜으로 끄적인 느낌이다.
 * 카톡 미리보기를 누르고 들어온 사람이 "코드 복사 → 설치 → 입력" 순서만 보면 되게 한다.
 */
const P = {
  paper: "#F5F5F5",
  ink: "#1A1A1A",
  grey: "#8A8A8A",
  faint: "#B5B5B5",
  lime: "#E8FF52",
  cheek: "#FFB4A8",
  pill: "#D8F6FB",
  pillLine: "#5CD3EE",
} as const;

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

/** 라임색 동그라미 얼굴. 선이 살짝 삐뚤어서 펜으로 그린 것처럼 보인다. */
function Smiley({ still }: { still: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="h-[168px] w-[168px] sm:h-[196px] sm:w-[196px]"
      animate={still ? undefined : { y: [0, -6, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <path
        d="M101 14C152 12 189 52 187 102C185 151 148 189 98 187C48 185 12 149 14 99C16 50 51 16 101 14Z"
        fill={P.lime}
        stroke={P.ink}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      <ellipse cx={52} cy={122} rx={14} ry={8} fill={P.cheek} opacity={0.7} />
      <ellipse cx={150} cy={122} rx={14} ry={8} fill={P.cheek} opacity={0.7} />
      <motion.g
        style={{ originY: "84px" }}
        animate={still ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.94, 0.98, 1] }}
      >
        <path d="M74 70C73 79 74 89 76 97" fill="none" stroke={P.ink} strokeWidth={10} strokeLinecap="round" />
        <path d="M127 69C128 78 127 88 125 96" fill="none" stroke={P.ink} strokeWidth={10} strokeLinecap="round" />
      </motion.g>
      <path
        d="M64 124C78 147 120 152 138 122"
        fill="none"
        stroke={P.ink}
        strokeWidth={8}
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/** 손으로 그은 꼬불 화살표. flip 이면 좌우를 뒤집는다. */
function Arrow({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 80 64"
      className={`h-[52px] w-[64px] ${className}`}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      fill="none"
      stroke={P.ink}
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 6C30 2 50 10 46 24C43 34 26 30 32 20C38 11 58 22 60 54" />
      <path d="M50 46L60 56L67 44" />
    </svg>
  );
}

function CopyIcon({ done }: { done: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke={P.ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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

/** 사과 모양(직접 그린 단순 도형). */
function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[24px] w-[24px]" fill="#fff" aria-hidden>
      <path d="M12 7.2c-1.3-1.1-3.6-1.4-5.2-.2C4.6 8.6 4.4 12.4 5.9 15.6c1 2.2 2.6 4.6 4.3 4.3.7-.1 1.1-.5 1.8-.5s1.1.4 1.8.5c1.7.3 3.3-2.1 4.3-4.3.4-.9.7-1.9.8-2.8-1.6-.6-2.6-2.1-2.6-3.8 0-1.3.6-2.4 1.6-3.1-1.6-1.4-4.1-1.1-5.9.3Z" />
      <path d="M12.4 6.2c.1-1.9 1.4-3.5 3.3-3.9.1 1.9-1.3 3.6-3.3 3.9Z" />
    </svg>
  );
}

/** 재생 삼각형(직접 그린 단순 도형). */
function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" aria-hidden>
      <path d="M4.5 3.2 14 12l-9.5 8.8c-.4-.2-.6-.6-.6-1.1V4.3c0-.5.2-.9.6-1.1Z" fill="#35D0FF" />
      <path d="M14 12 4.5 3.2c.3-.1.7-.1 1.1.1l11 6.1L14 12Z" fill="#3BE17A" />
      <path d="M14 12l2.6 2.6-11 6.1c-.4.2-.8.2-1.1.1L14 12Z" fill="#FF4A5C" />
      <path d="M16.6 9.4 19.8 11.2c.9.5.9 1.2 0 1.7l-3.2 1.7L14 12l2.6-2.6Z" fill="#FFD233" />
    </svg>
  );
}

function StoreButton({ href, glyph, store }: { href: string; glyph: React.ReactNode; store: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-[54px] flex-1 items-center justify-center gap-2.5 rounded-[14px] px-3 transition-transform hover:-translate-y-0.5 active:translate-y-0"
      style={{ background: P.ink, color: "#fff" }}
    >
      {glyph}
      <span className="flex flex-col items-start leading-none">
        <span className="text-[11px] opacity-80">다운로드</span>
        <span className="mt-1 text-[17px] font-semibold tracking-[-0.01em]">{store}</span>
      </span>
    </a>
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
    <div className="flex min-h-dvh flex-col" style={{ background: P.paper, color: P.ink, fontFamily: BODY }}>
      <motion.main
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="mx-auto flex w-full max-w-[400px] flex-1 flex-col items-center px-4 pb-10 pt-12 text-center"
      >
        <motion.div variants={RISE}>
          <Smiley still={still} />
        </motion.div>

        <motion.h1 variants={RISE} className="mt-5 text-[24px] leading-[1.3]" style={{ fontFamily: BODY }}>
          밥상에 초대받았어요
        </motion.h1>
        <motion.p variants={RISE} className="mt-1.5 text-[15px] break-keep" style={{ color: P.grey }}>
          네밥내밥 · 가까운 친구끼리 끼니를 나누는 곳
        </motion.p>

        {/* 1. 코드 복사 */}
        <motion.div variants={RISE} className="mt-9 flex w-full flex-col items-center">
          <div className="relative flex w-full justify-center">
            <p className="-rotate-2 text-[30px] leading-none" style={{ fontFamily: HAND }}>
              초대코드를 복사하고
            </p>
            <Arrow className="absolute -bottom-[46px] right-[6%] rotate-[8deg]" />
          </div>

          <motion.button
            type="button"
            onClick={copy}
            disabled={!code}
            whileTap={code ? { scale: 0.95 } : undefined}
            className="mt-6 inline-flex items-center gap-3 rounded-full px-7 py-3.5 disabled:cursor-default"
            style={{ background: P.pill, border: `2.5px solid ${P.pillLine}`, opacity: code === null ? 0.55 : 1 }}
            aria-label={code ? `초대코드 ${code} 복사하기` : "초대코드 없음"}
          >
            <span className="text-[28px] leading-none tracking-[0.08em]" style={{ color: P.ink }}>
              # {code ?? (code === null ? "------" : "······")}
            </span>
            {code ? <CopyIcon done={copied} /> : null}
          </motion.button>

          <div className="mt-2 h-[26px]" aria-live="polite">
            <AnimatePresence>
              {copied ? (
                <motion.p
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -6, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-[22px] leading-none"
                  style={{ fontFamily: HAND, color: "#1497B8" }}
                >
                  복사했어요!
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          {code === null ? (
            <p className="text-[15px] leading-[1.7] break-keep" style={{ color: P.grey }}>
              링크에 초대코드가 없거나 잘렸어요.
              <br />
              초대한 사람에게 코드를 다시 받아 주세요.
            </p>
          ) : null}
        </motion.div>

        {/* 2. 설치 후 입력 */}
        <motion.div variants={RISE} className="mt-6 flex w-full flex-col items-center">
          <div className="relative flex w-full justify-center">
            <p className="rotate-1 text-[30px] leading-none" style={{ fontFamily: HAND }}>
              앱 설치 후 입력해주세요
            </p>
            <Arrow flip className="absolute -bottom-[46px] left-[6%] rotate-[-8deg]" />
          </div>

          <div className="mt-[52px] flex w-full gap-2.5">
            <StoreButton href={APP_STORE_URL} glyph={<AppleGlyph />} store="App Store" />
            <StoreButton href={PLAY_STORE_URL} glyph={<PlayGlyph />} store="Google Play" />
          </div>

          <p className="mt-3 text-[13px] leading-[1.6] break-keep" style={{ color: P.grey }}>
            앱 아래 <b style={{ color: P.ink, fontWeight: 400 }}>모임</b> 탭 → 모임 추가 → 초대코드로 참여하기
          </p>

          {code ? (
            <motion.a
              href={`yourmealmymeal://group/join?code=${code}`}
              whileTap={{ scale: 0.96 }}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[16px]"
              style={{ border: `2px solid ${P.ink}`, background: "#fff" }}
            >
              이미 앱이 있다면 · 앱에서 열기
              <span aria-hidden>→</span>
            </motion.a>
          ) : null}
        </motion.div>
      </motion.main>

      <footer className="px-4 pb-8 text-center text-[12px] leading-[1.8]" style={{ color: P.faint }}>
        <p>한 모임은 6명까지예요. 자리가 다 찼으면 참여할 수 없어요.</p>
        <p>
          <Link href="/yourmealmymeal" className="hover:underline">네밥내밥 소개</Link>
          {" · "}
          <Link href="/yourmealmymeal/privacy" className="hover:underline">개인정보처리방침</Link>
          {" · "}© 2026 네밥내밥
        </p>
      </footer>
    </div>
  );
}
