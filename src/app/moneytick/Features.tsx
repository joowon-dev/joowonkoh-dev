"use client";

import { motion } from "motion/react";

import { LANDING } from "./copy";
import type { Lang } from "./i18n";
import { EASE } from "./motion";

/**
 * 기능 타일.
 *
 * 문단으로 설명하지 않는다. 제목 한 줄과 여섯 단어쯤의 꼬리말이면 충분하고,
 * 나머지는 위의 데모가 이미 보여줬다. 스크롤을 따라 한 장씩 올라오고,
 * 커서를 얹으면 살짝 뜬다. 타일 글은 언어별 문구(`copy/*.ts`)에 있다.
 */

export default function Features({ lang }: { lang: Lang }) {
  const FEATURES = LANDING[lang].features;
  return (
    <motion.div
      className="grid grid-cols-1 gap-3 rounded-[28px] bg-[#F2F2F7] p-4 sm:grid-cols-2 sm:p-5"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {FEATURES.map((f) => (
        <motion.div
          key={f.title}
          variants={{
            hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.6, ease: EASE },
            },
          }}
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="rounded-[22px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        >
          <h3 className="text-[17px] font-semibold leading-[22px] tracking-[-0.408px] text-black">
            {f.title}
          </h3>
          <p className="mt-1 text-[14px] leading-[19px] tracking-[-0.24px] text-[rgba(60,60,67,0.6)]">
            {f.tail}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
