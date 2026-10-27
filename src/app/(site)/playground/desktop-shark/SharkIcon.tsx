"use client";

import { useEffect, useRef } from "react";

// 앱의 도감과 같은 함수. kit/README.md 참고.
import { RIM, drawSharkBody } from "./kit/render/draw.js";

/**
 * 상어 한 마리를 멈춘 그림으로. **앱의 도감과 같은 함수로 그린다** — 다르면 도감이 아니다.
 *
 * `light` 는 어두운 바탕(앱의 패널과 같은 남색) 위에 둘 때다. 거기서 먹색 몸에 밝은 테두리를
 * 두르면 속이 빈 윤곽선으로 보여서, 앱의 패널처럼 밝게 채운다. 부르는 쪽이 자기 배경을 안다.
 */
export default function SharkIcon({
  species,
  stage = 6,
  width = 96,
  height = 48,
  light = false,
  alpha = 0.9,
  className,
}: {
  species: string;
  stage?: number;
  width?: number;
  height?: number;
  light?: boolean;
  alpha?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    // 몸 길이가 1 로 들어온다. 꼬리·톱 코가 칸을 넘지 않게 폭의 8할로 둔다.
    const size = width * 0.8;
    ctx.translate(width / 2, height / 2);
    ctx.scale(size, size);
    drawSharkBody(ctx, species, stage, alpha, 0, 0, size, light ? { ink: RIM, rim: false } : {});
  }, [species, stage, width, height, light, alpha]);

  return <canvas ref={ref} aria-hidden className={className} style={{ width, height }} />;
}
