"use client";

import { useEffect, useRef } from "react";

import { GUN_SHAPES, paintGun } from "./kit/render/draw.js";

/**
 * 총 네 자루. 그림은 앱이 HUD 에 그리는 것 그대로다(kit/render/draw.js).
 * 총가(銃架)처럼 한 판에 줄지어 건다 — 카드 넷으로 쪼개지 않는다.
 */

type Gun = "pistol" | "machinegun" | "shotgun" | "sniper";

const RACK: { gun: Gun; name: string; rate: string; body: string }[] = [
  {
    gun: "pistol",
    name: "권총",
    rate: "1초에 7발쯤",
    body: "한 번 당기면 글 하나를 한 글자씩. 탕, 탕, 탕 — 셀 수 있는 빠르기예요. 다 쏘고 또 당기면 방금 것을 다시 쏴요.",
  },
  {
    gun: "machinegun",
    name: "기관총",
    rate: "1초에 30발",
    body: "복사해 둔 것 전부를 순서대로 쏟아내요. 글과 글 사이에 Tab이나 Enter를 눌러 줘서, 이름·전화·주소 칸을 한 번에 채워요.",
  },
  {
    gun: "shotgun",
    name: "샷건",
    rate: "여덟 글자씩",
    body: "남은 것 전부를 뭉텅이로 한꺼번에. 긴 글을 기다리기 싫을 때 써요.",
  },
  {
    gun: "sniper",
    name: "저격총",
    rate: "한 방",
    body: "탄창의 몇 번째 글인지 골라서 통째로 한 방에. ⌥⇧1~9(윈도우는 Alt+Shift+1~9)가 그 번호예요.",
  },
];

export default function Arsenal() {
  return (
    <ul className="pg-range overflow-hidden rounded-[24px] text-[#e8ecf1]">
      {RACK.map((row, i) => (
        <li
          key={row.gun}
          className={`grid items-center gap-x-6 gap-y-3 px-5 py-5 sm:grid-cols-[168px_minmax(0,1fr)] md:px-8 ${
            i > 0 ? "border-t border-white/8" : ""
          }`}
        >
          <GunPicture gun={row.gun} />
          <div>
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="pg-display text-[24px]">{row.name}</span>
              <span className="pg-num text-[15px] text-[#d8a23c]">{row.rate}</span>
            </p>
            <p className="mt-1.5 max-w-[56ch] text-[15px] leading-[1.75] text-[#e8ecf1]/72 break-keep">{row.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

const W = 168;
const H = 72;

function GunPicture({ gun }: { gun: Gun }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const shape = (GUN_SHAPES as Record<Gun, { parts: { points: number[][] }[] }>)[gun];
    const xs = shape.parts.flatMap((part) => part.points.map((p) => p[0]));
    const ys = shape.parts.flatMap((part) => part.points.map((p) => p[1]));
    const left = Math.min(...xs);
    const top = Math.min(...ys);
    const scale = Math.min((W - 12) / (Math.max(...xs) - left), (H - 12) / (Math.max(...ys) - top));

    const ratio = window.devicePixelRatio || 1;
    canvas.width = W * ratio;
    canvas.height = H * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.translate(6, (H - (Math.max(...ys) - top) * scale) / 2);
    ctx.scale(scale, scale);
    ctx.translate(-left, -top);
    paintGun(ctx, shape);
  }, [gun]);

  return <canvas ref={ref} style={{ width: W, height: H }} aria-hidden />;
}
