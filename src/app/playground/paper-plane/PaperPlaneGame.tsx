"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWindMic } from "./useWindMic";
import { usePlanePhysics } from "./usePlanePhysics";
import { useFullscreen } from "./useFullscreen";
import { project, type Viewport } from "./projection";
import { PlaneCharacter } from "./PlaneCharacter";
import { Scenery } from "./Scenery";
import { WindEffects } from "./WindEffects";
import { HelpOverlay } from "./HelpOverlay";
import { MicPermissionGate } from "./MicPermissionGate";
import { Leaderboard } from "./Leaderboard";
import styles from "./effects.module.css";

type Phase = "intro" | "aim" | "flying" | "landed";
const TUTORIAL_KEY = "pp_seen_tutorial";

export default function PaperPlaneGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mic = useWindMic();
  const physics = usePlanePhysics(mic.wind);
  const fs = useFullscreen(containerRef);

  const [phase, setPhase] = useState<Phase>("intro");
  const [showHelp, setShowHelp] = useState(false);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [pendingDistance, setPendingDistance] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [vp, setVp] = useState<Viewport>({ w: 390, h: 780 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const wind = phase === "flying" ? mic.wind() : 0;
  const blowing = wind > 0;

  // 뷰포트 크기 추적
  useEffect(() => {
    const measure = () =>
      setVp({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // 언마운트 시 마이크 정리
  useEffect(() => {
    return () => {
      mic.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount cleanup only; mic.stop identity stable
  }, []);

  // 착지 감지
  useEffect(() => {
    if (phase === "flying" && physics.state && !physics.running) {
      setPhase("landed");
      setPendingDistance(physics.distance);
    }
  }, [phase, physics.running, physics.state, physics.distance]);

  const begin = useCallback(async () => {
    const seen =
      typeof window !== "undefined" && localStorage.getItem(TUTORIAL_KEY);
    if (!seen) setShowHelp(true);
    if (fs.isSupported) fs.enter();
    await mic.start();
    setPhase("aim");
  }, [mic, fs]);

  const closeHelp = useCallback(() => {
    if (typeof window !== "undefined") localStorage.setItem(TUTORIAL_KEY, "1");
    setShowHelp(false);
  }, []);

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
    if (pull < 12) return;
    const power = Math.min(1, pull / 240);
    const angle = Math.atan2(-drag.dy, -drag.dx);
    setPhase("flying");
    physics.launchPlane({ angle: normalizeUp(angle), power });
  }, [drag, physics]);

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

  // 비행기 투영
  const px = physics.state?.x ?? 0;
  const py = physics.state?.y ?? (phase === "aim" ? 40 : 0);
  const proj = project(px, py, vp);
  const speed = physics.running && physics.state
    ? Math.min(1, Math.hypot(physics.state.vx, physics.state.vy) / 700)
    : 0;
  const planeView = phase === "flying" || phase === "landed" ? "back" : "front";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 select-none overflow-hidden bg-sky-100"
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Scenery speed={speed} />
      <WindEffects wind={wind} active={phase === "flying"} />

      {/* 비행기 */}
      {phase !== "intro" && (
        <div
          className={`absolute z-10 ${blowing ? styles.sway : ""}`}
          style={{
            left: proj.screenX,
            top: proj.screenY,
            transform: `translate(-50%, -50%) scale(${proj.scale})${
              drag ? ` translate(${drag.dx}px, ${drag.dy}px)` : ""
            }`,
            transformOrigin: "center",
          }}
        >
          <PlaneCharacter view={planeView} blowing={blowing} />
        </div>
      )}

      {/* 상단 HUD */}
      <div
        className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <div className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold text-accent">
          {phase === "flying" || phase === "landed" ? `${physics.distance}m` : "🐱🛩️"}
        </div>
        <div className="flex items-center gap-2">
          {phase !== "intro" && (
            <button
              onClick={() => setShowHelp(true)}
              className="h-9 w-9 rounded-full bg-white/85 text-sm font-bold text-accent"
              aria-label="도움말"
            >
              ?
            </button>
          )}
          {fs.isSupported && (
            <button
              onClick={fs.toggle}
              className="h-9 w-9 rounded-full bg-white/85 text-sm text-accent"
              aria-label="전체화면"
            >
              ⛶
            </button>
          )}
          <Link
            href="/playground"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-sm font-bold text-accent"
            aria-label="나가기"
          >
            ✕
          </Link>
        </div>
      </div>

      {/* 조준 안내 */}
      {phase === "aim" && !drag && (
        <div className="absolute inset-x-0 bottom-10 z-30 text-center text-sm font-medium text-white drop-shadow">
          비행기를 뒤로 당겼다 놓아 발사하세요
        </div>
      )}

      {/* 인트로 */}
      {phase === "intro" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-sky-100/60 px-6 text-center backdrop-blur-sm">
          <PlaneCharacter view="front" />
          <h2 className="font-display text-2xl font-bold">종이비행기 날리기</h2>
          <p className="text-sm text-text-secondary">
            뒤로 당겨 발사하고, 마이크에 훅~ 불어 더 멀리!
          </p>
          <button
            onClick={begin}
            className="mt-1 rounded-full bg-accent px-7 py-3 text-base font-semibold text-white spring-transition hover:scale-[1.03]"
          >
            시작하기 🎤
          </button>
          <Link href="/playground" className="text-xs text-text-muted underline">
            나가기
          </Link>
        </div>
      )}

      {/* 착지: 리더보드 하단 시트 */}
      {phase === "landed" && (
        <div className="absolute inset-x-0 bottom-0 z-40 max-h-[70%] overflow-y-auto rounded-t-2xl bg-card-bg p-4 shadow-ambient animate-fade-in-up">
          <div className="mb-3 text-center">
            <button
              onClick={reset}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white spring-transition hover:scale-[1.03]"
            >
              다시 날리기 ({physics.distance}m)
            </button>
          </div>
          <Leaderboard
            pendingDistance={pendingDistance}
            onSubmitted={handleSubmitted}
            highlightId={highlightId}
          />
        </div>
      )}

      {showHelp && <HelpOverlay onClose={closeHelp} />}
      {gateStatus && <MicPermissionGate status={gateStatus} onRetry={retryMic} />}
    </div>
  );
}

function normalizeUp(angle: number): number {
  let a = angle;
  if (Math.sin(a) < 0) a = -a;
  const min = (15 * Math.PI) / 180;
  const max = (80 * Math.PI) / 180;
  return Math.max(min, Math.min(max, a));
}
