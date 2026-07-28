"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, type RefObject } from "react";
import { computeCamera, drawScene, readPalette, type FallingCoin, type Palette } from "./render";
import type { Game } from "./setup";

export interface StageHandle {
  /** 현재 게임 상태를 캔버스에 한 번 그린다 */
  draw: () => void;
}

interface StageProps {
  gameRef: RefObject<Game | null>;
  fallingRef: RefObject<FallingCoin[]>;
  handleRef: RefObject<StageHandle | null>;
  className?: string;
}

export default function Stage({ gameRef, fallingRef, handleRef, className }: StageProps) {
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
    const cam = computeCamera({ w, h }, game.world.board);
    drawScene(ctx, game, cam, paletteRef.current, fallingRef.current);
  }, [gameRef, fallingRef]);

  useImperativeHandle(handleRef, () => ({ draw }), [draw]);

  // ResizeObserver를 사용하여 window 리사이즈 외에도 캔버스 크기 변화를 감지한다
  // (부모 컨테이너 크기 변화, CSS media query, 레이아웃 변경 등)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      draw();
    });
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [draw]);

  // 기본값: 판은 너비 420 + 좌우 패딩 32 = 452,
  // 깊이는 (220 - (-20)) * 0.55 = 132 + 상하 패딩 48 = 180.
  // 이 비율을 유지하면 불필요한 공백이 없다.
  // className 속성은 충돌하지 않는 유틸리티를 추가할 때만 사용한다.
  // (w-full, aspect-[452/180], max-h-[60vh]는 Tailwind 스타일시트 순서에 따라 해결되므로
  // 속성 순서로 reliably override할 수 없다)
  const defaultClassName = "w-full aspect-[452/180] max-h-[60vh]";
  const finalClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

  return <canvas ref={canvasRef} className={finalClassName} />;
}
