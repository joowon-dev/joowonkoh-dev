"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import { DROP, EASE } from "./motion";
import { BODY, C, DISPLAY, SLOTS, YOLK_SHADOW, type Slot } from "./palette";
import { TrayFrame, Well, type Dish } from "./Tray";
import { Motif } from "./Wallpaper";

/** 칸마다 돌아가며 놓이는 음식. 누를 때마다 다음 것이 떨어진다. */
const MENU: Record<Slot, Dish[]> = {
  breakfast: [
    { emoji: "🍳", tint: "#FFF1C2" },
    { emoji: "🥪", tint: "#FFE7CC" },
    { emoji: "🥣", tint: "#FFF6E0" },
  ],
  lunch: [
    { emoji: "🍜", tint: "#FFE0CC" },
    { emoji: "🍛", tint: "#FFE9B8" },
    { emoji: "🍱", tint: "#FFE3DB" },
  ],
  dinner: [
    { emoji: "🍚", tint: "#FFFDF7" },
    { emoji: "🥘", tint: "#FFD9C9" },
    { emoji: "🍲", tint: "#FFE3DB" },
  ],
  snack: [
    { emoji: "🍙", tint: "#E6F6EE" },
    { emoji: "🍩", tint: "#FFE3EC" },
    { emoji: "🍎", tint: "#FFE0DA" },
  ],
};

const RISE = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

/** 다 채우면 칸 위로 튀어 오르는 반짝이. */
const BURST = [
  { x: -120, y: -70, r: -40, c: C.yolk },
  { x: 110, y: -80, r: 30, c: C.tomato },
  { x: -60, y: -120, r: 10, c: C.tray },
  { x: 70, y: -125, r: -20, c: C.yolk },
  { x: -140, y: 10, r: 60, c: C.tomato },
  { x: 140, y: 0, r: -50, c: C.tray },
];

export default function Hero({ icon }: { icon: ReactNode }) {
  const [plate, setPlate] = useState<Record<Slot, number | null>>({
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  });
  const [turns, setTurns] = useState<Record<Slot, number>>({ breakfast: 0, lunch: 0, dinner: 0, snack: 0 });

  // 들어오자마자 아침 한 칸이 놓인다 — 무엇을 하는 물건인지 설명보다 먼저 보인다.
  useEffect(() => {
    const t = setTimeout(() => setPlate((p) => ({ ...p, breakfast: 0 })), 900);
    return () => clearTimeout(t);
  }, []);

  function tap(slot: Slot) {
    if (plate[slot] !== null) {
      setPlate({ ...plate, [slot]: null });
      return;
    }
    const next = (turns[slot] + 1) % MENU[slot].length;
    setTurns({ ...turns, [slot]: next });
    setPlate({ ...plate, [slot]: next });
  }

  // 끼니는 셋이다. 간식은 덤이라 세지 않는다.
  const eaten = (["breakfast", "lunch", "dinner"] as const).filter((s) => plate[s] !== null).length;
  const done = eaten === 3;

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.09 } } }}>
      <motion.span
        variants={RISE}
        className="mb-5 inline-block rounded-full px-3 py-[3px] text-[13px]"
        style={{ background: C.surface, border: `2px solid ${C.ink}`, fontFamily: BODY }}
      >
        iOS · Android · 출시 준비 중
      </motion.span>

      <motion.div variants={RISE} className="flex items-center gap-5">
        <motion.div
          whileHover={{ rotate: -6, scale: 1.06 }}
          whileTap={{ rotate: 8, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 320, damping: 14 }}
        >
          {icon}
        </motion.div>
        <div>
          <h1
            className="text-[44px] leading-[1.05] md:text-[56px]"
            style={{ fontFamily: DISPLAY, textShadow: YOLK_SHADOW }}
          >
            네밥내밥
          </h1>
          <p className="mt-2 text-[18px]" style={{ fontFamily: BODY, color: C.body }}>
            밥 먹었냐고 묻는 대신
          </p>
        </div>
      </motion.div>

      <motion.p
        variants={RISE}
        className="mt-6 max-w-[34ch] text-[17px] leading-[1.75] break-keep"
        style={{ fontFamily: BODY, color: C.body }}
      >
        오늘 먹은 끼니를 식판 한 칸씩 사진으로 채우고, 가족이나 친구와 서로 챙겨요.
        묻지 않아도 빈 칸이 먼저 말해 줘요.
      </motion.p>

      <motion.div variants={RISE} className="relative mx-auto mt-10 max-w-[420px]">
        <div className="mb-3 flex items-end justify-between">
          <span className="text-[20px]" style={{ fontFamily: DISPLAY }}>
            오늘 내 식판
          </span>
          <motion.span
            key={eaten}
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: done ? -3 : 0 }}
            transition={DROP}
            className="rounded-full px-3 py-[2px] text-[14px]"
            style={{
              fontFamily: BODY,
              background: done ? C.yolk : C.surface,
              border: `2px solid ${C.ink}`,
            }}
          >
            {done ? "세 끼 다 먹었어요!" : `세 끼 중 ${eaten}끼`}
          </motion.span>
        </div>

        <TrayFrame>
          <div className="grid grid-cols-2 gap-[14px]">
            {SLOTS.map((slot) => {
              const i = plate[slot];
              return <Well key={slot} slot={slot} dish={i === null ? null : MENU[slot][i]} onClick={() => tap(slot)} />;
            })}
          </div>
        </TrayFrame>

        <AnimatePresence>
          {done ? (
            <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
              {BURST.map((b, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                  animate={{ x: b.x, y: b.y, scale: 1, rotate: b.r, opacity: [1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: EASE, delay: i * 0.03 }}
                >
                  <Motif kind="star" size={26} color={b.c} />
                </motion.div>
              ))}
            </div>
          ) : null}
        </AnimatePresence>

        <p className="mt-3 text-center text-[14px]" style={{ fontFamily: BODY, color: C.sub }}>
          칸을 눌러 보세요. 한 번 더 누르면 비워져요.
        </p>
      </motion.div>
    </motion.div>
  );
}
