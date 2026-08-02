"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Court from "./Court";
import PowerMeter, { BAND_COLOR, BandLegend } from "./PowerMeter";
import { buildFlight, flightAt, type Flight, type Vec3 } from "./flight";
import { isOnTrack, toJamo } from "./hangul";
import {
  MISS_HINT,
  OUTCOME_LABEL,
  SHOTS_PER_GAME,
  THREE_POINT_M,
  createGame,
  grade,
  isMade,
  livePower,
  step,
  strokesPerMinute,
  summarize,
  type Game,
} from "./game";
import type { PlayerPose, Scene } from "./render";

/** 결과를 보여주고 다음 슛으로 넘어가기까지 */
const RESULT_HOLD_MS = 1700;

function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}

/** 지금까지 친 글자에 색을 입힌다. 어디까지 맞았는지가 한눈에 보여야 한다 */
function WordDisplay({ word, typed }: { word: string; typed: string }) {
  const chars = [...word];
  const typedChars = [...typed];
  const offTrack = !isOnTrack(typed, word);

  return (
    <div className="flex justify-center gap-2">
      {chars.map((ch, i) => {
        const t = typedChars[i];
        const done = t === ch;
        const active = t !== undefined && !done;
        return (
          <span
            key={i}
            className="inline-flex h-14 w-14 items-center justify-center rounded-md border-2 text-3xl font-bold tabular-nums"
            style={{
              borderColor: done
                ? "#3fae6a"
                : active
                  ? offTrack
                    ? "#d8483c"
                    : "#c9a227"
                  : "#39415f",
              background: done ? "rgba(63,174,106,0.16)" : "rgba(12,16,32,0.6)",
              color: done ? "#8ce0a8" : active && offTrack ? "#ff9a90" : "#f4e8d2",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}

export default function TypingHoop() {
  // 서버에서도 한 번 그려지므로 첫 판은 고정 시드로 만든다. 진짜 판은
  // 시작 버튼을 누를 때 새 시드로 다시 만든다 — 그래야 하이드레이션이 안 어긋난다.
  const [game, setGame] = useState<Game>(() => createGame(20260803));
  const [now, setNow] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  // 궤적은 ref가 아니라 state로 든다. 매 프레임 렌더에서 공 위치를 읽어야 하는데,
  // 렌더 도중 ref를 읽는 건 React가 금지한다 — 값이 바뀌어도 다시 그려주지 않는다.
  const [flight, setFlight] = useState<{ flight: Flight; startedAt: number } | null>(null);

  const { phase, shot, last } = game;
  const playing = phase === "typing" || phase === "flying" || phase === "result";

  // 프레임 루프가 착지까지 같이 본다. "다 날아갔다"를 이펙트에서 판정하면
  // 매 프레임 상태를 갱신하는 이펙트가 되어 렌더가 연쇄로 돈다.
  const liveRef = useRef({ phase, flight });
  useEffect(() => {
    liveRef.current = { phase, flight };
  });

  // 공이 날아가는 동안뿐 아니라 치는 동안에도 돌아야 한다 —
  // 파워 바늘이 시간에 따라 내려오는 게 이 게임의 조작감 전부다.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const loop = (t: number) => {
      setNow(t);
      const live = liveRef.current;
      if (live.phase === "flying" && live.flight) {
        if (t - live.flight.startedAt >= live.flight.flight.totalMs) {
          setGame((g) => step(g, { type: "landed" }));
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const next = useCallback(() => {
    setFlight(null);
    setGame((g) => step(g, { type: "next" }));
  }, []);

  // 결과를 잠깐 보여주고 자동으로 넘어간다. 매번 버튼을 누르게 하면
  // 열 번 던지는 동안 손이 자판을 스무 번 떠난다.
  useEffect(() => {
    if (phase !== "result") return;
    const id = setTimeout(next, RESULT_HOLD_MS);
    return () => clearTimeout(id);
  }, [phase, game.shotIndex, next]);

  // 새 슛이 뜨면 입력창을 비우고 커서를 돌려준다.
  // 값을 state로 묶지 않고 직접 비우는 이유는 한글 IME 때문이다 — 조합 중인
  // 값을 React가 도로 써넣으면 조합이 깨져서 글자가 사라진다.
  useEffect(() => {
    if (phase !== "typing") return;
    const el = inputRef.current;
    if (!el) return;
    el.value = "";
    el.focus();
  }, [phase, game.shotIndex]);

  /**
   * 입력이 바뀔 때마다 규칙을 한 걸음 돌린다.
   *
   * 단어가 완성되면 여기서 곧바로 궤적까지 만든다. 이펙트로 미루면 슛이
   * 확정된 프레임과 공이 뜨는 프레임이 갈라져 한 박자 끊긴다.
   */
  const onType = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const at = performance.now();
      const nextGame = step(game, { type: "type", value: e.target.value, now: at });
      setGame(nextGame);

      if (nextGame.phase === "flying" && nextGame.last) {
        const r = nextGame.last;
        // 매번 정확히 정중앙으로 날아가면 열 번이 다 같은 그림이다.
        // 결과값에서 뽑은 값이라 같은 슛은 늘 같게 재현된다.
        const lateral = (((nextGame.shotIndex * 37 + Math.round(r.power)) % 11) - 5) / 45;
        setFlight({ flight: buildFlight(r.outcome, r.distanceM, lateral), startedAt: at });
      }
    },
    [game],
  );

  const start = useCallback(() => {
    setFlight(null);
    setGame(step(createGame(randomSeed()), { type: "start" }));
  }, []);

  // ── 화면에 필요한 값들 ────────────────────────────────────────
  const totalJamo = toJamo(shot.word).length;
  const typedJamo = Math.min(totalJamo, toJamo(shot.typed).length);
  const progress = totalJamo > 0 ? typedJamo / totalJamo : 0;

  let ball: Vec3 | null = null;
  let swishAgeMs: number | null = null;
  let shake = 0;
  if (flight && (phase === "flying" || phase === "result")) {
    const t = now - flight.startedAt;
    ball = flightAt(flight.flight, t).pos;
    if (flight.flight.swishAtMs !== null && t >= flight.flight.swishAtMs) {
      swishAgeMs = t - flight.flight.swishAtMs;
    }
    // 못 넣었을 때만 화면을 짧게 흔든다. 넣었을 때도 흔들면 성공이 사고처럼 보인다
    if (last && !isMade(last.outcome)) {
      const since = t - (flight.flight.totalMs - 120);
      if (since > 0) shake = Math.max(0, 1 - since / 320);
    }
  }

  const pose: PlayerPose =
    phase === "typing"
      ? { armLift: progress, holding: true, crouch: Math.max(0, 1 - progress * 1.7) }
      : phase === "flying"
        ? { armLift: 1, holding: false, crouch: 0 }
        : phase === "result"
          ? { armLift: 0.35, holding: false, crouch: 0 }
          : { armLift: 0, holding: true, crouch: 0 };

  const scene: Scene = {
    distanceM: shot.distanceM,
    pose,
    ball,
    swishAgeMs,
    shake,
    spin: now / 90,
  };

  const needle =
    phase === "typing" ? livePower(shot, now) : last ? last.power : null;

  const summary = summarize(game);

  // ── 시작 화면 ─────────────────────────────────────────────────
  if (phase === "ready") {
    return (
      <Shell>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#f4e8d2]">타자 농구</h1>
          <p className="max-w-xs text-sm leading-relaxed break-keep text-[#a8b0d0]">
            세 글자 낱말을 칩니다. <b className="text-[#f4e8d2]">치는 속도가 곧 슛 파워</b>입니다.
            <br />
            골밑에서는 천천히, 멀어질수록 빠르게.
          </p>
          <div className="h-56 w-full max-w-[240px] shrink-0">
            <Court scene={scene} />
          </div>
          <BandLegend />
          <button
            type="button"
            onClick={start}
            className="shrink-0 rounded-full bg-[#e8532e] px-10 py-4 text-lg font-semibold text-white active:scale-95"
          >
            시작하기
          </button>
          <p className="text-xs text-[#6f779a]">{SHOTS_PER_GAME}개를 던집니다</p>
        </div>
      </Shell>
    );
  }

  // ── 끝난 화면 ─────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <Shell>
        <div className="flex min-h-0 w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 self-center overflow-y-auto px-6 py-8 text-center">
          <p className="text-sm text-[#a8b0d0]">{grade(summary)}</p>
          <div className="text-6xl font-bold tabular-nums text-[#f4e8d2]">{summary.score}점</div>
          <div className="grid w-full grid-cols-2 gap-2 text-left">
            <Stat label="성공" value={`${summary.made} / ${summary.attempts}`} />
            <Stat label="클린샷" value={`${summary.cleans}개`} />
            <Stat label="최고 연속" value={`${summary.bestCombo}개`} />
            <Stat label="평균 타수" value={`${Math.round(summary.spm)}타/분`} />
            <Stat label="오타" value={`${summary.mistakes}번`} />
            <Stat label="친 시간" value={`${(summary.totalMs / 1000).toFixed(1)}초`} />
          </div>
          <ShotLog game={game} />
          <button
            type="button"
            onClick={start}
            className="shrink-0 rounded-full bg-[#e8532e] px-10 py-4 text-lg font-semibold text-white active:scale-95"
          >
            다시 하기
          </button>
        </div>
      </Shell>
    );
  }

  // ── 던지는 중 ─────────────────────────────────────────────────
  const threePoint = shot.distanceM >= THREE_POINT_M;
  // 던지고 난 뒤에는 확정된 기록을 보여준다. 살아 있는 시계를 계속 읽으면
  // 공이 날아가는 동안 초와 타수가 늘어나서, 방금 친 속도와 다른 숫자가 남는다.
  const elapsed =
    phase === "typing"
      ? shot.startedAt === null
        ? 0
        : Math.max(0, now - shot.startedAt)
      : (last?.elapsedMs ?? 0);
  const shownStrokes = phase === "typing" ? typedJamo : (last?.keystrokes ?? shot.keystrokes);

  return (
    <Shell>
      {/* 스코어보드 */}
      <div className="flex w-full max-w-md shrink-0 items-center justify-between px-4 pt-3 text-xs tabular-nums text-[#a8b0d0]">
        <span>
          슛 {Math.min(SHOTS_PER_GAME, game.shotIndex + 1)}/{SHOTS_PER_GAME}
        </span>
        <span className="text-lg font-bold text-[#f4e8d2]">{game.score}점</span>
        <span>{game.combo >= 2 ? `${game.combo}연속 🔥` : ` `}</span>
      </div>

      {/* 코트. 캔버스는 높이를 꽉 채우고 폭은 3:4 비율을 따라간다.
          폭에 맞추면 세로로 남는 여백이 생겨 코트와 조작 패널이 멀어진다 */}
      <div className="relative flex min-h-0 w-full flex-1 justify-center">
        <Court scene={scene} />

        {/* 거리 표시 */}
        <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs tabular-nums text-[#f4e8d2]">
          {shot.distanceM.toFixed(1)}m {threePoint ? "· 3점" : "· 2점"}
        </div>

        {/* 결과 */}
        {phase === "result" && last && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-1">
            <div
              className="rounded-full px-4 py-1.5 text-base font-bold text-white"
              style={{ background: BAND_COLOR[last.outcome] }}
            >
              {OUTCOME_LABEL[last.outcome]}
              {last.points > 0 && ` +${last.points}`}
            </div>
            {!isMade(last.outcome) && (
              <span className="rounded-full bg-black/55 px-3 py-1 text-xs text-[#f4e8d2]">
                {MISS_HINT[last.outcome]}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 조작 패널 */}
      <div className="w-full max-w-md shrink-0 px-4 pt-2 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))]">
        <PowerMeter required={shot.required} value={needle} locked={phase !== "typing"} />

        <div className="mt-3">
          <WordDisplay word={shot.word} typed={shot.typed} />
        </div>

        <div className="relative mt-3">
          <input
            ref={inputRef}
            type="text"
            onChange={onType}
            disabled={phase !== "typing"}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-label="낱말 입력"
            placeholder={phase === "typing" ? "여기에 치세요" : ""}
            className="w-full rounded-md border-2 border-[#39415f] bg-[#0c1020] px-3 py-3 text-center text-xl text-[#f4e8d2] outline-none placeholder:text-[#525a7d] focus:border-[#e8532e] disabled:opacity-40"
          />
        </div>

        <div className="mt-2 flex justify-between text-[11px] tabular-nums text-[#6f779a]">
          <span>{elapsed > 0 ? `${(elapsed / 1000).toFixed(2)}초` : "첫 글자부터 잽니다"}</span>
          <span>
            {elapsed > 0
              ? `${Math.round(strokesPerMinute(shownStrokes, elapsed))}타/분`
              : `${shot.keystrokes}타`}
          </span>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  /**
   * 화면 키보드가 올라오면 실제로 보이는 높이만 차지하도록 줄인다.
   *
   * `fixed inset-0`은 키보드가 덮은 부분까지 포함한 레이아웃 뷰포트를 잡는다.
   * 타자 게임인데 정작 입력창이 키보드 뒤로 숨는 셈이라, 폰에서는 자기가 뭘
   * 치고 있는지 못 본다. visualViewport가 알려주는 높이를 직접 써준다.
   *
   * state가 아니라 DOM에 바로 쓰는 이유는, 이 값이 렌더에 쓰이지 않는
   * 바깥 세계(브라우저 UI)의 사정이기 때문이다.
   */
  useEffect(() => {
    const vv = window.visualViewport;
    const el = ref.current;
    if (!vv || !el) return;
    const apply = () => {
      el.style.height = `${vv.height}px`;
      el.style.top = `${vv.offsetTop}px`;
    };
    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
    };
  }, []);

  return (
    <div
      ref={ref}
      // 사이트 레이아웃 안에 갇히면 화면 아래쪽 입력창이 밀려난다.
      // marble-drop·ddong-mallang과 같은 z-40으로 헤더 위에 올린다.
      className="fixed inset-x-0 top-0 z-40 flex h-full flex-col items-center overflow-hidden bg-[#0c1020] select-none"
      style={{ colorScheme: "dark" }}
    >
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#2a3150] bg-[#141a30] px-3 py-2">
      <div className="text-[11px] text-[#8b93b5]">{label}</div>
      <div className="text-base font-semibold tabular-nums text-[#f4e8d2]">{value}</div>
    </div>
  );
}

/** 던진 순서대로 한 줄씩. 어디서 무너졌는지가 보인다 */
function ShotLog({ game }: { game: Game }) {
  if (game.history.length === 0) return null;
  return (
    <div className="w-full text-left">
      <p className="mb-1.5 text-[11px] text-[#8b93b5]">던진 기록</p>
      <div className="flex flex-col gap-1">
        {game.history.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-xs tabular-nums">
            <span className="w-4 shrink-0 text-[#6f779a]">{i + 1}</span>
            <span className="w-12 shrink-0 text-[#a8b0d0]">{r.distanceM.toFixed(1)}m</span>
            <span className="w-12 shrink-0 text-[#a8b0d0]">{r.word}</span>
            <span
              className="flex-1 truncate rounded px-1.5 py-0.5 text-white"
              style={{ background: BAND_COLOR[r.outcome] }}
            >
              {OUTCOME_LABEL[r.outcome]}
            </span>
            <span className="w-6 shrink-0 text-right text-[#f4e8d2]">
              {r.points > 0 ? `+${r.points}` : "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
