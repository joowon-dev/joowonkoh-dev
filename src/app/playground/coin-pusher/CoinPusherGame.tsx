"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import SetupPanel from "./SetupPanel";
import Stage, { type StageHandle } from "./Stage";
import WinnerOverlay from "./WinnerOverlay";
import { useGameLoop } from "./useGameLoop";
import { createRng } from "./random";
import {
  applyFinalSpurt,
  applyScheduler,
  createScheduler,
  isFinalSpurt,
  updateScheduler,
  type EventType,
  type Scheduler,
} from "./events";
import { FIXED_DT, stepWorld, winnerOf } from "./physics";
import { allDropped, createGame, releaseDue, spawnNeutral, type Game } from "./setup";
import type { FallingCoin } from "./render";

type Phase = "setup" | "playing" | "result";

const EVENT_LABEL: Record<EventType, string> = {
  shake: "판이 흔들린다!",
  tilt: "판이 기울어진다!",
  rush: "푸셔 가속!",
};

/** 중립 코인 추가 투입 간격(초) */
const NEUTRAL_INTERVAL = 1.4;
const NEUTRAL_INTERVAL_SPURT = 0.35;
const FALL_ANIM_SECONDS = 0.9;

/**
 * 한 스텝 진행. React 상태를 건드리지 않으므로 rAF 루프와 "결과 바로 보기"의
 * 빠른 시뮬레이션이 같은 코드를 쓴다. falling 배열은 제자리에서 수정한다.
 */
function simulate(
  game: Game,
  scheduler: Scheduler,
  falling: FallingCoin[],
  nextNeutralAt: { current: number },
  dt: number,
): EventType | null {
  releaseDue(game);

  const fired = updateScheduler(scheduler, game.world.elapsed, dt);
  applyScheduler(game.world, scheduler);
  applyFinalSpurt(game.world, game.world.elapsed);

  // 참가자 코인이 전부 들어온 뒤부터 중립 코인을 계속 투입한다
  if (allDropped(game) && game.world.elapsed >= nextNeutralAt.current) {
    const spurt = isFinalSpurt(game.world.elapsed);
    spawnNeutral(game, spurt ? 3 : 1);
    nextNeutralAt.current =
      game.world.elapsed + (spurt ? NEUTRAL_INTERVAL_SPURT : NEUTRAL_INTERVAL);
  }

  const fallenBefore = game.world.fallen.length;
  stepWorld(game.world, dt);

  // 이번 스텝에 떨어진 코인을 낙하 연출 목록에 넣는다
  for (let i = fallenBefore; i < game.world.fallen.length; i++) {
    falling.push({ coin: game.world.fallen[i].coin, t: 0 });
  }
  for (let i = falling.length - 1; i >= 0; i--) {
    falling[i].t += dt;
    if (falling[i].t >= FALL_ANIM_SECONDS) falling.splice(i, 1);
  }

  return fired;
}

export default function CoinPusherGame() {
  const gameRef = useRef<Game | null>(null);
  const schedulerRef = useRef<Scheduler | null>(null);
  const fallingRef = useRef<FallingCoin[]>([]);
  const stageRef = useRef<StageHandle | null>(null);
  const nextNeutralAtRef = useRef(0);

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
    nextNeutralAtRef.current = NEUTRAL_INTERVAL;

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

    const win = winnerOf(game.world);
    if (win) {
      setWinner(game.names[win.coin.ownerIndex] ?? "");
      setSpeed(0.25); // 슬로우모션으로 낙하를 보여준다
    }
  }, []);

  const onFrame = useCallback(() => {
    stageRef.current?.draw();
    const game = gameRef.current;
    if (!game) return;
    setElapsed(game.world.elapsed);
    setRemaining(game.queue.length + game.world.coins.filter((c) => c.ownerIndex >= 0).length);
    // 당첨 코인의 낙하 연출이 끝나면 결과 화면으로 넘어간다
    if (winnerOf(game.world) && fallingRef.current.length === 0) setPhase("result");
  }, []);

  useGameLoop(onStep, onFrame, phase === "playing", speed);

  const skip = useCallback(() => {
    const game = gameRef.current;
    const scheduler = schedulerRef.current;
    if (!game || !scheduler) return;

    // 결과가 나올 때까지 시뮬레이션만 빠르게 돌린다 (최대 3분치)
    const maxSteps = Math.round(180 / FIXED_DT);
    for (let i = 0; i < maxSteps && !winnerOf(game.world); i++) {
      simulate(game, scheduler, fallingRef.current, nextNeutralAtRef, FIXED_DT);
    }

    const win = winnerOf(game.world);
    if (!win) return;
    fallingRef.current.length = 0;
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

  // 플레이/결과 화면은 사이트 본문 레이아웃(max-w-3xl, py-16)에서 벗어나
  // 화면 전체를 차지한다. Stage 캔버스가 세로로 가득 차지 않으므로
  // 컨텐츠 블록을 뷰포트 안에서 수직 중앙 정렬한다.
  return (
    <div className="fixed inset-0 z-40 flex overflow-y-auto bg-bg">
      <div className="m-auto w-full max-w-md px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>남은 코인 {remaining}개</span>
          <span className="tabular-nums">{elapsed.toFixed(1)}초</span>
        </div>

        <div className="mt-3 flex h-8 items-center justify-center">
          {banner && (
            <span className="animate-fade-in-up rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent">
              {banner}
            </span>
          )}
        </div>

        <Stage
          gameRef={gameRef}
          fallingRef={fallingRef}
          handleRef={stageRef}
          className="rounded-2xl border border-border bg-card-bg shadow-ambient"
        />

        <button
          type="button"
          onClick={skip}
          className="mt-6 w-full rounded-2xl border border-border bg-card-bg px-6 py-3 font-display text-sm font-semibold text-text-secondary transition hover:border-accent hover:text-text-primary active:scale-[0.98]"
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
