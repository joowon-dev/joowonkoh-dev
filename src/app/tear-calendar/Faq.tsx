"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { EASE } from "./motion";
import { C, HAND } from "./palette";

/**
 * 자주 묻는 질문 — 접어 둔다. 누른 것 하나만 열린다.
 */

const FAQ = [
  {
    q: "혼자서도 쓸 수 있나요?",
    a: "네. 상대와 잇기 전에도 꾸미기, 뜯기, 지난 날 보기까지 전부 이 기기 안에서 돌아갑니다. 둘이 쓰고 싶어지면 Apple 또는 Google 로 로그인하고, 한쪽이 만든 초대 코드를 다른 쪽이 한 번 넣으면 이어집니다. 다만 로그인 전에 혼자 꾸민 페이지는 서버로 옮겨지지 않습니다.",
  },
  {
    q: "뜯으면 상대에게 알림이 가나요?",
    a: "오늘 페이지를 뜯으면 상대에게 다정한 알림이 한 번 갑니다. 알림이 재촉이 되지 않도록 제동을 세 가지 걸어 두었습니다. 같은 종류의 알림은 6시간에 한 번까지만, 밤 10시부터 아침 8시까지는 보내지 않고, 문구는 절대 상대를 탓하지 않습니다. 밀린 며칠을 한 번에 뜯어도 알림은 하나만 갑니다.",
  },
  {
    q: "지난 날은 꾸밀 수 있나요?",
    a: "아니요. 하루가 지나면 그날 페이지는 잠깁니다. 대신 앞날은 미리 꾸며 둘 수 있어서, 기념일이나 출장 가는 주에 몇 장을 한꺼번에 채워 두면 됩니다. 오늘 페이지는 오늘이 끝나기 전까지 계속 채울 수 있습니다.",
  },
  {
    q: "오늘 페이지가 비어 있으면요?",
    a: "상대가 아직 아무것도 올리지 않은 날에는 예전에 둘이 주고받은 페이지 한 장을 작게 꺼내 보여 줍니다. “9월 20일에 받은 한 장”처럼 언제 주고받은 것인지 함께 적힙니다. 상대가 뭐라도 올리면 바로 사라집니다.",
  },
  {
    q: "디데이는 어떻게 세나요?",
    a: "사귀기 시작한 날을 1일로 셉니다. 그래서 100일은 시작한 날로부터 99일 뒤입니다. 100일, 200일 같은 날과 주년은 따로 넣지 않아도 알아서 챙깁니다.",
  },
  {
    q: "데이터는 어디에 저장되나요?",
    a: "로그인하지 않고 쓰면 모든 내용이 이 기기 안에만 있습니다. 상대와 이으면 두 사람의 페이지와 뜯은 기록이 Supabase(데이터베이스·인증 서비스)에 보관되고, 이어진 두 사람 말고는 볼 수 없도록 접근 규칙을 걸어 두었습니다. 광고나 분석 도구는 넣지 않았습니다.",
  },
  {
    q: "탈퇴하면 어떻게 되나요?",
    a: "로그인에 쓴 계정으로 contact@joowonkoh.com 에 삭제를 요청하시면 확인 후 7일 이내에 계정과 두 사람의 페이지, 연결 정보를 지웁니다. 로그인하지 않고 쓴 내용은 앱을 지우면 함께 사라집니다.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div
      className="overflow-hidden rounded-[22px]"
      style={{ background: C.paper, border: `2px dashed ${C.stitch}` }}
    >
      {FAQ.map((item, i) => {
        const isOpen = open === item.q;
        return (
          <div
            key={item.q}
            style={i > 0 ? { borderTop: `1.5px dashed ${C.stitch}` } : undefined}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.q)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span
                className="text-[20px] font-bold leading-snug"
                style={{ fontFamily: HAND, color: C.cocoaDeep }}
              >
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="shrink-0 text-[22px] leading-none"
                style={{ color: C.cherry }}
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
                  <p
                    className="max-w-[58ch] px-5 pb-5 text-[15px] leading-[1.75] break-keep"
                    style={{ color: C.cocoaDeep }}
                  >
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
