"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** 자주 묻는 것. 접어 두고 누른 하나만 연다 — 펼쳐 놓으면 페이지가 설명서가 된다. */

const FAQ = [
  {
    q: "평소 붙여넣기가 망가지지 않나요?",
    a: "쏠 글이 없으면 총은 끼어들지 않아요. 켜고 나서 아직 아무것도 복사하지 않았거나, 그림·파일을 복사했을 때는 원래 붙여넣기가 그대로 나가요. 한 글자씩이 답답한 날은 저격총으로 바꾸면 통째로 한 방에 붙어요. 발사 키를 ⌘V 말고 다른 키로 옮길 수도 있어요.",
  },
  {
    q: "맥에서 왜 손쉬운 사용 권한을 달라고 하나요?",
    a: "다른 앱에 글자를 넣으려면 키를 보내야 하는데, macOS는 그 일을 손쉬운 사용 권한으로 막아 둬요. 권한이 없으면 총이 쏴도 아무것도 찍히지 않아요. 이 권한으로 하는 일은 ⌘V와 단축키를 알아채는 것, 글자를 넣는 것, 글자 커서가 어디 있는지 묻는 것 셋뿐이에요. 윈도우는 권한이 필요 없어요.",
  },
  {
    q: "복사한 내용이 어디로 가나요?",
    a: "어디로도 안 가요. 인터넷은 하루 한 번 새 버전이 있는지 물어볼 때만 써요. 복사한 것이 쌓이는 「현장 탄창」은 메모리에만 있다가 앱을 끄면 사라져요. 이름을 붙여 저장한 탄창만 이 컴퓨터에 남아요.",
  },
  {
    q: "비밀번호를 복사하면요?",
    a: "비밀번호 관리자가 「비밀」이라고 표시해 복사한 것은 줍지 않아요. 그런 것은 평소처럼 붙여넣어져요. 표시 없이 그냥 복사한 비밀번호는 다른 글과 구별할 수 없으니, 현장 탄창에 들어갔다가 앱을 끌 때 사라져요.",
  },
  {
    q: "단축키를 바꾸고 싶어요",
    a: "무기고(⌥⇧A, 윈도우는 Alt+Shift+A)의 「단축키」에서 바꿔요. 바꿀 키를 누르고 새 조합을 누르면 돼요. 발사, 총 바꾸기, 탄창 바꾸기, 무기고, 저격 다섯 가지고, 「기본값으로」로 되돌릴 수 있어요.",
  },
  {
    q: "총이 화면에 나오는 게 부담스러울 때는요?",
    a: "메뉴의 「HUD 숨기기」를 켜면 화면에는 아무것도 안 나오고 붙여넣기만 해요. 클릭은 언제나 밑의 앱으로 통과해요.",
  },
  {
    q: "안 찍히는 곳이 있어요",
    a: "윈도우에서는 관리자 권한으로 띄운 창에 못 쏴요(윈도우가 막아요). 맥에서는 비밀번호 입력 칸처럼 보안 입력이 켜진 곳이 그래요. 한 글자씩 넣는 것을 안 받는 프로그램이면 저격총으로 바꿔 보세요 — 저격총은 평소 붙여넣기와 같은 방식으로 넣어요.",
  },
  {
    q: "업데이트는 어떻게 해요?",
    a: "새 버전이 나오면 메뉴 맨 위에 「새 버전 설치」가 생겨요. 눌러야만 갈아 끼우고, 저장한 탄창과 단축키는 그대로 남아요. 맥은 권한을 다시 묻지 않아요. 윈도우는 설치본으로 깐 경우에만 돼요.",
  },
  {
    q: "지우려면요?",
    a: "메뉴의 「붙여넣기 총 제거…」를 누르면 돼요. 맥은 앱을 휴지통으로 옮기고 저장한 탄창, 로그인 항목, 손쉬운 사용 권한까지 함께 치워요. 윈도우는 「설정 → 앱」에서 지워도 똑같아요.",
  },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Faq() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(26,33,44,0.1)]">
      {FAQ.map((item, i) => {
        const isOpen = open === item.q;
        return (
          <div key={item.q} className={i > 0 ? "border-t border-[#1a212c]/8" : ""}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.q)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#d8a23c]"
            >
              <span className="text-[16px] font-semibold text-[#1a212c]">{item.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="shrink-0 text-[22px] leading-none text-[#8a5f0c]"
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
                  <p className="max-w-[60ch] px-5 pb-5 text-[15px] leading-[1.75] text-[#1a212c]/72 break-keep">
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
