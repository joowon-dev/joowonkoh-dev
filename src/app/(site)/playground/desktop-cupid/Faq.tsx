"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/** 자주 묻는 것. 접어 두고 누른 하나만 연다 — 펼쳐 놓으면 페이지가 설명서가 된다. */

const FAQ = [
  {
    q: "쪽지는 어디에 저장되나요? 누가 볼 수 있나요?",
    a: "쪽지는 받는 사람에게 전하려고 서버(Supabase)에 글 그대로 저장돼요. 보낸 사람과 받은 사람만 앱에서 볼 수 있고, 다른 사용자는 볼 수 없어요. 다만 끝에서 끝 암호화는 아니라서 서버를 운영하는 저는 볼 수 있어요. 비밀번호나 민감한 내용은 보내지 마세요.",
  },
  {
    q: "회원가입이 없으면 내 계정은 어떻게 지켜요?",
    a: "처음 켤 때 받는 복구 코드(XXXX-XXXX-XXXX-XXXX)가 곧 열쇠예요. 맥은 키체인, 윈도우는 자격 증명 관리자에 안전하게 넣어 둬요. 다시 깔거나 다른 컴퓨터에서 쓸 때 이 코드를 넣으면 친구와 쪽지가 그대로 돌아와요. 코드가 샌 것 같으면 메뉴의 「복구 코드」에서 새로 받으세요. 옛 코드는 그 순간부터 못 써요.",
  },
  {
    q: "모르는 사람이 화살을 쏠 수 있나요?",
    a: "아니요. 내 친구 코드(CUPID-로 시작해요)를 아는 사람만 친구가 될 수 있고, 친구만 쏠 수 있어요. 코드를 너무 많이 뿌렸다 싶으면 「친구 · 내 코드」에서 새 코드를 받으세요. 이미 맺은 친구는 그대로고, 옛 코드로는 더 못 맺어요. 원하지 않는 친구는 목록에서 끊으면 돼요.",
  },
  {
    q: "세기는 어디에 꽂히는지를 정해요?",
    a: "네. 오른쪽으로 쏘면 친구 화면 왼쪽 가장자리에서, 왼쪽으로 쏘면 오른쪽에서 날아 들어와요. 살살 쏘면 가장자리 근처에, 세게 쏘면 화면 반대쪽까지 깊이 꽂혀요. 거의 곧장 위로 쏘면 위에서 떨어지고요. 메뉴 막대와 Dock 위에는 안 꽂혀요.",
  },
  {
    q: "친구 컴퓨터가 꺼져 있으면요?",
    a: "쪽지는 서버에서 기다리다가, 친구가 앱을 켜는 순간 차례로 날아 들어와요. 화면에는 20개까지 꽂히고, 넘는 것은 오른쪽 아래 화살통에 「+N」으로 쌓여요. 화살통을 누르면 먼저 온 것부터 열려요.",
  },
  {
    q: "화살이 일하는 데 방해되지 않나요?",
    a: "꽂힌 화살(편지 부분)과 활, 쪽지 카드만 마우스를 받고, 나머지는 클릭이 전부 밑의 앱으로 통과해요. 쓰던 앱의 포커스를 뺏지도 않아요. 잠깐 치우고 싶으면 메뉴의 「화살 숨기기」를 켜세요. 가만히 있을 때는 아무것도 그리지 않아서 컴퓨터를 거의 안 써요.",
  },
  {
    q: "얼마나 보낼 수 있어요?",
    a: "쪽지는 200자까지, 한 사람이 한 시간에 60발까지예요. 무료예요.",
  },
  {
    q: "택시나 버스로 보낼 수 있다던데요?",
    a: "아직이에요. 화살 말고 다른 것에 실어 보내는 기능을 준비하고 있어요. 나오면 메뉴의 「새 버전 설치」로 받을 수 있어요.",
  },
  {
    q: "지우려면요?",
    a: "메뉴의 「바탕화면 큐피트 제거…」는 이 컴퓨터에서 앱과 설정, 저장해 둔 복구 코드를 지워요. 서버의 계정과 친구는 남아서 다시 깔고 복구 코드로 돌아올 수 있어요. 서버에서 내 이름·친구·주고받은 쪽지를 모두 지우려면 메뉴의 「계정 지우기」를 누르세요. 되돌릴 수 없어요.",
  },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Faq() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(59,36,48,0.1)]">
      {FAQ.map((item, i) => {
        const isOpen = open === item.q;
        return (
          <div key={item.q} className={i > 0 ? "border-t border-[#3b2430]/8" : ""}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.q)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#ff9bb8]"
            >
              <span className="text-[16px] font-semibold text-[#3b2430]">{item.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="shrink-0 text-[22px] leading-none text-[#e0174f]"
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
                  <p className="max-w-[60ch] px-5 pb-5 text-[15px] leading-[1.75] text-[#3b2430]/72 break-keep">
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
