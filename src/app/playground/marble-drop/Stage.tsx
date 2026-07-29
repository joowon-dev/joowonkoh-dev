"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, type RefObject } from "react";
import { computeCamera, drawScene, readPalette, type Palette } from "./render";
import type { Game } from "./setup";

export interface StageHandle {
  /** 현재 게임 상태를 캔버스에 한 번 그린다 */
  draw: () => void;
}

interface StageProps {
  gameRef: RefObject<Game | null>;
  handleRef: RefObject<StageHandle | null>;
}

export default function Stage({ gameRef, handleRef }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paletteRef = useRef<Palette | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const game = gameRef.current;
    if (!canvas || !game) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    if (!paletteRef.current) paletteRef.current = readPalette(canvas);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawScene(ctx, game, computeCamera({ w, h }), paletteRef.current, { w, h });
  }, [gameRef]);

  useImperativeHandle(handleRef, () => ({ draw }), [draw]);

  // 부모 크기 변화·기기 회전까지 잡으려면 window resize만으로는 부족하다
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}
