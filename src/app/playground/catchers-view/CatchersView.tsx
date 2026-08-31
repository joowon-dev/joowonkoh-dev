"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameHelp from "../_shared/GameHelp";
import { GAME_HELP } from "../_shared/helpContent";
import { useFullscreen } from "../_shared/useFullscreen";
import { createRng } from "../_shared/random";
import { catcherCamera } from "./camera";
import { msToKmh, spinAxis, type ThrownPitch, type Vec3 } from "./flight";
import {
  PITCHERS,
  PITCH_COLOR,
  PITCH_COLOR_CSS,
  ZONE,
  planPitch,
  releasePoint,
  pickSequence,
  throwPlan,
  toThrow,
  type PitchPlan,
  type Pitcher,
} from "./pitchers";
import { createRenderer, toBodyMatrix, type Renderer, type TrailLayer } from "./renderer";
import { rectangleLoop } from "./ribbon";
import { makeTimeline, sampleAt, stageAt, type Phase, type Timeline } from "./stage";

/** 화면에 남겨 두는 자국 개수. 더 쌓으면 어느 게 뭔지 안 보인다 */
const MAX_TRAILS = 6;
/** 낮↔밤이 넘어가는 데 걸리는 느낌. 클수록 느리다 */
const DAYLIGHT_EASE = 0.18;
const DAYLIGHT_KEY = "catchers-view:daylight";

interface Live {
  plan: PitchPlan;
  flight: ThrownPitch;
  timeline: Timeline;
  /** 실밥이 도는 축. 궤적을 만든 회전축과 같은 숫자에서 나온다 */
  axis: Vec3;
}

interface Mark {
  key: number;
  points: Vec3[];
  color: [number, number, number];
}

/** 릴리스 직후 방향으로 회전축을 잡는다. 표본 두 개면 충분하다 */
function axisOf(flight: ThrownPitch, tiltHours: number): Vec3 {
  const [a, b] = flight.samples;
  return spinAxis(tiltHours, { x: b.p.x - a.p.x, y: b.p.y - a.p.y, z: b.p.z - a.p.z });
}

function lerp(a: number, b: number, f: number): number {
  return a + (b - a) * f;
}

export default function CatchersView() {
  const [pitcher, setPitcher] = useState<Pitcher>(PITCHERS[0]);
  const [caption, setCaption] = useState<Live | null>(null);
  const [showMarks, setShowMarks] = useState(true);
  const [paused, setPaused] = useState(false);
  const [isDay, setIsDay] = useState(false);
  /** 자막은 리플레이에서만 뜬다. 0.4초짜리 공에 글씨를 얹으면 글씨를 읽다 공을 놓친다 */
  const [showCaption, setShowCaption] = useState(false);
  const [failed, setFailed] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const fs = useFullscreen(stageRef);

  // 매 프레임 바뀌는 것은 전부 ref에 둔다. 여기에 setState를 걸면 초당 60번
  // 리액트를 깨우게 되고, 정작 0.4초짜리 공이 끊긴다
  const rngRef = useRef(createRng(20260831));
  const queueRef = useRef<ReturnType<typeof pickSequence>>([]);
  const liveRef = useRef<Live | null>(null);
  const marksRef = useRef<Mark[]>([]);
  const clockRef = useRef(0);
  const markKeyRef = useRef(0);
  const phaseRef = useRef<Phase | null>(null);
  const pausedRef = useRef(false);
  const showMarksRef = useRef(true);
  /** 목표는 0 또는 1, 현재 값은 그쪽으로 미끄러진다 */
  const daylightTargetRef = useRef(0);
  const daylightRef = useRef(0);

  // rAF 루프는 리액트 밖에서 도는 외부 시스템이라, 토글 값을 ref로 흘려보낸다.
  // 렌더 중에 ref를 건드리면 두 세계의 시점이 어긋난다
  useEffect(() => {
    pausedRef.current = paused;
    showMarksRef.current = showMarks;
    daylightTargetRef.current = isDay ? 1 : 0;
  }, [paused, showMarks, isDay]);

  const toggleDaylight = useCallback(() => {
    setIsDay((day) => {
      try {
        localStorage.setItem(DAYLIGHT_KEY, day ? "night" : "day");
      } catch {
        /* 못 적어도 이번 세션에서는 바뀐다 */
      }
      return !day;
    });
  }, []);

  /** 다음 공을 미리 계산해 둔다. 궤적은 프레임마다 풀지 않는다 */
  const nextPitch = useCallback((who: Pitcher): Live => {
    if (queueRef.current.length === 0) {
      queueRef.current = pickSequence(who, 8, rngRef.current);
    }
    const type = queueRef.current.shift()!;
    const plan = planPitch(who, type, rngRef.current);
    const flight = throwPlan(plan);
    return {
      plan,
      flight,
      timeline: makeTimeline(flight.duration),
      axis: axisOf(flight, toThrow(plan).spin.tiltHours),
    };
  }, []);

  const restart = useCallback(
    (who: Pitcher) => {
      queueRef.current = [];
      marksRef.current = [];
      clockRef.current = 0;
      liveRef.current = nextPitch(who);
      setCaption(liveRef.current);
    },
    [nextPitch],
  );

  useEffect(() => {
    restart(pitcher);
  }, [pitcher, restart]);

  /**
   * 캔버스가 붙는 순간 렌더러를 만들고 루프를 건다.
   *
   * useEffect가 아니라 ref 콜백인 이유는, WebGL2가 없는 브라우저를 알리는
   * setFailed가 effect 본문에서 동기로 불리면 안 되기 때문이다. ref 콜백은
   * 커밋 뒤에 불리고 정리 함수도 돌려줄 수 있어서 여기가 제자리다.
   */
  const attachCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    // 지난번에 고른 시간대를 되살린다. 서버 렌더에서는 늘 밤으로 그리고
    // 붙은 뒤에 바꾸므로 하이드레이션이 어긋나지 않는다
    try {
      if (localStorage.getItem(DAYLIGHT_KEY) === "day") setIsDay(true);
    } catch {
      /* 사생활 보호 모드 등 — 기본값 그대로 간다 */
    }

    let renderer: Renderer;
    try {
      renderer = createRenderer(canvas);
    } catch {
      setFailed(true);
      return;
    }
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      // 토글을 눌러도 뚝 끊기지 않게 미끄러뜨린다
      daylightRef.current +=
        (daylightTargetRef.current - daylightRef.current) * (1 - Math.exp(-dt / DAYLIGHT_EASE));
      const daylight = daylightRef.current;

      const live = liveRef.current;
      if (live) {
        if (!pausedRef.current) clockRef.current += dt;

        // 한 공이 끝나면 자국을 남기고 다음 공으로
        if (clockRef.current >= live.timeline.total) {
          marksRef.current = [
            ...marksRef.current,
            {
              key: markKeyRef.current++,
              points: live.flight.samples.map((s) => s.p),
              color: PITCH_COLOR[live.plan.type.kind],
            },
          ].slice(-MAX_TRAILS);
          clockRef.current = 0;
          liveRef.current = nextPitch(live.plan.pitcher);
          setCaption(liveRef.current);
        }
      }

      const current = liveRef.current;
      if (current) {
        const stage = stageAt(clockRef.current, current.timeline);
        if (stage.phase !== phaseRef.current) {
          phaseRef.current = stage.phase;
          setShowCaption(stage.phase === "replay" || stage.phase === "rest");
        }
        const aspect = Math.max(0.1, canvas.clientWidth / Math.max(1, canvas.clientHeight));
        const camera = catcherCamera(aspect);
        const release = releasePoint(current.plan.pitcher);

        let ball = null;
        if (stage.flightTime !== null && stage.ballFade > 0) {
          const [lo, hi, f] = sampleAt(current.flight.samples, stage.flightTime);
          ball = {
            center: {
              x: lerp(lo.p.x, hi.p.x, f),
              y: lerp(lo.p.y, hi.p.y, f),
              z: lerp(lo.p.z, hi.p.z, f),
            },
            toBody: toBodyMatrix(current.axis, lerp(lo.rotation, hi.rotation, f)),
            fade: stage.ballFade,
          };
        }

        const trails: TrailLayer[] = [
          {
            // 스트라이크존. 옅게 깔아 두기만 한다 — 판정하는 페이지가 아니다.
            // 낮에는 밝은 잔디 위라 흰 선이 사라져서, 반대로 어둡게 긋는다
            points: rectangleLoop(-ZONE.halfWidth, ZONE.halfWidth, ZONE.bottom, ZONE.top, 0),
            color: [
              0.85 - 0.78 * daylight,
              0.87 - 0.79 * daylight,
              0.9 - 0.79 * daylight,
            ],
            opacity: 0.22 + 0.16 * daylight,
            width: 0.0035,
          },
        ];

        if (showMarksRef.current) {
          for (const mark of marksRef.current) {
            trails.push({
              points: mark.points,
              color: mark.color,
              opacity: 0.38,
              width: 0.004,
              // 릴리스 쪽을 옅게 두면 «어디서 갈라지는지»가 눈에 먼저 든다
              fade: (progress) => 0.25 + 0.75 * progress,
            });
          }
        }

        if (stage.phase === "replay" && stage.flightTime !== null) {
          const drawn = current.flight.samples.filter((s) => s.t <= stage.flightTime!);
          if (drawn.length > 1) {
            trails.push({
              points: drawn.map((s) => s.p),
              color: PITCH_COLOR[current.plan.type.kind],
              opacity: 0.95,
              width: 0.006,
            });
          }
        }

        renderer.draw({
          camera,
          daylight,
          pitcher: {
            x: release.x,
            z: release.z + 0.25,
            handSign: current.plan.pitcher.hand === "R" ? 1 : -1,
            armPhase: stage.armPhase,
          },
          ball,
          trails,
        });
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
    };
  }, [nextPitch]);

  const skip = useCallback(() => {
    const live = liveRef.current;
    if (live) clockRef.current = live.timeline.total;
  }, []);

  const movement = caption
    ? {
        horizontal: Math.round(caption.flight.movement.horizontal * 100),
        vertical: Math.round(caption.flight.movement.vertical * 100),
      }
    : null;

  if (failed) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0a0c12] p-8 text-center text-sm text-white/70">
        이 브라우저에서는 WebGL2를 쓸 수 없어 공을 그릴 수 없습니다.
      </div>
    );
  }

  return (
    <div
      ref={stageRef}
      // 사이트 레이아웃의 본문 폭 안에 두면 «시야를 다 먹는다»가 성립하지 않는다
      className="fixed inset-0 z-40 overflow-hidden bg-[#0a0c12] select-none"
      style={{ colorScheme: "dark" }}
    >
      <canvas ref={attachCanvas} className="absolute inset-0 h-full w-full" />

      {/* 화면 아무 데나 눌러 다음 공으로 */}
      <button
        type="button"
        onClick={skip}
        aria-label="다음 공"
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <GameHelp help={GAME_HELP["catchers-view"]} className="pointer-events-auto absolute top-3 right-3" />

      {/* 투수 고르기 */}
      <div className="pointer-events-none absolute top-3 left-3 flex max-w-[calc(100%-4.5rem)] flex-wrap gap-1.5">
        {PITCHERS.map((who) => {
          const active = who.id === pitcher.id;
          return (
            <button
              key={who.id}
              type="button"
              onClick={() => setPitcher(who)}
              className={`pointer-events-auto rounded-full px-3 py-1.5 text-[11px] font-medium backdrop-blur transition ${
                active
                  ? "bg-white/90 text-[#12151d]"
                  : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white"
              }`}
            >
              {who.name}
              <span className={active ? "ml-1 text-[#12151d]/50" : "ml-1 text-white/40"}>
                {who.hand === "R" ? "우투" : "좌투"}
              </span>
            </button>
          );
        })}
      </div>

      {/*
        리플레이 자막. 실시간에는 아무것도 안 띄우고, 화면 아래 한가운데도
        비워 둔다 — 거기가 공이 도착하는 미트 자리다.
      */}
      {caption && showCaption && (
        <div className="pointer-events-none absolute bottom-4 left-4 w-[min(22rem,calc(100%-2rem))] sm:bottom-6 sm:left-6">
          <div className="rounded-2xl bg-black/55 p-4 backdrop-blur">
            <div className="flex items-baseline gap-2">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: PITCH_COLOR_CSS[caption.plan.type.kind] }}
              />
              <span className="font-display text-lg font-bold text-white">
                {caption.plan.type.label}
              </span>
              <span className="text-lg font-bold text-white/90 tabular-nums">
                {caption.plan.kmh}
                <span className="ml-0.5 text-xs font-medium text-white/50">km/h</span>
              </span>
              <span className="ml-auto text-[11px] text-white/45 tabular-nums">
                {caption.flight.duration.toFixed(2)}초 · 도착{" "}
                {Math.round(msToKmh(caption.flight.arrivalSpeed))}km/h
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/55 tabular-nums">
              <span>회전 {caption.plan.rpm.toLocaleString()}rpm</span>
              <span>
                무회전 대비 {movement!.vertical >= 0 ? "↑" : "↓"}
                {Math.abs(movement!.vertical)}cm
              </span>
              <span>
                {movement!.horizontal >= 0 ? "→" : "←"}
                {Math.abs(movement!.horizontal)}cm
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-white/35">
              구속과 구종은 공개 기록, 회전수·회전축은 구종별 통상값 추정입니다.
              궤적은 그 값으로 항력과 마그누스를 적분해 그립니다.
            </p>
          </div>
        </div>
      )}

      {/* 조작 */}
      <div className="pointer-events-none absolute right-3 bottom-4 flex flex-col items-end gap-1.5 sm:right-4 sm:bottom-6">
        <button
          type="button"
          onClick={toggleDaylight}
          className="pointer-events-auto rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white/75 backdrop-blur transition hover:bg-black/65 hover:text-white"
        >
          {isDay ? "밤 경기" : "낮 경기"}
        </button>
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          className="pointer-events-auto rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white/75 backdrop-blur transition hover:bg-black/65 hover:text-white"
        >
          {paused ? "이어서" : "멈춤"}
        </button>
        <button
          type="button"
          onClick={() => setShowMarks((v) => !v)}
          className="pointer-events-auto rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white/75 backdrop-blur transition hover:bg-black/65 hover:text-white"
        >
          자국 {showMarks ? "숨기기" : "보기"}
        </button>
        <button
          type="button"
          onClick={() => {
            marksRef.current = [];
          }}
          className="pointer-events-auto rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white/75 backdrop-blur transition hover:bg-black/65 hover:text-white"
        >
          자국 지우기
        </button>
        {fs.isSupported && (
          <button
            type="button"
            onClick={() => (fs.isFullscreen ? fs.exit() : fs.enter())}
            className="pointer-events-auto rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white/75 backdrop-blur transition hover:bg-black/65 hover:text-white"
          >
            {fs.isFullscreen ? "창으로" : "전체화면"}
          </button>
        )}
      </div>
    </div>
  );
}
