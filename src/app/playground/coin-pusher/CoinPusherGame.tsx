"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import SetupPanel from "./SetupPanel";
import Stage, { type StageHandle } from "./Stage";
import WinnerOverlay from "./WinnerOverlay";
import { useGameLoop } from "./useGameLoop";
import { createRng } from "./random";
import { createScheduler, type EventType, type Scheduler } from "./events";
import { FIXED_DT, winnerOf } from "./physics";
import { createGame, type Game } from "./setup";
import { FALL_ANIM_SECONDS, NEUTRAL_INTERVAL, simulate, type FallingCoin } from "./loop";

type Phase = "setup" | "playing" | "result";

const EVENT_LABEL: Record<EventType, string> = {
  shake: "판이 흔들린다!",
  tilt: "판이 기울어진다!",
  rush: "푸셔 가속!",
  backdraft: "역류! 판이 뒤로 밀린다",
  gaterush: "출구가 빨라진다!",
  burst: "판이 솟구친다!",
};

export default function CoinPusherGame() {
  const gameRef = useRef<Game | null>(null);
  const schedulerRef = useRef<Scheduler | null>(null);
  const fallingRef = useRef<FallingCoin[]>([]);
  const shakeRef = useRef(0);
  const stageRef = useRef<StageHandle | null>(null);
  const nextNeutralAtRef = useRef(0);
  /** 당첨 코인이 낙하선을 넘은 시각(초). 아직이면 null. */
  const wonAtRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("setup");
  const [raw, setRaw] = useState("");
  const [seed, setSeed] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);

  const begin = useCallback((names: string[], rawText: string) => {
    // 시드는 매 게임마다 새로 뽑는다. 이후 모든 난수는 이 시드에서 파생된다.
    const nextSeed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    const game = createGame(names, nextSeed);
    gameRef.current = game;
    schedulerRef.current = createScheduler(createRng(nextSeed ^ 0x9e3779b9));
    fallingRef.current = [];
    shakeRef.current = 0;
    nextNeutralAtRef.current = NEUTRAL_INTERVAL;
    wonAtRef.current = null;

    setRaw(rawText);
    setSeed(nextSeed);
    setWinner(null);
    setRemaining(names.length);
    setElapsed(0);
    setBanner(null);
    setSpeed(1);
    setPhase("playing");
  }, []);

  const onStep = useCallback((dt: number) => {
    const game = gameRef.current;
    const scheduler = schedulerRef.current;
    if (!game || !scheduler) return;

    const fired = simulate(game, scheduler, fallingRef.current, nextNeutralAtRef, dt);
    if (fired) setBanner(EVENT_LABEL[fired]);
    else if (scheduler.active === null) setBanner(null);

    // 흔들림과 융기가 화면을 흔든다
    const kind = scheduler.active?.type;
    shakeRef.current = kind === "shake" ? 6 : kind === "burst" ? 7 : 0;

    const win = winnerOf(game.world);
    if (win && wonAtRef.current === null) {
      wonAtRef.current = win.at;
      setWinner(game.names[win.coin.ownerIndex] ?? "");
      setSpeed(0.25); // 슬로우모션으로 낙하를 보여준다
    }
  }, []);

  const onFrame = useCallback(() => {
    stageRef.current?.draw();
    const game = gameRef.current;
    if (!game) return;
    setElapsed(game.world.elapsed);
    setRemaining(
      game.queue.filter((q) => q.coin.ownerIndex >= 0).length +
        game.world.coins.filter((c) => c.ownerIndex >= 0).length,
    );
    // 당첨 코인의 낙하 연출이 끝나면 결과 화면으로 넘어간다.
    // 중립 코인은 계속 떨어지므로 falling이 비는 순간을 기다리면 영영 오지 않는다 —
    // 당첨 시각으로부터 연출 시간만큼 지났는지로 판단한다.
    const wonAt = wonAtRef.current;
    if (wonAt !== null && game.world.elapsed - wonAt >= FALL_ANIM_SECONDS) setPhase("result");
  }, []);

  useGameLoop(onStep, onFrame, phase === "playing", speed);

  const skip = useCallback(() => {
    const game = gameRef.current;
    const scheduler = schedulerRef.current;
    if (!game || !scheduler) return;

    // 결과가 나올 때까지 시뮬레이션만 빠르게 돌린다 (최대 4분치)
    const maxSteps = Math.round(240 / FIXED_DT);
    for (let i = 0; i < maxSteps && !winnerOf(game.world); i++) {
      simulate(game, scheduler, fallingRef.current, nextNeutralAtRef, FIXED_DT);
    }

    const win = winnerOf(game.world);
    // 240초 안에 결과가 안 나오면(극히 드묾) phase를 바꾸지 않고 조용히 반환한다.
    // world.elapsed는 이미 240초만큼 앞서 있어 다음 프레임 HUD가 껑충 뛰겠지만,
    // 멈춘 상태가 아니라 rAF 루프가 이어서 정상 진행되므로 별도 처리를 두지 않는다.
    if (!win) return;
    fallingRef.current.length = 0;
    wonAtRef.current = win.at;
    setWinner(game.names[win.coin.ownerIndex] ?? "");
    setPhase("result");
  }, []);

  const showOverlay = phase === "result" && winner !== null;

  if (phase === "setup") {
    return (
      <div className="animate-fade-in-up px-4 py-10">
        <SetupPanel initialRaw={raw} onStart={begin} />
        <p className="mt-8 text-center text-xs text-text-muted">
          <Link href="/playground" className="underline-offset-4 hover:underline">
            ← 플레이그라운드로
          </Link>
        </p>
      </div>
    );
  }

  // 플레이/결과 화면은 사이트 본문 레이아웃에서 벗어나 뷰포트를 통째로 쓴다.
  // 캔버스가 화면을 다 덮고 HUD와 버튼은 그 위에 얹는다.
  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-bg">
      <Stage gameRef={gameRef} fallingRef={fallingRef} shakeRef={shakeRef} handleRef={stageRef} />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card-bg/85 px-4 py-1.5 text-xs text-text-secondary shadow-ambient backdrop-blur">
          <span>남은 참가자 {remaining}명</span>
          <span aria-hidden className="text-border">
            |
          </span>
          <span className="tabular-nums">{elapsed.toFixed(1)}초</span>
        </div>
        <div className="flex h-7 items-center justify-center">
          {banner && (
            <span
              key={banner}
              className="animate-fade-in-up rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white shadow-ambient"
            >
              {banner}
            </span>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={skip}
          className="w-full max-w-sm rounded-2xl border border-border bg-card-bg/90 px-6 py-3 font-display text-sm font-semibold text-text-secondary shadow-ambient backdrop-blur transition hover:border-accent hover:text-text-primary active:scale-[0.98]"
        >
          결과 바로 보기
        </button>
      </div>

      {showOverlay && (
        <WinnerOverlay
          name={winner}
          seed={seed}
          onRestart={() => begin(gameRef.current?.names ?? [], raw)}
          onEdit={() => setPhase("setup")}
        />
      )}
    </div>
  );
}
