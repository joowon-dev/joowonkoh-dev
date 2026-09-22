"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { EASE } from "./motion";

/**
 * 자주 묻는 질문 — 접어 둔다.
 *
 * 답은 궁금한 사람만 읽으면 되는 글이라, 펼쳐 놓으면 페이지가 설명서가 된다.
 * 질문 여섯 줄만 보이고, 누른 것 하나만 열린다.
 */

const FAQ = [
  {
    q: "위젯 숫자가 매초 올라가지 않아요",
    a: "iOS 가 미리 받아둔 타임라인대로 그려지기 때문입니다. 30분치씩 받아두고 다 쓰면 다음 걸 받습니다. 다시 그려지는 순간 그 시점으로 계산하니, 보이는 금액은 언제나 정확합니다.",
  },
  {
    q: "실수령액으로 볼 수 있나요",
    a: "아직 아닙니다. 4대보험과 소득세는 조건에 따라 달라져서, 검증되지 않은 계산식 대신 미뤘습니다. 지금은 세전 기준입니다.",
  },
  {
    q: "비교 상대의 연봉은 어디서 가져오나요",
    a: "전부 직접 넣은 값입니다. 초기 버전의 대통령·병장 같은 기본 비교군은 모두 없앴습니다.",
  },
  {
    q: "다른 나라 돈으로 보면 환율로 바꿔주나요",
    a: "아닙니다. 표기만 바뀝니다. 미국에서 커피는 그냥 $5 니까요.",
  },
  {
    q: "내 연봉이 어디론가 전송되나요",
    a: "아닙니다. 회원가입이 없고 급여와 설정은 이 아이폰 안에만 있습니다. 다만 광고(AdMob)와 이용 통계(Firebase)가 들어 있어 Google 이 기기 정보를 처리합니다. 맞춤형 광고를 위한 추적은 첫 실행 때 물어보고, 거절해도 다 쓸 수 있습니다.",
  },
  {
    q: "광고를 없앨 수 있나요",
    a: "설정에서 광고를 한 번 보면 12시간 동안 하단 배너가 사라집니다. 결제 항목은 없습니다.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-[22px] bg-[#F2F2F7]">
      {FAQ.map((item, i) => {
        const isOpen = open === item.q;
        return (
          <div
            key={item.q}
            className={i > 0 ? "border-t border-[rgba(0,0,0,0.08)]" : ""}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.q)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[16px] font-semibold leading-[22px] tracking-[-0.408px] text-black">
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="shrink-0 text-[20px] font-light leading-none text-[rgba(60,60,67,0.4)]"
                aria-hidden
              >
                +
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[58ch] px-5 pb-5 text-[15px] leading-[1.7] tracking-[-0.24px] text-[rgba(60,60,67,0.7)]">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
