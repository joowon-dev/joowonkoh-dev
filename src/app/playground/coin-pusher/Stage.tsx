"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, type RefObject } from "react";
import { computeCamera, drawScene, readPalette, type Palette } from "./render";
import type { Fx } from "./loop";
import type { Game } from "./setup";

export interface StageHandle {
  /** 현재 게임 상태를 캔버스에 한 번 그린다 */
  draw: () => void;
}

interface StageProps {
  gameRef: RefObject<Game | null>;
  fxRef: RefObject<Fx>;
  /** 진행 중인 흔들림 세기(화면 픽셀). 0이면 흔들지 않는다. */
  shakeRef: RefObject<number>;
  handleRef: RefObject<StageHandle | null>;
  className?: string;
}

export default function Stage({ gameRef, fxRef, shakeRef, handleRef, className }: StageProps) {
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
    drawScene(ctx, game, cam, paletteRef.current, fxRef.current, shakeRef.current);
  }, [gameRef, fxRef, shakeRef]);

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

  // 기본값: 부모를 가득 채운다. 판 비율이 화면과 다르면 computeCamera가 가운데 정렬한다.
  // className 속성은 충돌하지 않는 유틸리티를 추가할 때만 사용한다.
  // (Tailwind 충돌은 스타일시트 순서로 해결되므로 속성 순서로 override할 수 없다)
  const defaultClassName = "block h-full w-full";
  const finalClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

  return <canvas ref={canvasRef} className={finalClassName} />;
}
