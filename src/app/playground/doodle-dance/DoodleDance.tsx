"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameLoop } from "../_shared/useGameLoop";
import { computeCamera, drawFigure, makePaper } from "./draw";
import { figureStrokes } from "./figure";
import { createTracker, decaySpeed, driveOf, onLeave, onMove } from "./input";
import { createBody, stepBody, toPose } from "./pose";

/**
 * 원본은 프레임 단위 손그림이라 초당 12장 정도로 넘어간다. 자세는 60fps로 계산하되
 * 화면은 이 속도로만 갱신해야 그 뚝뚝 끊기는 질감이 난다. 매끄럽게 그리면
 * 종이 위 낙서가 아니라 잘 만든 3D처럼 보인다.
 */
const SHUTTER_FPS = 12;
const FIXED_DT = 1 / 120;

interface Paper {
  canvas: HTMLCanvasElement;
  w: number;
  h: number;
  dpr: number;
}

export default function DoodleDance() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bodyRef = useRef(createBody());
  const trackerRef = useRef(createTracker());
  const paperRef = useRef<Paper | null>(null);
  const lastDrawRef = useRef(0);
  const seedRef = useRef(1);
  const [touched, setTouched] = useState(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w === 0 || h === 0) return;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    const paper = paperRef.current;
    if (!paper || paper.w !== w || paper.h !== h || paper.dpr !== dpr) {
      paperRef.current = { canvas: makePaper(w, h, dpr), w, h, dpr };
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const bg = paperRef.current;
    if (bg) ctx.drawImage(bg.canvas, 0, 0, w, h);

    seedRef.current = (seedRef.current * 1664525 + 1013904223) >>> 0;
    drawFigure(ctx, figureStrokes(toPose(bodyRef.current)), computeCamera(w, h), seedRef.current);
  }, []);

  const onStep = useCallback((dt: number) => {
    const tracker = trackerRef.current;
    decaySpeed(tracker, performance.now(), dt);
    stepBody(bodyRef.current, driveOf(tracker), dt);
  }, []);

  const onFrame = useCallback(() => {
    const now = performance.now();
    if (now - lastDrawRef.current < 1000 / SHUTTER_FPS) return;
    lastDrawRef.current = now;
    render();
  }, [render]);

  useGameLoop(onStep, onFrame, true, 1, FIXED_DT);

  // 부모 크기 변화·기기 회전까지 잡으려면 window resize만으로는 부족하다
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      lastDrawRef.current = 0;
      render();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [render]);

  const handleMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((event.clientY - rect.top) / rect.height) * 2;
    // event.timeStamp를 쓰지 않는다. 합성 이벤트나 다른 시간 기준에서 온 값이 섞이면
    // 아래 decaySpeed의 performance.now()와 시계가 어긋나 속도가 늘 0으로 깎인다.
    onMove(trackerRef.current, x, y, performance.now());
    setTouched(true);
  }, []);

  const handleRelease = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    // 마우스는 판 위에 있는 동안 계속 조종한다. 손가락은 떼면 놓은 것으로 본다.
    if (event.type === "pointerleave" || event.pointerType !== "mouse") {
      onLeave(trackerRef.current);
    }
  }, []);

  return (
    <div className="animate-fade-in-up">
      <Link
        href="/playground"
        className="text-xs text-text-muted transition-colors hover:text-accent"
      >
        ← Playground
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        낙서 댄스
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        마우스나 트랙패드를 움직이면 종이 위의 낙서가 따라 춤춥니다. 손을 멈추면 혼자 흐느적거려요.
      </p>

      <div className="relative mt-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
        <canvas
          ref={canvasRef}
          onPointerMove={handleMove}
          onPointerDown={handleMove}
          onPointerUp={handleRelease}
          onPointerCancel={handleRelease}
          onPointerLeave={handleRelease}
          className="block h-[64vh] max-h-[680px] min-h-[380px] w-full cursor-crosshair touch-pan-y"
        />
        {!touched && (
          <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs text-text-muted">
            여기서 마우스를 움직여 보세요
          </p>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-muted">
        좌우로 움직이면 몸이 기울고, 위아래로 움직이면 팔이 오르내립니다. 빠르게 움직일수록 격하게
        춥니다.
      </p>
    </div>
  );
}
