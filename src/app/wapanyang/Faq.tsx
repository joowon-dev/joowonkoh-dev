"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { EASE } from "./motion";
import { C, CUTE, STICKER } from "./palette";

/**
 * 자주 묻는 질문 — 접어 둔다. 누른 것 하나만 열린다.
 *
 * 답은 앱이 실제로 하는 일과 맞아야 한다. 앱을 고치면 여기도 같이 본다
 * (특히 보안 점수 표, 측정 시간, 광고 위치).
 */

const FAQ = [
  {
    q: "속도는 어디에 대고 재나요?",
    a: "Cloudflare 의 공개 속도 측정 서버(speed.cloudflare.com)에서 파일을 내려받고 올려 봅니다. 다운로드는 최대 8초, 업로드는 6초 동안 재고, 연결이 자리 잡는 처음 1초는 빼고 계산합니다. 측정에 데이터가 수십 MB 쓰이니 와이파이에서만 진단합니다.",
  },
  {
    q: "꼬리 높이는 무슨 뜻이에요?",
    a: "다운로드 속도입니다. 1Mbps 면 꼬리가 축 처지고, 10Mbps 면 3분의 1, 100Mbps 면 3분의 2, 1000Mbps 를 넘으면 끝까지 섭니다. 빠를수록 고양이 옆에 휙휙 속도선도 생깁니다. 표정은 보안 등급이라서, 빠르지만 위험한 와이파이에서는 꼬리를 세운 채 놀란 얼굴을 합니다.",
  },
  {
    q: "보안 점수는 어떻게 매기나요?",
    a: "100점에서 시작해 깎습니다. 암호 없는 와이파이 −50, WEP −45, WPA −30, WPA2 −5, HTTPS 가로채기 의심 −40, DNS 변조 의심 −30, 로그인 페이지 −10, 기기 30대 이상 −5. 80점 이상이면 안전, 50점 이상이면 주의, 그 아래는 위험입니다. 가로채기나 변조가 의심되면 점수와 상관없이 위험으로 봅니다.",
  },
  {
    q: "아이폰에서는 WPA3 가 안 보여요.",
    a: "iOS 는 앱에 \u201cWPA2 이상\u201d인지까지만 알려 줍니다. 그래서 아이폰에서는 WPA2 와 WPA3 를 가르지 않고 \u201cWPA2 이상\u201d으로 보여 드립니다. 안드로이드는 정확한 방식을 보여 줍니다.",
  },
  {
    q: "위치 권한은 왜 필요해요?",
    a: "iOS 와 안드로이드 모두 와이파이 이름과 암호 방식을 읽으려면 위치 권한을 요구합니다. 위치 좌표는 읽지도, 저장하지도, 보내지도 않습니다. 허용하지 않아도 속도와 나머지 보안 항목은 진단합니다.",
  },
  {
    q: "광고가 있나요?",
    a: "무료 앱이라 광고가 있습니다. 진단·기록 화면 아래에 작은 배너가 있고, 진단을 두 번 할 때마다 한 번 결과를 보여 주기 직전에 전면 광고가 나옵니다. 광고가 데이터를 쓰면 측정이 틀어지기 때문에, 재는 동안에는 배너도 내리고 광고를 띄우지 않습니다.",
  },
  {
    q: "데이터는 어디에 저장되나요?",
    a: "진단 기록(와이파이 이름, 속도, 보안 결과, 공인 IP 와 통신사)과 설정은 모두 기기 안에만 저장됩니다. 계정도 서버도 없습니다. 공유 카드에는 공인 IP 를 넣지 않습니다. 다만 광고를 보여 주기 위해 Google AdMob 이 광고 식별자 등 기기 정보를 처리합니다. 자세한 내용은 개인정보처리방침에 있습니다.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-[22px]" style={{ background: C.card, ...STICKER }}>
      {FAQ.map((item, i) => {
        const isOpen = open === item.q;
        return (
          <div key={item.q} style={i > 0 ? { borderTop: `1.5px solid ${C.line}` } : undefined}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.q)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[19px] leading-snug" style={{ fontFamily: CUTE, color: C.ink }}>
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="shrink-0 text-[22px] leading-none"
                style={{ color: C.ink }}
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
                  <p className="max-w-[58ch] px-5 pb-5 text-[15px] leading-[1.75] break-keep" style={{ color: C.inkSoft }}>
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
