"use client";

import { useEffect, useRef } from "react";
import { SCENE_H, SCENE_W, drawScene, type Scene } from "./render";

/**
 * 픽셀 코트 캔버스.
 *
 * 캔버스 자체를 240×320으로 고정하고 CSS로 늘린다. 기기 배율(dpr)에 맞춰
 * 백버퍼를 키우는 보통 방식과 반대인데, 여기서는 그게 맞다 — 도트가 흐려지지
 * 않고 화면 크기와 상관없이 같은 그림이 나온다.
 *
 * scene을 prop으로 받아 매 렌더 그린다. 부모의 프레임 루프가 초당 60번
 * 새 scene을 내려주므로 여기서 따로 rAF를 돌리지 않는다.
 */
export default function Court({ scene }: { scene: Scene }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    drawScene(ctx, scene);
  }, [scene]);

  return (
    <canvas
      ref={canvasRef}
      width={SCENE_W}
      height={SCENE_H}
      aria-label="농구 코트"
      className="h-full max-w-full w-auto object-contain"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
