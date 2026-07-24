"use client";

import { useCallback, useSyncExternalStore, type RefObject } from "react";

const noopSubscribe = () => () => {};

function subscribeFullscreen(callback: () => void) {
  if (typeof document === "undefined") return () => {};
  document.addEventListener("fullscreenchange", callback);
  return () => document.removeEventListener("fullscreenchange", callback);
}

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const isFullscreen = useSyncExternalStore(
    subscribeFullscreen,
    () => typeof document !== "undefined" && !!document.fullscreenElement,
    () => false,
  );
  const isSupported = useSyncExternalStore(
    noopSubscribe,
    () => typeof document !== "undefined" && !!document.fullscreenEnabled,
    () => false,
  );

  const enter = useCallback(async () => {
    const el = ref.current;
    if (el?.requestFullscreen) {
      try {
        await el.requestFullscreen();
      } catch {
        /* 사용자 거부/미지원 — 조용히 폴백 */
      }
    }
  }, [ref]);

  const exit = useCallback(async () => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const toggle = useCallback(() => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      exit();
    } else {
      enter();
    }
  }, [enter, exit]);

  return { isFullscreen, isSupported, enter, exit, toggle };
}
