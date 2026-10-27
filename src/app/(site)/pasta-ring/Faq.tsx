"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { EASE } from "./motion";
import { C, CUTE, STICKER } from "./palette";

/**
 * 자주 묻는 질문 — 접어 둔다. 누른 것 하나만 열린다.
 *
 * 답은 앱이 실제로 하는 일과 맞아야 한다. 앱을 고치면 여기도 같이 본다
 * (특히 다발 지름 기준, 익힘 오프셋, 광고 위치).
 */

const FAQ = [
  {
    q: "원 크기가 정말 폰마다 같나요?",
    a: "아이폰 8부터 17까지, 그리고 많이 쓰는 갤럭시는 기종별 화면 정보를 앱에 넣어 두고 그 값으로 원을 그립니다. 확대 보기를 켜도 실제 크기는 그대로입니다. 그 밖의 안드로이드 폰은 기기가 알려 주는 화면 밀도로 맞추고, 정보가 부족한 기기에서는 추정한 크기라고 원 아래에 함께 적어 둡니다. 원 아래에 표시된 지름을 자로 재 보면 확인할 수 있습니다.",
  },
  {
    q: "원이 꽉 차면 몇 g 인가요?",
    a: "길이 25cm 스파게티를 손으로 꼭 쥔 다발 100g 을 지름 21mm 로 잡았습니다. 시판 파스타 계량기(22–23mm)와 면 밀도로 계산한 값(약 20mm) 사이입니다. 무게가 4배면 지름은 2배가 되고, 루모처럼 26cm 인 면은 같은 무게라도 원이 조금 작습니다. 다발을 느슨하게 쥐면 실제보다 적게 잡히니 꼭 쥐어 주세요.",
  },
  {
    q: "1인분은 몇 g 이에요?",
    a: "기본은 100g 입니다. 크림·토마토처럼 소스가 무거운 요리라면 80g, 많이 드시는 분은 120g 으로 바꿀 수 있습니다. 바꾼 값은 다음에도 기억합니다.",
  },
  {
    q: "삶는 시간은 어떻게 정하나요?",
    a: "브랜드가 공개한 그 면의 알 덴테 시간을 기준으로 팬에서 마무리 −2분, 알 덴테 그대로, 적당히 +2분, 부드럽게 +4분을 더합니다. 포장지에 시간이 하나만 적힌 이탈리아 면은 그 시간이 알 덴테 기준입니다. 같은 제품이라도 판매 국가마다 표기가 다를 수 있으니, 봉지의 시간과 다르면 봉지를 믿어 주세요.",
  },
  {
    q: "물과 소금은 얼마나 넣어요?",
    a: "흔히 쓰는 비율대로 면 100g 에 물 1L, 소금은 물 1L 에 10g 을 권합니다. 물은 적어도 1L 를 쓰고 0.5L 단위로 올려서 알려 드립니다. 베이컨이나 안초비처럼 짠 재료가 들어가면 소금은 절반만 넣으세요. 입맛에 따라 줄이셔도 됩니다.",
  },
  {
    q: "광고가 있나요?",
    a: "무료 앱이라 광고가 있습니다. 면 고르기·익힘 고르기 화면 아래에 작은 배너가 있고, 면을 두 번 고를 때마다 한 번 전면 광고가 나온 뒤 양 재기로 넘어갑니다. 면을 대고 있는 양 재기 화면과 삶는 동안의 타이머 화면에는 광고를 넣지 않았습니다.",
  },
  {
    q: "데이터는 어디에 저장되나요?",
    a: "고른 면, 즐겨찾기, 1인분 설정, 타이머는 모두 기기 안에만 저장됩니다. 계정도 서버도 없습니다. 다만 광고를 보여 주기 위해 Google AdMob 이 광고 식별자 등 기기 정보를 처리합니다. 자세한 내용은 개인정보처리방침에 있습니다.",
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
                style={{ color: C.tomato }}
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
