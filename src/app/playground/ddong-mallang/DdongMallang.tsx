"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFullscreen } from "../_shared/useFullscreen";
import { Cat, type Mood } from "./Cat";
import { BUZZ_DONE, BUZZ_PRAISE, BUZZ_TICK, buzz } from "./haptics";
import {
  canFinish,
  createSession,
  label,
  secondsLeft,
  step,
  type Session,
} from "./session";

const MOOD: Record<Session["phase"], Mood> = {
  ready: "calm",
  waiting: "calm",
  pushing: "strain",
  breathing: "breathe",
  done: "happy",
};

/** 분:초 */
function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}분 ${s}초`;
}

export default function DdongMallang() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { isSupported, isFullscreen, enter, exit } = useFullscreen(rootRef);
  const [session, setSession] = useState<Session>(createSession);

  // 진동은 렌더가 아니라 전이에서 울려야 한다. 이전 값을 ref로 들고 비교한다.
  const prevSecond = useRef(0);
  const prevPhase = useRef<Session["phase"]>("ready");

  useEffect(() => {
    const second = secondsLeft(session);
    if (second !== prevSecond.current && second > 0) buzz(BUZZ_TICK);
    prevSecond.current = second;

    if (session.phase !== prevPhase.current) {
      if (session.phase === "breathing" && session.praise) buzz(BUZZ_PRAISE);
      if (session.phase === "done") buzz(BUZZ_DONE);
      prevPhase.current = session.phase;
    }
  }, [session]);

  // 프레임 루프. ready·done에서는 돌릴 이유가 없다.
  const running = session.phase !== "ready" && session.phase !== "done";
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setSession((s) => step(s, { type: "tick", dt }));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const press = useCallback(() => setSession((s) => step(s, { type: "press" })), []);
  const release = useCallback(() => setSession((s) => step(s, { type: "release" })), []);

  const start = useCallback(() => {
    setSession((s) => step(s, { type: "start" }));
    if (isSupported) enter();
  }, [enter, isSupported]);

  const finish = useCallback(() => {
    setSession((s) => step(s, { type: "finish" }));
    if (isFullscreen) exit();
  }, [exit, isFullscreen]);

  const restart = useCallback(() => setSession((s) => step(s, { type: "restart" })), []);

  const squish = session.phase === "pushing" ? 1 : 0;
  const second = secondsLeft(session);

  return (
    <div
      ref={rootRef}
      className="flex min-h-[100dvh] w-full flex-col items-center justify-between overflow-hidden bg-[#fdf6ef] select-none"
      style={{ touchAction: "none" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {session.phase === "ready" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
          <h1 className="text-4xl font-bold text-[#4a352c]">똥 말랑</h1>
          <p className="max-w-xs text-base leading-relaxed text-[#8a6b5c]">
            고양이 배를 꾹 누르면 힘주기, 손을 떼면 심호흡입니다. 화면이 리듬을 잡아드립니다.
          </p>
          <div className="w-48">
            <Cat mood="calm" squish={0} />
          </div>
          <button
            type="button"
            onClick={start}
            className="rounded-full bg-[#e08f86] px-10 py-4 text-lg font-semibold text-white active:scale-95"
          >
            시작하기
          </button>
        </div>
      ) : session.phase === "done" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="w-48">
            <Cat mood="happy" squish={0} />
          </div>
          <h2 className="text-3xl font-bold text-[#4a352c]">수고하셨어요</h2>
          <p className="text-lg text-[#8a6b5c]">
            {formatDuration(session.elapsedMs)} 동안 {session.pushCount}번 힘주셨어요
          </p>
          <button
            type="button"
            onClick={restart}
            className="rounded-full bg-[#e08f86] px-10 py-4 text-lg font-semibold text-white active:scale-95"
          >
            다시 하기
          </button>
        </div>
      ) : (
        <>
          {/* 상단 — 큰 숫자와 지시 문구 */}
          <div className="flex w-full flex-col items-center pt-10">
            <div className="h-24 text-8xl font-bold tabular-nums text-[#4a352c]">
              {second > 0 ? second : ""}
            </div>
            <p className="mt-2 text-xl font-medium text-[#8a6b5c]">{label(session)}</p>
          </div>

          {/* 고양이 — 화면 전체가 누르는 영역이다. 배만 받으면 손가락이 조금
              벗어날 때마다 힘주기가 끊긴다. */}
          <div
            className="flex w-full max-w-sm flex-1 items-center justify-center px-6"
            onPointerDown={press}
            onPointerUp={release}
            onPointerCancel={release}
            onPointerLeave={release}
          >
            <Cat mood={MOOD[session.phase]} squish={squish} />
          </div>

          <div className="pb-8">
            {canFinish(session) && (
              <button
                type="button"
                onClick={finish}
                className="rounded-full border border-[#d8c3b4] px-6 py-3 text-base text-[#8a6b5c] active:scale-95"
              >
                다 쌌어요
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
