"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { EASE } from "./motion";
import { BODY, C, DISPLAY, STICKER } from "./palette";

const QA = [
  {
    q: "내 사진을 누가 볼 수 있나요",
    a: "나와 같은 모임에 있는 사람만 볼 수 있어요. 이 제한은 앱 화면이 아니라 데이터베이스 자체에 걸려 있어서, 앱을 뜯어고쳐도 남의 끼니를 가져올 수 없어요. 사진 보관함은 비공개이고 링크는 잠깐만 유효해요.",
  },
  {
    q: "가족 모임과 친구 모임에 같이 들어갈 수 있나요",
    a: "돼요. 식판은 한 사람에 하나라서, 아침을 한 번 올리면 내가 속한 모든 모임에서 같이 보여요. 모임마다 따로 올릴 필요가 없어요.",
  },
  {
    q: "콕은 몇 번이나 보낼 수 있나요",
    a: "알림 폭탄이 되지 않도록 서버가 하루 횟수를 세요. 다 쓰면 짧은 광고를 보고 몇 번 더 받을 수 있고, 그것도 하루 상한이 있어요. 간식 칸은 덤이라 콕하지 않아요.",
  },
  {
    q: "광고가 있나요",
    a: "화면 아래 작은 배너 광고가 있고, 콕을 더 받고 싶을 때만 보는 보상형 광고가 있어요. 앱을 고치기 위한 이용 통계도 모아요. 자세한 내용은 개인정보처리방침에 적어 두었어요.",
  },
  {
    q: "계정을 지우면 어떻게 되나요",
    a: "앱 안에서 바로 지울 수 있어요. 올린 사진과 기록이 모두 사라지고 되돌릴 수 없어요. 내가 만든 모임은 남은 사람 중 가장 오래 있던 사람에게 넘어가고, 아무도 없으면 모임도 함께 사라져요.",
  },
];

/** 누르면 열리는 질문 카드. 하나를 열면 나머지는 닫힌다. */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {QA.map((item, i) => {
        const on = open === i;
        return (
          <motion.div
            key={item.q}
            layout
            className="overflow-hidden rounded-[18px]"
            style={{ ...STICKER, background: on ? C.surface : C.cloth }}
          >
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[17px] leading-[1.35] break-keep" style={{ fontFamily: DISPLAY }}>
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: on ? 45 : 0, background: on ? C.yolk : C.surface }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[20px]"
                style={{ border: `2px solid ${C.ink}`, fontFamily: DISPLAY }}
                aria-hidden
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {on ? (
                <motion.div
                  key="a"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <p
                    className="px-5 pb-5 text-[15px] leading-[1.8] break-keep"
                    style={{ fontFamily: BODY, color: C.body }}
                  >
                    {item.a}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
