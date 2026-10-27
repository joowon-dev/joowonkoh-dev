"use client";

import { useDetectedPlatform } from "./Download";
import { LATEST } from "./releases";

/**
 * 맨 앞 창 안의 내용 — 이름, 한 줄, 받기 버튼.
 *
 * 맥은 dmg 를 바로 받는다. 윈도우는 런타임부터 깔아야 해서 버튼이 아래 「받기」로 데려간다.
 * 온 사람의 OS 버튼을 앞에(분홍으로) 둔다.
 */
export default function HeroContent() {
  const platform = useDetectedPlatform();

  const mac = (
    <a
      key="mac"
      href={LATEST.mac.href}
      download
      className={buttonClass(platform === "mac")}
    >
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
      <h1 className="ck-display text-[40px] leading-[1.05] text-[#4b3a35] md:text-[54px]">
        바탕화면 치이카와
      </h1>
      <p className="mt-4 max-w-[30ch] text-[17px] leading-relaxed text-[#4b3a35]/75 break-keep md:text-[18px]">
        창을 열면 친구들이 화면 아래에서 뿅 튀어나와 그 창 위에 올라서요. 지금 이 창 위에도요.
      </p>
      <div className="mt-6 flex flex-wrap gap-2.5">
        {platform === "windows" ? [windows, mac] : [mac, windows]}
      </div>
      <p className="mt-4 text-[13px] text-[#4b3a35]/55">
        무료. 맥은 애플 공증을 받았어요. {LATEST.version}
      </p>
    </div>
  );
}

function buttonClass(primary: boolean) {
  return `ck-display rounded-full px-5 py-2.5 text-[17px] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8fab] ${
    primary
      ? "bg-[#ff8fab] text-white shadow-[0_10px_22px_-10px_rgba(255,111,150,0.9)]"
      : "bg-[#f3eef1] text-[#4b3a35]"
  }`;
}
