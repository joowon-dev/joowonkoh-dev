"use client";

import { useEffect, useRef } from "react";

const MAX_STEPS_PER_FRAME = 12; // 탭 전환 후 폭주 방지

/**
 * 고정 타임스텝 누적기 + rAF 루프. 플레이그라운드의 캔버스 게임들이 공유한다.
 * onStep은 항상 fixedDt 간격으로, onFrame은 프레임마다 한 번 호출된다.
 *
 * 게임마다 고정 타임스텝이 다를 수 있으므로 fixedDt를 인자로 받는다.
 */
export function useGameLoop(
  onStep: (dt: number) => void,
  onFrame: () => void,
  running: boolean,
  speed: number,
  fixedDt: number,
): void {
  const stepRef = useRef(onStep);
  const frameRef = useRef(onFrame);
  const speedRef = useRef(speed);
  const dtRef = useRef(fixedDt);

  // 콜백 참조를 effect에서 업데이트하여 안정적인 렌더 동작을 보장한다
  useEffect(() => {
    stepRef.current = onStep;
    frameRef.current = onFrame;
    speedRef.current = speed;
    dtRef.current = fixedDt;
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

      const dt = dtRef.current;
      let steps = 0;
      while (acc >= dt && steps < MAX_STEPS_PER_FRAME) {
        stepRef.current(dt);
        acc -= dt;
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
