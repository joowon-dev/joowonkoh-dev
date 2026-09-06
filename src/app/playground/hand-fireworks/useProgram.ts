"use client";

import { useCallback } from "react";
import { useSyncExternalStore } from "react";
import { EMPTY_PROGRAM, sanitizeProgram, type Program } from "./program";

/**
 * 짜 둔 발사 프로그램만 저장한다. 카메라 영상이나 손 좌표는 저장하지 않는다 —
 * 여기 들어가는 건 모양 이름과 색 숫자뿐이다.
 *
 * localStorage는 React 바깥의 저장소라 useSyncExternalStore로 읽는다.
 * effect 안에서 setState 하면 서버 스냅샷 → 저장값으로 렌더가 한 번 더 도는데,
 * 그건 정확히 이 훅이 없애 주는 종류의 연쇄 렌더다.
 */
const KEY = "hand-fireworks:program";

const listeners = new Set<() => void>();
/** 매번 새 배열을 만들면 useSyncExternalStore가 무한 루프에 빠진다. 파싱 결과를 캐시한다. */
let cache: { raw: string | null; value: Program } | null = null;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // 다른 탭에서 바꾼 것도 따라간다
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Program {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // 사파리 프라이빗 모드 등. 저장이 안 될 뿐 동작은 그대로다.
  }
  if (cache && cache.raw === raw) return cache.value;

  let value = EMPTY_PROGRAM;
  if (raw) {
    try {
      value = sanitizeProgram(JSON.parse(raw));
    } catch {
      // 깨진 저장값. 빈 프로그램이면 무작위로 나가므로 페이지는 그대로 논다.
      value = EMPTY_PROGRAM;
    }
  }
  cache = { raw, value };
  return value;
}

/** 서버에는 localStorage가 없다. 첫 렌더를 빈 프로그램으로 맞춰 하이드레이션이 어긋나지 않게 한다. */
function getServerSnapshot(): Program {
  return EMPTY_PROGRAM;
}

export function useProgram() {
  const program = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const save = useCallback((next: Program) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // 저장에 실패해도 이번 세션 동안은 유지돼야 한다
      cache = { raw: null, value: next };
    }
    listeners.forEach((fn) => fn());
  }, []);

  return { program, save };
}
