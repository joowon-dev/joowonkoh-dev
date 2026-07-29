"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import WinnerOverlay from "../_shared/WinnerOverlay";
import { useGameLoop } from "../_shared/useGameLoop";
import SetupPanel from "./SetupPanel";
import Stage, { type StageHandle } from "./Stage";
import { outcomeOf, simulate, winnerName } from "./loop";
import { FIXED_DT, leadingBucket } from "./physics";
import { createGame, type Game } from "./setup";

type Phase = "intro" | "setup" | "playing" | "result";

/** 당첨이 확정된 뒤 결과 화면으로 넘어가기까지 보여주는 시간(초, 게임 시간 기준) */
const VICTORY_LINGER = 0.8;
/** 그동안의 재생 속도. 마지막 구슬이 떨어지는 것을 보여준다. */
const VICTORY_SPEED = 0.3;

export default function MarbleDropGame() {
  const gameRef = useRef<Game | null>(null);
  const stageRef = useRef<StageHandle | null>(null);
  /** 당첨이 확정된 시각(초). 아직이면 null. */
  const wonAtRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("intro");
  const [raw, setRaw] = useState("");
  const [seed, setSeed] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [forced, setForced] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [lead, setLead] = useState<{ name: string; count: number; capacity: number } | null>(null);
  const [speed, setSpeed] = useState(1);

  const begin = useCallback((names: string[], rawText: string) => {
    // 시드는 매 게임마다 새로 뽑는다. 이후 모든 난수는 이 시드에서 파생된다.
    const nextSeed = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    gameRef.current = createGame(names, nextSeed);
    wonAtRef.current = null;

    setRaw(rawText);
    setSeed(nextSeed);
    setWinner(null);
    setForced(false);
    setElapsed(0);
    setLead(null);
    setSpeed(1);
    setPhase("playing");
  }, []);

  const onStep = useCallback((dt: number) => {
    const game = gameRef.current;
    if (!game) return;

    simulate(game, dt);

    if (wonAtRef.current === null) {
      const outcome = outcomeOf(game);
      if (outcome) {
        wonAtRef.current = game.world.elapsed;
        setWinner(winnerName(game, outcome));
        setForced(outcome.forced);
        setSpeed(VICTORY_SPEED); // 슬로우모션으로 마무리를 보여준다
      }
    }
  }, []);

  const onFrame = useCallback(() => {
    stageRef.current?.draw();
    const game = gameRef.current;
    if (!game) return;

    setElapsed(game.world.elapsed);
    const top = leadingBucket(game.world);
    setLead(
      top
        ? {
            name: game.names[top.ownerIndex] ?? "",
            count: top.count,
            capacity: top.capacity,
          }
        : null,
    );

    const wonAt = wonAtRef.current;
    if (wonAt !== null && game.world.elapsed - wonAt >= VICTORY_LINGER) setPhase("result");
  }, []);

  useGameLoop(onStep, onFrame, phase === "playing", speed, FIXED_DT);

  if (phase === "intro") {
    return (
      <div className="animate-fade-in-up mx-auto w-full max-w-lg px-4 py-16 text-center">
        <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
          Marble Drop
        </span>
        <h1 className="font-display text-2xl font-bold leading-snug tracking-tight md:text-3xl">
          구슬 폭포 추첨기
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          사람마다 양동이가 하나씩 놓이고 위에서 구슬이 쏟아집니다. 회전 바·범퍼·물레방아에
          얻어맞으며 흩어지다가, 양동이를 가장 먼저 채운 사람이 당첨.
        </p>
        <button
          type="button"
          onClick={() => setPhase("setup")}
          className="mt-10 w-full rounded-2xl bg-accent px-6 py-4 font-display text-sm font-semibold text-white shadow-ambient transition hover:shadow-ambient-hover active:scale-[0.98]"
        >
          시작하기
        </button>
        <p className="mt-8 text-xs text-text-muted">
          <Link href="/playground" className="underline-offset-4 hover:underline">
            ← 플레이그라운드로
          </Link>
        </p>
      </div>
    );
  }

  // 참가자 입력도 뷰포트를 통째로 쓴다. 이름을 많이 붙여넣을수록 화면이 넓은 쪽이 낫다.
  if (phase === "setup") {
    return (
      <div className="fixed inset-0 z-40 overflow-y-auto bg-bg">
        <div className="flex min-h-full items-center justify-center px-[max(1rem,env(safe-area-inset-left))] py-[max(1.5rem,env(safe-area-inset-top))]">
          <div className="animate-fade-in-up w-full max-w-lg">
            <SetupPanel initialRaw={raw} onStart={begin} onBack={() => setPhase("intro")} />
          </div>
        </div>
      </div>
    );
  }

  // 플레이/결과 화면은 사이트 본문 레이아웃에서 벗어나 뷰포트를 통째로 쓴다.
  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-bg">
      <Stage gameRef={gameRef} handleRef={stageRef} />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card-bg/85 px-4 py-1.5 text-xs text-text-secondary shadow-ambient backdrop-blur">
          {lead && (
            <>
              <span>
                선두 {lead.name}{" "}
                <span className="tabular-nums font-semibold text-text-primary">
                  {lead.count}/{lead.capacity}
                </span>
              </span>
              <span aria-hidden className="text-border">
                |
              </span>
            </>
          )}
          <span className="tabular-nums">{elapsed.toFixed(1)}초</span>
        </div>
      </div>

      {phase === "result" && winner !== null && (
        <WinnerOverlay
          name={winner}
          subtitle={forced ? "가장 많이 담았습니다 🫧" : "양동이를 가장 먼저 채웠습니다 🫧"}
          seed={seed}
          onRestart={() => begin(gameRef.current?.names ?? [], raw)}
          onEdit={() => setPhase("setup")}
        />
      )}
    </div>
  );
}
