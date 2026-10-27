"use client";

import { useSyncExternalStore } from "react";

/**
 * 페이지 하나에 시계도 하나.
 *
 * 홈 데모·비교 레이스·머문 시간 카운터가 모두 이 시계를 구독한다. 각자 타이머를
 * 돌리면 숫자들이 서로 다른 순간을 가리키게 되고, 같은 화면 안에서 어긋난 초가
 * 보인다.
 *
 * 앱은 70ms 마다 다시 그린다(`src/ui/Counter.tsx`). 여기서는 숫자가 굴러가는
 * 애니메이션이 있어서 그 간격으로는 덜컥거린다 — 대신 프레임마다 흘린다.
 * 구독자가 하나도 없으면 루프도 멈춘다.
 *
 * 움직임을 줄여 달라고 한 사용자에게는 1초에 한 번만 흘린다. 숫자는 그대로
 * 올라가되 굴러가지는 않는다.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

let currentMs = Date.now();
const listeners = new Set<() => void>();
let frame: number | null = null;
let slowTimer: ReturnType<typeof setInterval> | null = null;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

function emit() {
  currentMs = Date.now();
  listeners.forEach((fn) => fn());
}

function start() {
  if (prefersReducedMotion()) {
    slowTimer ??= setInterval(emit, 1000);
    return;
  }
  const loop = () => {
    emit();
    frame = requestAnimationFrame(loop);
  };
  frame ??= requestAnimationFrame(loop);
}

function stop() {
  if (frame != null) {
    cancelAnimationFrame(frame);
    frame = null;
  }
  if (slowTimer) {
    clearInterval(slowTimer);
    slowTimer = null;
  }
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  start();
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) stop();
  };
}

/**
 * 지금 시각(ms). 서버에서는 알 수 없으므로 `null` 이다.
 *
 * 그래서 이 훅을 쓰는 화면은 하이드레이션 전에 0원을 그린다 — 서버가 찍어둔
 * 시각과 브라우저의 시각이 다를 일이 아예 없다.
 */
export function useNowMs(): number | null {
  return useSyncExternalStore<number | null>(
    subscribe,
    () => currentMs,
    () => null,
  );
}
