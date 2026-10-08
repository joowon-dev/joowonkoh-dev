"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DROP, EASE } from "../motion";
import { BODY, C, DISPLAY, STICKER, WELL_CARVE, YOLK_SHADOW } from "../palette";
import { TrayFrame } from "../Tray";

/** 앱의 src/lib/groups/inviteCode.ts와 같은 알파벳·길이. 이상한 값은 화면에도 앱 주소에도 넣지 않는다. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 6;

function readCode(search: string): string | null {
  const raw = new URLSearchParams(search).get("code");
  if (!raw) return null;
  const code = raw.replace(/[\s-]/g, "").toUpperCase();
  if (code.length !== LENGTH || ![...code].every((c) => ALPHABET.includes(c))) return null;
  return code;
}

const RISE = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

/** 나를 기다리는 밥상. 이미 앉은 사람들 사이에 빈자리 하나가 숨 쉰다. */
const SEATS = [
  { face: "👩🏻", tint: "#FFE3DB" },
  { face: "🧑🏻", tint: "#E6F6EE" },
  null,
  { face: "👨🏻", tint: "#FFF1C2" },
];

export default function InviteCode() {
  /** undefined = 아직 주소창을 못 읽음, null = 코드가 없거나 이상함. */
  const [code, setCode] = useState<string | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

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
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.09 } } }}>
      <motion.span
        variants={RISE}
        className="mb-5 inline-block rounded-full px-3 py-[3px] text-[13px]"
        style={{ background: C.surface, border: `2px solid ${C.ink}`, fontFamily: BODY }}
      >
        네밥내밥 · 초대
      </motion.span>

      <motion.h1
        variants={RISE}
        className="text-[38px] leading-[1.15] md:text-[48px]"
        style={{ fontFamily: DISPLAY, textShadow: YOLK_SHADOW }}
      >
        밥상에
        <br />
        초대받았어요
      </motion.h1>
      <motion.p
        variants={RISE}
        className="mt-3 max-w-[34ch] text-[16px] leading-[1.75] break-keep"
        style={{ fontFamily: BODY, color: C.body }}
      >
        아침·점심·저녁을 식판 한 칸씩 사진으로 채우고, 2~6명이 서로 챙기는 앱이에요.
      </motion.p>

      {/* 자리 하나가 비어 있는 밥상 */}
      <motion.div variants={RISE} className="mt-8 flex items-end justify-center gap-3" aria-hidden>
        {SEATS.map((s, i) =>
          s ? (
            <motion.span
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
              className="flex h-12 w-12 items-center justify-center rounded-full text-[24px]"
              style={{ background: s.tint, border: `2.5px solid ${C.ink}` }}
            >
              {s.face}
            </motion.span>
          ) : (
            <motion.span
              key={i}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-14 w-14 items-center justify-center rounded-full text-[13px]"
              style={{ border: `2.5px dashed ${C.tomato}`, color: C.tomato, background: C.surface, fontFamily: DISPLAY }}
            >
              내 자리
            </motion.span>
          ),
        )}
      </motion.div>

      <motion.section variants={RISE} className="mt-6">
        <TrayFrame>
          <p className="mb-3 text-center text-[15px]" style={{ fontFamily: BODY, color: C.ink }}>
            초대코드
          </p>
          <div className="grid grid-cols-6 gap-[6px] sm:gap-[10px]">
            {Array.from({ length: LENGTH }, (_, i) => {
              const ch = code ? code[i] : null;
              return (
                <div
                  key={i}
                  className="flex aspect-[4/5] items-center justify-center rounded-[10px]"
                  style={{
                    background: ch ? C.wellOn : C.wellOff,
                    boxShadow: ch ? "none" : WELL_CARVE,
                  }}
                >
                  <AnimatePresence>
                    {ch ? (
                      <motion.span
                        initial={{ y: -40, opacity: 0, rotate: -20, scale: 0.5 }}
                        animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                        transition={{ ...DROP, delay: 0.5 + i * 0.08 }}
                        className="text-[clamp(24px,8vw,40px)] leading-none"
                        style={{ fontFamily: DISPLAY }}
                      >
                        {ch}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {code ? (
            <div className="mt-5 flex flex-col items-center gap-3">
              <motion.a
                href={`yourmealmymeal://group/join?code=${code}`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 2, boxShadow: `0 0 0 ${C.ink}` }}
                transition={{ type: "spring", stiffness: 500, damping: 26 }}
                className="w-full max-w-xs rounded-full py-3 text-center text-[19px]"
                style={{ background: C.yolk, border: `3px solid ${C.ink}`, boxShadow: `0 2px 0 ${C.ink}`, fontFamily: DISPLAY }}
              >
                앱에서 열기
              </motion.a>
              <motion.button
                type="button"
                onClick={copy}
                whileTap={{ scale: 0.94 }}
                className="relative rounded-full px-4 py-1.5 text-[15px]"
                style={{ background: copied ? C.surface : "transparent", border: `2px solid ${copied ? C.ink : "transparent"}`, fontFamily: BODY }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? "y" : "n"}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="inline-block"
                    style={{ color: C.ink }}
                  >
                    {copied ? "복사했어요 ✓" : "코드만 복사하기"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          ) : code === null ? (
            <p className="mt-4 text-center text-[15px] leading-[1.7] break-keep" style={{ fontFamily: BODY, color: C.ink }}>
              링크에 초대코드가 없거나 잘렸어요.
              <br />
              초대한 사람에게 코드를 다시 받아 주세요.
            </p>
          ) : null}
        </TrayFrame>
      </motion.section>

      <motion.section variants={RISE} className="mt-10 rounded-[20px] p-5" style={{ ...STICKER, background: C.cloth }}>
        <h2 className="text-[20px]" style={{ fontFamily: DISPLAY }}>
          앱에서 안 열리면
        </h2>
        <ol className="mt-3 space-y-2.5 text-[15px] leading-[1.6] break-keep" style={{ fontFamily: BODY, color: C.body }}>
          {[
            <>네밥내밥을 열고 아래 <b style={{ color: C.ink }}>모임</b> 탭으로 가요.</>,
            <><b style={{ color: C.ink }}>모임 추가 → 초대코드로 참여하기</b>에 위 코드를 넣어요.</>,
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px]"
                style={{ background: C.yolk, border: `2px solid ${C.ink}`, color: C.ink, fontFamily: DISPLAY }}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[14px]" style={{ fontFamily: BODY, color: C.sub }}>
          한 모임은 6명까지예요. 자리가 다 찼으면 참여할 수 없어요.
        </p>
      </motion.section>

      <motion.p variants={RISE} className="mt-6 text-[15px]" style={{ fontFamily: BODY, color: C.body }}>
        앱이 아직 없다면{" "}
        <Link href="/yourmealmymeal" className="underline underline-offset-4" style={{ color: C.tomato }}>
          네밥내밥 소개
        </Link>
        에서 확인해 주세요.
      </motion.p>
    </motion.div>
  );
}
