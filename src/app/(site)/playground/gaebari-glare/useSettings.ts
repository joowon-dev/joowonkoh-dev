"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * 화면 설정만 저장한다. 카메라 영상이나 그로부터 나온 어떤 값도 저장하지 않는다 —
 * 여기 들어가는 건 민감도 숫자와 미리보기 토글뿐이다.
 */
export interface Settings {
  /** 임계값 배율. 클수록 멀리서도 반응한다. */
  sensitivity: number;
  /** 웹캠 화면을 같이 보여줄지. 기본은 끔 — 나오는 건 눈이면 충분하다. */
  showPreview: boolean;
  /**
   * 얼굴이 하나뿐일 때도 반응할지. 원래는 1개 이하면 아무 판단도 안 하지만,
   * 혼자 시험해 볼 때는 그러면 아무 일도 안 일어난다.
   */
  soloGlare: boolean;
}

export const DEFAULT_SETTINGS: Settings = { sensitivity: 1, showPreview: false, soloGlare: true };
export const SENSITIVITY_RANGE = { min: 0.6, max: 1.6, step: 0.1 } as const;

const KEY = "gaebari-glare:settings";

/**
 * localStorage는 React 바깥의 저장소이므로 useSyncExternalStore로 읽는다.
 * effect 안에서 setState 하면 서버 스냅샷 → 저장값으로 한 번 더 렌더가 도는데,
 * 그건 정확히 이 훅이 없애 주는 종류의 연쇄 렌더다.
 */
const listeners = new Set<() => void>();
/** 매번 새 객체를 만들면 useSyncExternalStore가 무한 루프에 빠진다. 파싱 결과를 캐시한다. */
let cache: { raw: string | null; value: Settings } | null = null;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // 다른 탭에서 바꾼 것도 따라간다
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Settings {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // 사파리 프라이빗 모드 등. 저장이 안 될 뿐 동작은 그대로다.
  }
  if (cache && cache.raw === raw) return cache.value;

  const value = parse(raw);
  cache = { raw, value };
  return value;
}

/** 서버에는 localStorage가 없다. 첫 렌더는 기본값으로 맞춰 하이드레이션이 어긋나지 않게 한다. */
function getServerSnapshot(): Settings {
  return DEFAULT_SETTINGS;
}

function parse(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const saved = JSON.parse(raw) as Partial<Settings>;
    return {
      sensitivity: clampSensitivity(saved.sensitivity),
      showPreview: saved.showPreview === true,
      soloGlare: saved.soloGlare !== false,
    };
  } catch {
    // 저장값이 깨졌으면 기본값으로 간다. 되살릴 가치가 있는 데이터가 아니다.
    return DEFAULT_SETTINGS;
  }
}

function clampSensitivity(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return DEFAULT_SETTINGS.sensitivity;
  return Math.min(SENSITIVITY_RANGE.max, Math.max(SENSITIVITY_RANGE.min, v));
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = useCallback((patch: Partial<Settings>) => {
    const next = { ...getSnapshot(), ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // 저장에 실패해도 이번 세션 동안은 값이 유지돼야 한다
      cache = { raw: null, value: next };
    }
    listeners.forEach((fn) => fn());
  }, []);

  return { settings, update };
}
