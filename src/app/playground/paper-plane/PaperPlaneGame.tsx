"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindMic } from "./useWindMic";
import { usePlanePhysics } from "./usePlanePhysics";
import { PlaneCharacter } from "./PlaneCharacter";
import { Scenery } from "./Scenery";
import { HelpOverlay } from "./HelpOverlay";
import { MicPermissionGate } from "./MicPermissionGate";
import { Leaderboard } from "./Leaderboard";

type Phase = "intro" | "aim" | "flying" | "landed";
const VIEW_H = 420;
const TUTORIAL_KEY = "pp_seen_tutorial";

export default function PaperPlaneGame() {
  const mic = useWindMic();
  const physics = usePlanePhysics(mic.wind);
  const [phase, setPhase] = useState<Phase>("intro");
  const [showHelp, setShowHelp] = useState(false);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [pendingDistance, setPendingDistance] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const blowing = phase === "flying" && mic.wind() > 0;

  const begin = useCallback(async () => {
    const seen =
      typeof window !== "undefined" && localStorage.getItem(TUTORIAL_KEY);
    if (!seen) setShowHelp(true);
    await mic.start();
    setPhase("aim");
  }, [mic]);

  const closeHelp = useCallback(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(TUTORIAL_KEY, "1");
    setShowHelp(false);
  }, []);

  // 언마운트 시 마이크 스트림/AudioContext 정리
  useEffect(() => {
    return () => {
      mic.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount cleanup only, stop identity is stable (useCallback([]))
  }, []);

  // 착지 감지: 비행 중 상태가 멎으면 landed로 전환 (렌더 중 setState 금지 → effect로)
  useEffect(() => {
    if (phase === "flying" && physics.state && !physics.running) {
      setPhase("landed");
      setPendingDistance(physics.distance);
    }
  }, [phase, physics.running, physics.state, physics.distance]);

  // 드래그(새총) — 뒤로 당길수록 파워↑, 당긴 반대 방향으로 발사
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== "aim") return;
      dragStart.current = { x: e.clientX, y: e.clientY };
      setDrag({ dx: 0, dy: 0 });
    },
    [phase],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    setDrag({
      dx: e.clientX - dragStart.current.x,
      dy: e.clientY - dragStart.current.y,
    });
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragStart.current || !drag) return;
    const pull = Math.hypot(drag.dx, drag.dy);
    dragStart.current = null;
    setDrag(null);
    if (pull < 12) return; // 미세 클릭 무시
    const power = Math.min(1, pull / 220);
    const angle = Math.atan2(-drag.dy, -drag.dx); // 당긴 반대 방향
    setPhase("flying");
    physics.launchPlane({ angle: normalizeUp(angle), power });
  }, [drag, physics]);

  const planeScreenX = useMemo(() => {
    const x = physics.state?.x ?? 0;
    return Math.min(x, 120); // 화면상 비행기는 좌측 고정 후 배경 스크롤
  }, [physics.state]);
  const planeY =
    VIEW_H - 80 - (physics.state?.y ?? (phase === "aim" ? 40 : 0));

  const rotation = physics.state
    ? -Math.atan2(physics.state.vy, physics.state.vx) * (180 / Math.PI)
    : -20;

  const reset = useCallback(() => {
    physics.reset();
    setPendingDistance(null);
    setHighlightId(null);
    setPhase("aim");
  }, [physics]);

  const handleSubmitted = useCallback((id: string) => {
    setHighlightId(id);
    setPendingDistance(null);
  }, []);

  const retryMic = useCallback(() => {
    mic.start();
  }, [mic]);

  const gateStatus =
    mic.status === "denied" || mic.status === "unsupported"
      ? mic.status
      : null;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div
        className="relative overflow-hidden rounded-2xl border border-border shadow-ambient select-none"
        style={{ height: VIEW_H, touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <Scenery speed={0} />

        {/* 거리 카운터 */}
        {(phase === "flying" || phase === "landed") && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-accent">
            {physics.distance}m
          </div>
        )}

        {/* 도움말 버튼 */}
        {phase !== "intro" && (
          <button
            onClick={() => setShowHelp(true)}
            className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-white/80 text-sm font-bold text-accent"
            aria-label="도움말"
          >
            ?
          </button>
        )}

        {/* 비행기 */}
        {phase !== "intro" && (
          <div
            className="absolute z-10"
            style={{
              left: planeScreenX + 40,
              top: planeY,
              transform: drag ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined,
            }}
          >
            <PlaneCharacter view={phase === "aim" ? "front" : "back"} blowing={blowing} />
          </div>
        )}

        {/* 조준 안내 */}
        {phase === "aim" && !drag && (
          <div className="absolute inset-x-0 bottom-4 z-10 text-center text-xs text-text-secondary">
            비행기를 뒤로 당겼다 놓아 발사하세요
          </div>
        )}
        {phase === "flying" && (
          <div className="absolute inset-x-0 bottom-4 z-10 animate-fade-in-up text-center text-xs font-semibold text-accent">
            🌬️ 마이크에 훅~ 불어 더 멀리 보내세요!
          </div>
        )}
        {phase === "landed" && (
          <div className="absolute inset-x-0 bottom-4 z-10 text-center">
            <button
              onClick={reset}
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white spring-transition hover:scale-[1.02]"
            >
              다시 날리기 ({physics.distance}m)
            </button>
          </div>
        )}

        {/* 인트로 */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/40 backdrop-blur-sm">
            <div className="text-4xl">🐱🛩️</div>
            <h2 className="font-display text-xl font-bold">종이비행기 날리기</h2>
            <p className="text-xs text-text-secondary">드래그로 발사하고 입김으로 멀리!</p>
            <button
              onClick={begin}
              className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white spring-transition hover:scale-[1.02]"
            >
              시작하기 🎤
            </button>
          </div>
        )}

        {showHelp && <HelpOverlay onClose={closeHelp} />}
        {gateStatus && (
          <MicPermissionGate status={gateStatus} onRetry={retryMic} />
        )}
      </div>

      <Leaderboard
        pendingDistance={pendingDistance}
        onSubmitted={handleSubmitted}
        highlightId={highlightId}
      />
    </div>
  );
}

function normalizeUp(angle: number): number {
  // 항상 위쪽(양의 y=up)으로 발사되도록 보정: 결과 각도의 sin을 양수로
  let a = angle;
  if (Math.sin(a) < 0) a = -a;
  // 너무 수직/수평 방지: 15°~80°로 클램프
  const min = (15 * Math.PI) / 180;
  const max = (80 * Math.PI) / 180;
  return Math.max(min, Math.min(max, a));
}
