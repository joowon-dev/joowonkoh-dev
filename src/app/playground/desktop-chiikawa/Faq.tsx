"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** 자주 묻는 것. 접어 두고 누른 하나만 연다 — 펼쳐 놓으면 페이지가 설명서가 된다. */

const FAQ = [
  {
    q: "켜 두면 일하는 데 방해되지 않나요?",
    a: "클릭은 전부 밑의 앱으로 통과해요. 친구들 위를 눌러도 그 아래 버튼이 눌려요. 펼친 메뉴보다는 아래에 그려져서 메뉴를 가리지도 않아요. 그래도 남이 화면을 볼 때는 ⌥⇧K(윈도우는 Alt+Shift+K)로 숨기면 돼요.",
  },
  {
    q: "창이 많으면 친구들도 많아지나요?",
    a: "보이는 창마다 하나씩, 최대 8마리(메뉴에서 1~12)예요. 다른 창에 가려진 창의 친구는 잠시 기다렸다가 보이는 창으로 옮겨 가요. 창이 하나뿐이어도 둘은 나와요.",
  },
  {
    q: "모니터가 두 대예요",
    a: "모든 모니터에 따로 살아요. 메뉴의 「모니터」에서 한 화면만 고를 수도 있어요. 모니터를 꽂거나 빼면 알아서 다시 자리를 잡아요.",
  },
  {
    q: "창을 최대화하면 어디에 서요?",
    a: "맥에서는 메뉴 막대 자리에 서요(클릭은 그대로 통과해요). 윈도우에서는 창 윗변이 화면 맨 위라 작업 표시줄 위로 내려와요. 전체 화면 앱 위에는 서지 않아요.",
  },
  {
    q: "그림을 바꿀 수 있나요?",
    a: "메뉴의 「캐릭터 그림 폴더 열기」에 배경이 투명한 PNG를 넣고 「그림 다시 불러오기」를 누르면 그 그림으로 나와요. 파일 이름이 이름이 돼요(chiikawa.png, hachiware.png …). 모르는 이름도 새 친구로 나와요. 이 페이지 맨 위의 「내 그림으로 보기」로 미리 볼 수도 있어요 — 고른 그림은 브라우저 안에서만 쓰고 어디에도 올리지 않아요.",
  },
  {
    q: "친구 코드를 넣어야 하나요?",
    a: "아니요. 1.1.0부터는 코드 없이도 처음 켤 때부터 이 페이지와 같은 그림으로 친구들이 나와요. 켤 때마다 최신 그림을 받아 오고, 받아 올 때는 인터넷이 필요해요 — 끊겨 있으면 알려 드려요. 한 번 받은 그림은 인터넷이 없어도 그대로 써요. 따로 받은 코드가 있으면 메뉴의 「친구 코드 입력…」에 넣으면 돼요.",
  },
  {
    q: "권한이나 개인정보는요?",
    a: "창이 어디 있는지(위치와 크기)만 봐요. 창 제목이나 화면 내용은 읽지 않아서 맥에서도 화면 기록 권한이 필요 없어요. 인터넷은 하루 한 번 새 버전이 있는지 물어볼 때와, 켤 때 친구들 그림을 받아 올 때만 써요.",
  },
  {
    q: "업데이트는 어떻게 해요?",
    a: "새 버전이 나오면 메뉴 맨 위에 「새 버전 설치」가 생겨요. 눌러야만 갈아 끼우고, 설정과 그림 폴더는 그대로 남아요. 윈도우는 설치본으로 깐 경우에만 돼요.",
  },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Faq() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(75,58,53,0.08)]">
      {FAQ.map((item, i) => {
        const isOpen = open === item.q;
        return (
          <div key={item.q} className={i > 0 ? "border-t border-[#4b3a35]/8" : ""}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.q)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#ff8fab]"
            >
              <span className="text-[16px] font-semibold text-[#4b3a35]">{item.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="shrink-0 text-[22px] leading-none text-[#ff8fab]"
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
                  <p className="max-w-[60ch] px-5 pb-5 text-[15px] leading-[1.75] text-[#4b3a35]/70 break-keep">
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
