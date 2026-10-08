"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { DROP, EASE } from "./motion";
import { BODY, C, DISPLAY, SLOT_LABEL, SLOTS, STICKER, type Slot } from "./palette";
import { TrayFrame, Well, type Dish } from "./Tray";

type Member = {
  name: string;
  face: string;
  faceTint: string;
  plate: Partial<Record<Slot, Dish>>;
  /** 콕을 받으면 잠시 뒤 채워 넣을 끼니. */
  answer: Partial<Record<Slot, Dish>>;
};

const START: Member[] = [
  {
    name: "엄마",
    face: "👩🏻",
    faceTint: "#FFE3DB",
    plate: { breakfast: { emoji: "🥣", tint: "#FFF6E0" }, lunch: { emoji: "🍲", tint: "#FFE3DB" } },
    answer: { dinner: { emoji: "🐟", tint: "#E6F1FF" } },
  },
  {
    name: "동생",
    face: "🧑🏻",
    faceTint: "#E6F6EE",
    plate: { lunch: { emoji: "🍔", tint: "#FFE9B8" } },
    answer: {
      breakfast: { emoji: "🥐", tint: "#FFF1C2" },
      dinner: { emoji: "🍕", tint: "#FFE0CC" },
    },
  },
  {
    name: "나",
    face: "🙋🏻",
    faceTint: "#FFF1C2",
    plate: {
      breakfast: { emoji: "🍳", tint: "#FFF1C2" },
      lunch: { emoji: "🍛", tint: "#FFE9B8" },
      dinner: { emoji: "🍚", tint: "#FFFDF7" },
    },
    answer: {},
  },
];

const REACTIONS = ["😋", "👍", "🥹", "🔥"] as const;

/**
 * 모임 밥상 — 같은 모임 사람들의 식판이 한 상에 놓인다.
 * 남의 빈 칸을 누르면 '콕'이 가고, 조금 뒤 그 사람이 사진을 올린다(이 페이지에서는 흉내).
 */
export default function Table() {
  const [members, setMembers] = useState(START);
  const [toast, setToast] = useState<string | null>(null);
  const [wiggles, setWiggles] = useState<Record<string, number>>({});
  const [picked, setPicked] = useState<(typeof REACTIONS)[number] | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function later(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms));
  }

  function nudge(mi: number, slot: Slot) {
    const m = members[mi];
    const key = `${mi}-${slot}`;
    setWiggles((w) => ({ ...w, [key]: (w[key] ?? 0) + 1 }));
    setToast(`${m.name}에게 ${SLOT_LABEL[slot]} 콕! 👉`);
    later(() => setToast(null), 1800);
    const dish = m.answer[slot];
    if (!dish) return;
    later(() => {
      setMembers((list) =>
        list.map((x, i) => (i === mi ? { ...x, plate: { ...x.plate, [slot]: dish } } : x)),
      );
    }, 1300);
  }

  return (
    <div className="relative rounded-[22px] p-4 sm:p-5" style={{ ...STICKER, background: C.cloth }}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[20px]" style={{ fontFamily: DISPLAY }}>
          🏠 우리 가족
        </span>
        <span className="text-[14px]" style={{ fontFamily: BODY, color: C.sub }}>
          오늘 · 3명
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {members.map((m, mi) => {
          const mine = m.name === "나";
          return (
            <div key={m.name} className="flex flex-col items-center gap-2">
              <TrayFrame gap={7} className="w-full">
                <div className="grid grid-cols-2 gap-[7px]">
                  {SLOTS.map((slot) => {
                    const dish = m.plate[slot];
                    return (
                      <Well
                        key={slot}
                        slot={slot}
                        size="sm"
                        dish={dish}
                        wiggle={wiggles[`${mi}-${slot}`] ?? 0}
                        // 간식은 덤이라 콕하지 않는다. 앱도 그렇다.
                        onClick={!mine && !dish && slot !== "snack" ? () => nudge(mi, slot) : undefined}
                      />
                    );
                  })}
                </div>
              </TrayFrame>
              <div className="flex items-center gap-1.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[15px]"
                  style={{ background: m.faceTint, border: `2px solid ${C.ink}` }}
                >
                  {m.face}
                </span>
                <span className="text-[15px]" style={{ fontFamily: BODY }}>
                  {m.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {REACTIONS.map((r) => {
          const on = picked === r;
          return (
            <motion.button
              key={r}
              type="button"
              aria-label={`반응 ${r}`}
              aria-pressed={on}
              onClick={() => setPicked(on ? null : r)}
              whileTap={{ scale: 0.85 }}
              animate={on ? { scale: [1, 1.25, 1], rotate: [0, -10, 0] } : { scale: 1 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-[17px]"
              style={{
                background: on ? C.yolk : C.surface,
                border: `2px solid ${C.ink}`,
                boxShadow: `0 1px 0 ${C.ink}`,
                fontFamily: BODY,
              }}
            >
              {r}
              <span className="text-[13px]">{(r === "😋" ? 2 : r === "👍" ? 1 : 0) + (on ? 1 : 0) || ""}</span>
            </motion.button>
          );
        })}
        <span className="ml-auto text-[13px]" style={{ fontFamily: BODY, color: C.sub }}>
          빈 칸을 누르면 콕!
        </span>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 14, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -10, x: "-50%", transition: { duration: 0.2, ease: EASE } }}
            transition={DROP}
            role="status"
            className="pointer-events-none absolute left-1/2 -top-5 whitespace-nowrap rounded-full px-4 py-1.5 text-[15px] text-white"
            style={{ background: C.tomato, border: `2px solid ${C.ink}`, fontFamily: BODY }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
