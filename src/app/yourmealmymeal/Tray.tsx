"use client";

import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useEffect, type ReactNode } from "react";

import { DROP } from "./motion";
import { BODY, C, SLOT_LABEL, WELL_CARVE, type Slot } from "./palette";

/**
 * 급식판. 앱 아이콘과 규칙이 같다 — 칸에는 테두리가 없고, 칸 사이의 간격이 곧 식판의 몸이다.
 * 민트 판, 둥근 모서리, 크림색 빈 칸. 테두리 대신 아주 옅은 그림자로 떠 있다.
 */
export function TrayFrame({
  children,
  gap = 14,
  className = "",
}: {
  children: ReactNode;
  gap?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: C.tray,
        borderRadius: gap * 2,
        padding: gap,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 1px 2px rgba(46,30,20,0.05), 0 12px 28px rgba(61,184,154,0.18)",
      }}
    >
      {children}
    </div>
  );
}

/** 칸에 놓이는 음식. 사진 대신 그림 글자 하나를 접시에 담는다. */
export type Dish = { emoji: string; tint: string };

export function Well({
  slot,
  dish,
  onClick,
  hint,
  size = "lg",
  wiggle = 0,
}: {
  slot: Slot;
  dish?: Dish | null;
  onClick?: () => void;
  /** 비었을 때 접시 자국 아래 적을 말. 없으면 '올리기'·'추가'. */
  hint?: string;
  size?: "lg" | "sm";
  /** 값이 바뀔 때마다 칸이 한 번 흔들린다(콕). */
  wiggle?: number;
}) {
  const big = size === "lg";
  const extra = slot === "snack";
  const label = `${SLOT_LABEL[slot]}${dish ? "" : " 비어 있음"}`;
  const Tag = onClick ? motion.button : motion.div;
  const [scope, animate] = useAnimate<HTMLElement>();

  useEffect(() => {
    if (wiggle && scope.current) void animate(scope.current, { rotate: [0, -7, 6, -3, 0] }, { duration: 0.45 });
  }, [wiggle, animate, scope]);

  return (
    <Tag
      type={onClick ? "button" : undefined}
      aria-label={label}
      onClick={onClick}
      ref={scope as never}
      whileHover={onClick ? { scale: 1.03 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      className="relative flex aspect-square items-center justify-center overflow-hidden"
      style={{
        borderRadius: big ? 20 : 9,
        background: dish ? C.wellOn : C.wellOff,
        boxShadow: dish ? "none" : WELL_CARVE,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {dish ? (
          <motion.span
            key={dish.emoji}
            initial={{ y: -60, scale: 0.4, rotate: -25, opacity: 0 }}
            animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.15 } }}
            transition={DROP}
            className="flex items-center justify-center rounded-full"
            style={{
              width: big ? "72%" : "78%",
              height: big ? "72%" : "78%",
              background: dish.tint,
              boxShadow: "0 1px 2px rgba(46,30,20,0.08), 0 4px 12px rgba(46,30,20,0.08)",
              fontSize: big ? "clamp(28px, 9vw, 52px)" : "clamp(14px, 4vw, 22px)",
              lineHeight: 1,
            }}
          >
            {dish.emoji}
          </motion.span>
        ) : big ? (
          <motion.span
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <span
              className="flex items-center justify-center rounded-full"
              style={{
                width: "clamp(44px, 14vw, 74px)",
                height: "clamp(44px, 14vw, 74px)",
                border: `2px dashed ${extra ? C.faint : C.placeholder}`,
                color: extra ? C.faint : C.placeholder,
                fontFamily: BODY,
                fontWeight: 300,
                fontSize: extra ? 24 : 30,
              }}
            >
              +
            </span>
          </motion.span>
        ) : (
          <motion.span
            key="empty"
            className="rounded-full"
            style={{ width: "60%", height: "60%", border: `2px dashed ${C.faint}`, opacity: 0.7 }}
          />
        )}
      </AnimatePresence>

      {big ? (
        <span
          className="absolute left-[8px] top-[8px] rounded-full px-[8px] text-[12px] font-semibold leading-[20px]"
          style={{ background: C.surface, border: `1px solid ${C.hairline}`, color: C.body, fontFamily: BODY }}
        >
          {SLOT_LABEL[slot]}
        </span>
      ) : null}

      {big && !dish ? (
        <span
          className="absolute inset-x-0 bottom-[9px] text-center text-[14px]"
          style={{ color: C.sub, fontFamily: BODY }}
        >
          {hint ?? (extra ? "추가" : "올리기")}
        </span>
      ) : null}
    </Tag>
  );
}
