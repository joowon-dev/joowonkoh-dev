"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * macOS / Windows 탭.
 *
 * 윈도우 버전은 아직 실제 윈도우 머신에서 실행해 본 적이 없어서, 받아 간
 * 사람이 안 되는 걸 붙들고 있게 만들 수는 없다. 그래서 기본은 "준비중"이고,
 * 아는 사람만 연다.
 *
 * 여는 방법: 이 페이지에서 UNLOCK_WORD 를 타이핑한다. WebSwing 타자 모드가
 * "치면 올라간다"는 앱이니 여는 방식도 타이핑인 편이 어울린다.
 * (`?win=<단어>` 로도 열린다 — 폰에서 키보드 없이 확인할 때가 있어서.)
 *
 * 한 번 열면 localStorage 에 남으므로 다음 방문부터는 그냥 보인다.
 *
 * **이건 잠금장치가 아니라 가림막이다.** 정적 사이트라 서버에서 막을 방법이
 * 없다. 아래 dynamic import 덕분에 잠겨 있는 동안 윈도우 쪽 설명과 파일 주소가
 * 별도 청크에 있어 페이지 소스에는 안 나오지만, 빌드 매니페스트를 뒤지면
 * 찾을 수 있다. 감출 가치가 있는 걸 넣으면 안 된다.
 */

const UNLOCK_WORD = "gaebari";
const STORAGE_KEY = "webswing.windows.unlocked";

const WindowsPanel = dynamic(() => import("./WindowsPanel"), { ssr: false });

/**
 * 잠금 상태를 리액트 바깥의 작은 스토어로 둔다.
 *
 * localStorage 는 서버에 없으니 렌더 중에는 읽을 수 없고, 그렇다고 effect 안에서
 * setState 로 채우면 렌더가 한 번 더 돈다. useSyncExternalStore 는 이 경우를 위해
 * 있는 API다 — 서버 스냅샷은 무조건 false 이고, 클라이언트에서만 진짜 값을 읽는다.
 *
 * 스냅샷은 매번 같은 값을 돌려줘야 무한 루프가 안 나므로 한 번 읽고 캐시한다.
 */
let unlockedCache: boolean | null = null;
const listeners = new Set<() => void>();

function readUnlocked(): boolean {
  if (unlockedCache === null) {
    const params = new URLSearchParams(window.location.search);
    unlockedCache =
      window.localStorage.getItem(STORAGE_KEY) === "1" ||
      params.get("win") === UNLOCK_WORD;
  }
  return unlockedCache;
}

function subscribeUnlocked(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function persistUnlocked() {
  window.localStorage.setItem(STORAGE_KEY, "1");
  unlockedCache = true;
  listeners.forEach((listener) => listener());
}

type Platform = "mac" | "windows";

export default function PlatformTabs({ mac }: { mac: React.ReactNode }) {
  const [platform, setPlatform] = useState<Platform>("mac");
  const [justUnlocked, setJustUnlocked] = useState(false);
  const unlocked = useSyncExternalStore(
    subscribeUnlocked,
    readUnlocked,
    () => false,
  );

  const unlock = useCallback(() => {
    persistUnlocked();
    setJustUnlocked(true);
    setPlatform("windows");
  }, []);

  useEffect(() => {
    if (unlocked) return;
    let typed = "";
    const onKeyDown = (event: KeyboardEvent) => {
      // 입력란에 치는 건 세지 않는다. 이 페이지엔 아직 없지만, 나중에 폼이
      // 하나 생기는 순간 조용히 이상해질 종류의 버그다.
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      if (event.key.length !== 1) return;
      typed = (typed + event.key.toLowerCase()).slice(-UNLOCK_WORD.length);
      if (typed === UNLOCK_WORD) unlock();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [unlocked, unlock]);

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="플랫폼"
        className="flex gap-1 rounded-2xl border border-border bg-card-bg p-1 shadow-ambient"
      >
        <TabButton
          selected={platform === "mac"}
          onClick={() => setPlatform("mac")}
          controls="panel-mac"
        >
          macOS
        </TabButton>
        <TabButton
          selected={platform === "windows"}
          onClick={() => setPlatform("windows")}
          controls="panel-windows"
        >
          Windows
          {!unlocked && (
            <span className="ml-2 rounded-full bg-tag-bg px-2 py-0.5 text-[10px] font-normal text-text-muted">
              준비중
            </span>
          )}
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

      <div role="tabpanel" id="panel-windows" hidden={platform !== "windows"}>
        {platform === "windows" &&
          (unlocked ? (
            <div className="animate-fade-in-up">
              {justUnlocked && (
                <p className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft px-5 py-3 text-xs leading-relaxed text-accent">
                  숨겨둔 걸 찾으셨네요. 이 브라우저에서는 이제 계속 보입니다.
                </p>
              )}
              <WindowsPanel />
            </div>
          ) : (
            <ComingSoon />
          ))}
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

function ComingSoon() {
  return (
    <div className="mt-8 animate-fade-in-up rounded-2xl border border-border bg-card-bg p-8 text-center shadow-ambient">
      <p className="font-display text-sm font-semibold text-text-primary">
        윈도우 버전은 준비중입니다
      </p>
      <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-text-secondary">
        포팅은 되어 있고 물리와 두 브레인은 테스트까지 끝났지만, 아직 실제
        윈도우 PC에서 한 번도 실행해 보지 못했습니다. 그 상태로 내려받게 하고
        싶지 않아서 잠가 뒀습니다.
      </p>
      <p className="mt-4 text-[11px] text-text-muted">
        준비되면 여기에 올립니다.
      </p>
    </div>
  );
}
