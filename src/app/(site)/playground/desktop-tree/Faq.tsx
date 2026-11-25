"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** 자주 묻는 것. 접어 두고 누른 하나만 연다 — 펼쳐 놓으면 페이지가 설명서가 된다. */

const FAQ = [
  {
    q: "저장 안 한 문서가 있는 창을 실수로 누르면요?",
    a: "강제로 닫지 않아요. 트리는 그 창의 닫기 단추를 대신 눌러 줄 뿐이라, 저장하지 않은 문서가 있으면 그 앱이 평소처럼 저장할지 물어봐요. 취소하면 창도 방울도 그대로 있어요.",
  },
  {
    q: "어느 방울이 어느 창인지 어떻게 알아요?",
    a: "방울에 마우스를 올리면 같은 창의 방울 셋이 같이 켜지고, 어느 앱의 창인지 이름표가 떠요. 방울은 일부러 창마다 묶지 않고 트리 여기저기에 흩어 달았어요.",
  },
  {
    q: "맥에서 왜 손쉬운 사용 권한을 달라고 하나요?",
    a: "다른 앱의 창을 닫고 접고 키우려면 macOS가 손쉬운 사용 권한을 요구해요. 이 권한으로 하는 일은 그 셋뿐이에요. 창의 제목이나 내용은 읽지 않아요. 권한이 없어도 트리와 방울은 보이고, 누르는 것만 안 돼요. 윈도우는 권한이 필요 없어요.",
  },
  {
    q: "초록을 누르면 전체 화면이 되나요?",
    a: "아니요. 메뉴 막대와 Dock을 뺀 자리에 꽉 차게 커져요. 전체 화면이 되면 트리가 안 보여서 그렇게 했어요. 한 번 더 누르면 원래 크기와 자리로 돌아가요. 윈도우에서는 최대화예요.",
  },
  {
    q: "트리 밑에 있는 것을 누르고 싶을 때는요?",
    a: "방울과 트리의 몸통만 마우스를 받고, 그 둘레의 빈 데는 클릭이 밑의 앱으로 통과해요. 트리가 가리면 잡고 끌어서 옮기거나, 메뉴에서 작게 줄이거나 숨기면 돼요.",
  },
  {
    q: "켜 두면 컴퓨터가 느려지지 않나요?",
    a: "가만히 있을 때 움직이는 것은 꼬마전구뿐이고, 그것도 1초에 서너 번만 깜빡여요. 그것마저 메뉴에서 끌 수 있어요. 창의 목록은 1초에 한 번 봐요.",
  },
  {
    q: "창이 아주 많으면요?",
    a: "창 18개까지 달아요(방울 54개). 넘는 창은 자리가 날 때까지 기다렸다가 달려요.",
  },
  {
    q: "업데이트는 어떻게 해요?",
    a: "새 버전이 나오면 메뉴에 「새 버전 설치」가 생겨요. 눌러야만 갈아 끼우고, 설정과 트리 자리는 그대로 남아요. 맥은 권한을 다시 묻지 않아요. 윈도우는 설치본으로 깐 경우에만 돼요.",
  },
  {
    q: "지우려면요?",
    a: "메뉴의 「바탕화면 트리 제거…」를 누르면 돼요. 맥은 앱을 휴지통으로 옮기고 설정, 로그인 항목, 손쉬운 사용 권한까지 함께 치워요. 윈도우는 「설정 → 앱」에서 지워도 똑같아요.",
  },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Faq() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(22,32,58,0.1)]">
      {FAQ.map((item, i) => {
        const isOpen = open === item.q;
        return (
          <div key={item.q} className={i > 0 ? "border-t border-[#16203a]/8" : ""}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.q)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#e2ab3f]"
            >
              <span className="text-[16px] font-semibold text-[#16203a]">{item.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="shrink-0 text-[22px] leading-none text-[#14613a]"
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
                  <p className="max-w-[60ch] px-5 pb-5 text-[15px] leading-[1.75] text-[#16203a]/72 break-keep">
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
