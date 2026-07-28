"use client";

import { useEffect, useRef } from "react";
import { FIXED_DT } from "./physics";

const MAX_STEPS_PER_FRAME = 12; // 탭 전환 후 폭주 방지

/**
 * 고정 타임스텝 누적기 + rAF 루프.
 * onStep은 항상 FIXED_DT 간격으로, onFrame은 프레임마다 한 번 호출된다.
 */
export function useGameLoop(
  onStep: (dt: number) => void,
  onFrame: () => void,
  running: boolean,
  speed: number,
): void {
  const stepRef = useRef(onStep);
  const frameRef = useRef(onFrame);
  const speedRef = useRef(speed);

  // 콜백 참조를 effect에서 업데이트하여 안정적인 렌더 동작을 보장한다
  useEffect(() => {
    stepRef.current = onStep;
    frameRef.current = onFrame;
    speedRef.current = speed;
  });

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const tick = (now: number) => {
      const elapsed = Math.min(0.1, (now - last) / 1000) * speedRef.current;
      last = now;
      acc += elapsed;

      let steps = 0;
      while (acc >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
        stepRef.current(FIXED_DT);
        acc -= FIXED_DT;
        steps++;
      }
      if (steps === MAX_STEPS_PER_FRAME) acc = 0;

      frameRef.current();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}
