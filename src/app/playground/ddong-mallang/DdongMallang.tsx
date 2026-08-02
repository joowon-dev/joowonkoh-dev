"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFullscreen } from "../_shared/useFullscreen";
import { Cat, type Mood } from "./Cat";
import { BUZZ_DONE, BUZZ_PRAISE, BUZZ_TICK, buzz } from "./haptics";
import {
  PUSH_MS,
  canFinish,
  createSession,
  label,
  secondsLeft,
  step,
  strainLevel,
  type Session,
} from "./session";

const MOOD: Record<Session["phase"], Mood> = {
  ready: "calm",
  waiting: "calm",
  pushing: "strain",
  // 5초를 넘겨 버티는 중. 표정은 힘주기 그대로 최대치로 간다.
  extra: "strain",
  breathing: "breathe",
  done: "happy",
};

/**
 * 힘주기 한 번마다 막대 하나. 5초 선을 그어두고 그 선을 넘겼는지로 읽는다.
 *
 * 숫자만 나열하면 "3.2초, 5.0초, 1.1초"가 그냥 숫자라 리듬이 안 보인다.
 * 막대로 세워두면 뒤로 갈수록 짧아지는지 같은 흐름이 한눈에 읽힌다.
 */
function TempoRecord({ pushes }: { pushes: number[] }) {
  if (pushes.length === 0) return null;
  // 5초를 기준 폭으로 삼되, 더 오래 버틴 게 있으면 그쪽에 맞춘다.
  const scaleMs = Math.max(PUSH_MS, ...pushes);

  return (
    <div className="w-full shrink-0 text-left">
      <p className="mb-2 text-sm font-medium text-[#8a6b5c]">내 템포</p>
      <div className="relative flex flex-col gap-1.5">
        {/* 5초 기준선 */}
        <div
          aria-hidden
          className="absolute top-0 bottom-0 w-px bg-[#d8c3b4]"
          style={{ left: `${(PUSH_MS / scaleMs) * 100}%` }}
        />
        {pushes.map((ms, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#efe2d6]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(2, (ms / scaleMs) * 100)}%`,
                  // 5초를 채운 것과 못 채운 것을 색으로 가른다
                  background: ms >= PUSH_MS ? "#e08f86" : "#e8c4b8",
                }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[#8a6b5c]">
              {(ms / 1000).toFixed(1)}초
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#a98d7c]">세로선이 5초입니다</p>
    </div>
  );
}

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

  // 힘주는 도중 다른 손가락이 스치며 떼졌을 때 오작동하지 않도록, 맨 처음
  // 누른 포인터의 id만 기억해 둔다. 이미 추적 중일 때 들어오는 press는
  // (다른 손가락이므로) 무시하고, release도 그 id가 아니면 무시한다.
  const activePointerId = useRef<number | null>(null);

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

  // 포인터 컨테이너는 ready·done에서 언마운트된다. 그때까지 눌려 있던 손가락의
  // pointerup은 어디에도 닿지 않으므로, 여기서 소유권을 직접 놓아준다.
  // 안 그러면 그 id가 영영 남아 이후 모든 누르기가 무시된다.
  useEffect(() => {
    if (!running) activePointerId.current = null;
  }, [running]);

  const press = useCallback((e: React.PointerEvent) => {
    if (activePointerId.current !== null) return; // 이미 다른 손가락이 누르고 있다
    activePointerId.current = e.pointerId;
    setSession((s) => step(s, { type: "press" }));
  }, []);

  const release = useCallback((e: React.PointerEvent) => {
    if (e.pointerId !== activePointerId.current) return;
    activePointerId.current = null;
    setSession((s) => step(s, { type: "release" }));
  }, []);

  const start = useCallback(() => {
    setSession((s) => step(s, { type: "start" }));
    if (isSupported) enter();
  }, [enter, isSupported]);

  const finish = useCallback(() => {
    setSession((s) => step(s, { type: "finish" }));
    if (isFullscreen) exit();
  }, [exit, isFullscreen]);

  const restart = useCallback(() => setSession((s) => step(s, { type: "restart" })), []);

  // 표정과 배 눌림을 같은 값으로 굴린다. 5초 동안 0에서 1까지 이어서 올라가므로
  // 배도 표정도 단계적으로 변한다 — 눌렀다/안 눌렀다 둘로만 나누면 5초가 멈춰 보인다.
  const strain = strainLevel(session);
  const second = secondsLeft(session);

  return (
    <div
      ref={rootRef}
      // 사이트 레이아웃(헤더 + <main> 여백) 안에 갇히면 100dvh를 더한 높이가
      // 실제 뷰포트보다 커져서 아래쪽 버튼이 화면 밖으로 밀린다. 전체화면
      // API가 없는 iOS Safari에서도 화면을 그대로 덮도록 fixed로 뷰포트를
      // 뜯어낸다. z-40은 marble-drop과 같은 값 — 헤더(z-40)보다 위에 온다.
      className="fixed inset-0 z-40 flex flex-col items-center justify-between overflow-hidden bg-[#fdf6ef] select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {session.phase === "ready" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
          <h1 className="text-4xl font-bold text-[#4a352c]">똥 말랑</h1>
          {/* 줄바꿈을 브라우저에 맡기면 "심호흡하" / "면서"처럼 어절 중간이 끊긴다.
              break-keep으로 어절을 붙여두고, 의미 단위로 직접 끊는다. */}
          <p className="text-base leading-relaxed break-keep text-[#8a6b5c]">
            고양이 배를 꾹 누르면서 힘주고
            <br />
            심호흡하면서
            <br />
            똥 잘 싸주는 걸 도와드립니다
          </p>
          <div className="w-48">
            <Cat mood="calm" />
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
        <div className="flex min-h-0 w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-8 text-center">
          <div className="w-28 shrink-0">
            <Cat mood="happy" />
          </div>
          <h2 className="text-3xl font-bold text-[#4a352c]">수고하셨어요</h2>
          <p className="text-lg text-[#8a6b5c]">
            {formatDuration(session.elapsedMs)} 동안 {session.pushCount}번 힘주셨어요
          </p>
          <TempoRecord pushes={session.pushes} />
          <button
            type="button"
            onClick={restart}
            className="shrink-0 rounded-full bg-[#e08f86] px-10 py-4 text-lg font-semibold text-white active:scale-95"
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

          {/* 고양이와 이를 감싼 컨테이너 — 누르는 영역은 화면 중앙의 max-w-sm flex-1 div다.
              상단 숫자와 아래 버튼 행은 누르지 않는다. 배만 받으면 손가락이 조금
              벗어날 때마다 힘주기가 끊긴다. */}
          {/* min-h-0이 없으면 flex 아이템의 자동 최소 높이가 고양이 SVG의 내재
              높이(약 580px)로 잡혀서, 화면이 그보다 짧으면 아래 버튼이 통째로
              밀려나 overflow-hidden에 잘린다. 실제로 834px 미만에서 버튼이 사라졌다.
              touch-action은 여기에만 건다 — 배를 누르는 동안 스크롤을 막으면 되고,
              루트에 걸면 다른 화면에서 스크롤이 필요할 때 같이 막혀버린다. */}
          <div
            className="flex w-full max-w-sm min-h-0 flex-1 items-center justify-center px-6"
            style={{ touchAction: "none" }}
            onPointerDown={press}
            onPointerUp={release}
            onPointerCancel={release}
            onPointerLeave={release}
          >
            <Cat mood={MOOD[session.phase]} strain={strain} />
          </div>

          {/* 홈 인디케이터·제스처 바가 덮는 만큼 더 띄운다. 전체화면에서는 페이지가
              화면 맨 아래까지 차지해서 32px로는 버튼이 시스템 UI에 가린다. */}
          <div className="pb-[max(2rem,calc(env(safe-area-inset-bottom)+0.75rem))]">
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
