"use client";

import { useDetectedPlatform } from "./Download";
import { LATEST } from "./releases";

/**
 * 맨 앞 창 안의 내용 — 이름, 한 줄, 받기 버튼.
 *
 * 맥은 dmg 를 바로 받는다. 윈도우는 런타임부터 깔아야 해서 버튼이 아래 「받기」로 데려간다.
 * 온 사람의 OS 버튼을 앞에(진하게) 둔다.
 */
export default function HeroContent() {
  const platform = useDetectedPlatform();

  const mac = (
    <a key="mac" href={LATEST.mac.href} download className={buttonClass(platform === "mac")}>
      맥에서 받기
    </a>
  );
  const windows = (
    <a key="win" href="#windows" className={buttonClass(platform === "windows")}>
      윈도우에서 받기
    </a>
  );

  return (
    <div>
      <h1 className="sk-display text-[44px] leading-[1.02] text-[#0f2a3a] md:text-[58px]">
        바탕화면 상어
      </h1>
      <p className="mt-4 max-w-[30ch] text-[17px] leading-relaxed text-[#0f2a3a]/75 break-keep md:text-[18px]">
        바탕화면에 상어가 삽니다. 일하면서 클릭하고 타자 치는 게 그대로 밥이 돼요. 지금 이 화면
        아무 데나 눌러 보세요.
      </p>
      <div className="mt-6 flex flex-wrap gap-2.5">
        {platform === "windows" ? [windows, mac] : [mac, windows]}
      </div>
      <p className="mt-4 text-[13px] text-[#0f2a3a]/55">
        무료. 맥은 애플 공증을 받았고, 권한을 하나도 안 물어봐요. {LATEST.version}
      </p>
    </div>
  );
}

function buttonClass(primary: boolean) {
  return `sk-display rounded-full px-5 py-2.5 text-[18px] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1b8db8] ${
    primary
      ? "bg-[#0f2a3a] text-white shadow-[0_10px_22px_-10px_rgba(15,42,58,0.8)]"
      : "bg-[#e6f1f5] text-[#0f2a3a]"
  }`;
}
