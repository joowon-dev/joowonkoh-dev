"use client";

import { useEffect, useRef } from "react";

import { drawChar, drawProp } from "./kit/render/draw.js";

/**
 * 누가 사나 — 일곱이 저마다 자기 특기를 되풀이한다. 앱과 같은 그리기 함수(drawChar)로 그린다.
 *
 * 한 칸에 캔버스 하나씩. 효과(fx)는 쓰지 않는다 — fx 는 모듈 하나가 입자 목록을 들고 있어서,
 * 여러 캔버스가 같이 쓰면 음표가 남의 칸에 그려진다. 위 데모 하나만 fx 를 쓴다.
 */

const CAST: { kind: string; name: string; move: string; prop?: string; line: string }[] = [
  { kind: "chiikawa", name: "치이카와", move: "weed", line: "풀을 뽑아요. 가끔 울어요" },
  { kind: "hachiware", name: "하치와레", move: "sing", line: "노래해요. 어떻게든 되겠지~" },
  { kind: "usagi", name: "우사기", move: "dance", line: "춤추고, 공중제비를 돌아요" },
  { kind: "momonga", name: "모몽가", move: "pose", line: "귀엽다고 해 줄 때까지 포즈" },
  { kind: "kurimanju", name: "쿠리만쥬", move: "drink", prop: "🍺", line: "한 잔 하고 「하~」" },
  { kind: "rakko", name: "랏코", move: "train", prop: "🗡️", line: "칼을 휘두르며 수련해요" },
  { kind: "shisa", name: "시사", move: "eat", prop: "🍜", line: "라멘을 먹어요" },
];

function Portrait({ kind, move, prop, phase }: { kind: string; move: string; prop?: string; phase: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const W = 132;
    const H = 112;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    const ch = {
      id: phase + 1,
      kind,
      mode: "ground",
      x: W / 2,
      y: H - 14,
      vx: 0,
      vy: 0,
      facing: phase % 2 ? -1 : 1,
      action: move,
      actionAge: phase * 0.3,
      anim: phase,
      squash: 0,
      shake: 0,
      happy: 0,
      say: null,
      spin: 0,
      airT: 0,
      prop: prop ?? null,
      exclaim: 0,
      love: 0,
    };

    let raf = 0;
    let last = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!reduce) {
        ch.anim += dt;
        ch.actionAge += dt;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // 서 있는 자리 — 창 윗변 한 토막.
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(14, H - 14, W - 28, 10, 5);
      ctx.fill();
      drawChar(ctx, ch);
      drawProp(ctx, ch);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [kind, move, prop, phase]);

  return <canvas ref={ref} aria-hidden className="h-[112px] w-[132px]" />;
}

export default function Cast() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
      {CAST.map((c, i) => (
        <li key={c.kind} className="flex flex-col items-center text-center">
          <Portrait kind={c.kind} move={c.move} prop={c.prop} phase={i} />
          <p className="ck-display mt-2 text-[20px] text-[#4b3a35]">{c.name}</p>
          <p className="mt-1 max-w-[16ch] text-[13px] leading-snug text-[#4b3a35]/65 break-keep">
            {c.line}
          </p>
        </li>
      ))}
      <li className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#4b3a35]/15 p-5 text-center">
        <p className="ck-display text-[18px] text-[#4b3a35]">내 그림으로도</p>
        <p className="mt-1 text-[13px] leading-snug text-[#4b3a35]/65 break-keep">
          그림 폴더에 PNG를 넣으면 그 그림으로 나와요
        </p>
      </li>
    </ul>
  );
}
