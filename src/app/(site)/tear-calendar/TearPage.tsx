"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { EASE } from "./motion";
import { C, HAND } from "./palette";

/**
 * 첫 화면의 일력 한 장.
 *
 * 앱에서 하는 일을 그대로 흉내 낸다 — 집게에 물린 종이를 아래로 당기면(또는
 * 누르면) 한 장이 뜯겨 나가고, 그 밑에 상대가 꾸며 둔 오늘 페이지가 보인다.
 * 집게는 앱처럼 다이내믹 아일랜드 모양이다. 다시 붙이기로 처음으로 돌아간다.
 */

const TEAR_DISTANCE = 70;

function DateHead({ faded = false }: { faded?: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ fontFamily: HAND }}>
      <span className="text-[18px] leading-none" style={{ color: C.cocoa }}>
        9월
      </span>
      <span
        className="mt-1 text-[96px] font-bold leading-[0.95]"
        style={{ color: faded ? C.blush : C.cherry }}
      >
        27
      </span>
      <span
        className="mt-2 text-[17px] leading-none tracking-[0.3em]"
        style={{ color: C.cocoa }}
      >
        일요일
      </span>
    </div>
  );
}

/** 뜯는 선 — 종이 윗단의 작은 구멍 줄. */
function Perforation() {
  return (
    <div className="flex justify-between px-3 pt-2" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="h-[5px] w-[5px] rounded-full"
          style={{ background: C.kraft }}
        />
      ))}
    </div>
  );
}

const SHEET =
  "absolute inset-x-0 top-0 h-full overflow-hidden rounded-b-[22px] rounded-t-[6px]";

export default function TearPage() {
  const [torn, setTorn] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-[260px] select-none sm:w-[280px]">
      {/* 집게 — 다이내믹 아일랜드를 문 분홍 클립 */}
      <div
        className="relative z-30 mx-auto flex h-[46px] w-[132px] items-center justify-center rounded-b-[26px]"
        style={{
          background: C.clip,
          boxShadow: `inset 0 -4px 0 ${C.cherryDeep}`,
        }}
        aria-hidden
      >
        <span className="h-[24px] w-[96px] rounded-full bg-black" />
      </div>

      <div className="relative -mt-[18px] h-[360px] sm:h-[380px]">
        {/* 밑장 — 상대가 꾸며 둔 오늘 */}
        <div
          className={SHEET}
          style={{
            background: C.paper,
            boxShadow: "0 18px 40px -18px rgba(156,122,114,0.45)",
            border: `1px solid ${C.blushLight}`,
          }}
        >
          <Perforation />
          <div className="absolute right-4 top-6 text-[14px]" style={{ fontFamily: HAND, color: C.cherry }}>
            ♡ 211일째
          </div>
          <div className="mt-8">
            <DateHead />
          </div>
          <p
            className="mt-9 -rotate-3 pl-8 text-[21px] font-bold leading-snug"
            style={{ fontFamily: HAND, color: C.cherry }}
          >
            오늘 저녁 떡볶이 먹자 ♡
          </p>
          <span
            className="absolute bottom-10 right-9 rotate-12 text-[34px]"
            style={{ color: C.gold }}
            aria-hidden
          >
            ★
          </span>
          <span
            className="absolute bottom-12 left-10 -rotate-6 rounded-md px-3 py-1 text-[13px]"
            style={{
              fontFamily: HAND,
              background: C.mint,
              color: C.cocoaDeep,
            }}
          >
            사진 한 장
          </span>
        </div>

        {/* 윗장 — 아직 안 뜯은 표지 */}
        <AnimatePresence>
          {!torn && (
            <motion.button
              type="button"
              key="cover"
              aria-label="한 장 뜯기"
              className={`${SHEET} z-20 cursor-grab text-left active:cursor-grabbing`}
              style={{
                background: C.paperOld,
                border: `1px solid ${C.kraft}`,
                transformOrigin: "12% 0%",
              }}
              drag={reduce ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > TEAR_DISTANCE) setTorn(true);
              }}
              onTap={() => setTorn(true)}
              whileHover={reduce ? undefined : { rotate: -1.2 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              exit={
                reduce
                  ? { opacity: 0, transition: { duration: 0.2 } }
                  : {
                      y: 520,
                      rotate: 18,
                      opacity: 0,
                      transition: { duration: 0.8, ease: EASE },
                    }
              }
            >
              <Perforation />
              <div className="mt-14">
                <DateHead faded />
              </div>
              <p
                className="absolute inset-x-0 bottom-8 text-center text-[15px]"
                style={{ fontFamily: HAND, color: C.cocoa }}
              >
                쭉— 당겨서 오늘 보기
              </p>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 h-8 text-center">
        <AnimatePresence>
          {torn && (
            <motion.button
              type="button"
              key="reset"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
              onClick={() => setTorn(false)}
              className="rounded-full px-4 py-1 text-[15px]"
              style={{
                fontFamily: HAND,
                color: C.cocoaDeep,
                border: `1.5px dashed ${C.stitch}`,
              }}
            >
              다시 붙이기
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
