"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 화면 설정만 저장한다. 카메라 영상이나 그로부터 나온 어떤 값도 저장하지 않는다 —
 * 여기 들어가는 건 민감도 숫자와 미리보기 토글뿐이다.
 */
export interface Settings {
  /** 임계값 배율. 클수록 멀리서도 반응한다. */
  sensitivity: number;
  /** 웹캠 화면을 같이 보여줄지. 기본은 끔 — 나오는 건 개바리면 충분하다. */
  showPreview: boolean;
}

export const DEFAULT_SETTINGS: Settings = { sensitivity: 1, showPreview: false };
export const SENSITIVITY_RANGE = { min: 0.6, max: 1.6, step: 0.1 } as const;

const KEY = "gaebari-glare:settings";

export function useSettings() {
  // 첫 렌더는 서버와 같아야 하므로 기본값으로 시작하고, 마운트된 뒤에 저장값을 읽는다
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Settings>;
      setSettings({
        sensitivity: clampSensitivity(saved.sensitivity),
        showPreview: saved.showPreview === true,
      });
    } catch {
      // 저장값이 깨졌으면 기본값으로 간다. 되살릴 가치가 있는 데이터가 아니다.
    }
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // 사파리 프라이빗 모드 등에서 실패할 수 있다. 저장이 안 될 뿐 동작은 그대로다.
      }
      return next;
    });
  }, []);

  return { settings, update };
}

function clampSensitivity(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return DEFAULT_SETTINGS.sensitivity;
  return Math.min(SENSITIVITY_RANGE.max, Math.max(SENSITIVITY_RANGE.min, v));
}
