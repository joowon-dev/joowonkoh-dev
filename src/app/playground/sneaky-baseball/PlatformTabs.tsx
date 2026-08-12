"use client";

import { useState, useSyncExternalStore } from "react";
import WindowsPanel from "./WindowsPanel";

/**
 * macOS / Windows 탭. WebSwing 페이지의 것과 같은 동작이다 —
 * 온 사람의 OS를 먼저 열어 주고, 직접 누른 선택이 그다음부터 이긴다.
 */

type Platform = "mac" | "windows";

/**
 * 윈도우에서 온 사람에게 맥 설치법을 먼저 보여줄 이유가 없다.
 *
 * 브라우저가 어느 OS인지는 리액트 바깥의 값이라 렌더 중에 읽으면 서버와
 * 어긋나고, effect 안에서 setState 로 채우면 렌더가 한 번 더 돈다.
 * useSyncExternalStore 가 이 경우를 위한 API다 — 서버 스냅샷은 무조건 mac 이고,
 * 클라이언트에서만 진짜 값을 읽는다. 스냅샷은 매번 같은 값이어야 무한 루프가
 * 안 나므로 한 번 읽고 캐시한다.
 *
 * 판단이 안 서면(리눅스 등) mac 으로 둔다. 탭 두 개가 나란히 보이므로 틀린
 * 추측의 대가는 클릭 한 번이다.
 */
let detectedCache: Platform | null = null;

function detectPlatform(): Platform {
  if (detectedCache === null) {
    const hint = `${navigator.userAgent} ${navigator.platform ?? ""}`;
    detectedCache = /Win/i.test(hint) && !/Mac|iPhone|iPad|iPod/i.test(hint)
      ? "windows"
      : "mac";
  }
  return detectedCache;
}

/** 한 번 읽으면 바뀌지 않는 값이라 구독할 것이 없다. */
function subscribeNever() {
  return () => {};
}

export default function PlatformTabs({ mac }: { mac: React.ReactNode }) {
  const detected = useSyncExternalStore(
    subscribeNever,
    detectPlatform,
    () => "mac" as Platform,
  );
  // 사람이 탭을 누른 뒤로는 그 선택이 이긴다. 늦게 도착한 자동 판단이 방금 한
  // 선택을 되돌리는 것만큼 나쁜 건 없다.
  const [chosen, setChosen] = useState<Platform | null>(null);
  const platform = chosen ?? detected;

  const select = (next: Platform) => setChosen(next);

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="플랫폼"
        className="flex gap-1 rounded-2xl border border-border bg-card-bg p-1 shadow-ambient"
      >
        <TabButton
          selected={platform === "mac"}
          onClick={() => select("mac")}
          controls="panel-mac"
        >
          macOS
        </TabButton>
        <TabButton
          selected={platform === "windows"}
          onClick={() => select("windows")}
          controls="panel-windows"
        >
          Windows
        </TabButton>
      </div>

      <div
        role="tabpanel"
        id="panel-mac"
        hidden={platform !== "mac"}
        className="animate-fade-in-up"
      >
        {mac}
      </div>

      <div
        role="tabpanel"
        id="panel-windows"
        hidden={platform !== "windows"}
        className="animate-fade-in-up"
      >
        <WindowsPanel />
      </div>
    </div>
  );
}

function TabButton({
  selected,
  onClick,
  controls,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  controls: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={controls}
      onClick={onClick}
      className={`flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 font-display text-sm font-semibold spring-transition ${
        selected
          ? "bg-accent-soft text-accent"
          : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}
