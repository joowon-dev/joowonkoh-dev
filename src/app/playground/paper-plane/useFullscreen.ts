"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported] = useState(() =>
    typeof document !== "undefined" && !!document.fullscreenEnabled,
  );

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(
        typeof document !== "undefined" && !!document.fullscreenElement,
      );
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = useCallback(async () => {
    const el = ref.current;
    if (el?.requestFullscreen) {
      try {
        await el.requestFullscreen();
      } catch {
        /* 사용자 거부/미지원 — 조용히 몰입 모드로 폴백 */
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
