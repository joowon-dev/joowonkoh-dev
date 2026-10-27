"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// 앱과 같은 엔진·같은 그림. kit/README.md 참고.
import { DT, RIPPLE_REACH, WAKE_LIFE } from "./kit/game/constants.js";
import {
  chooseSpecies,
  createEngine,
  feedAt,
  feedTyped,
  pinStage,
  setBounds,
  snapshot,
  step,
} from "./kit/game/engine.js";
import { SPECIES, SPECIES_ORDER } from "./kit/game/species.js";
import { draw } from "./kit/render/draw.js";
import SharkIcon from "./SharkIcon";

/**
 * 페이지 맨 위 — **페이지 자체가 바탕화면이다**(치이카와 페이지와 같은 생각).
 *
 * 앱이 하는 일을 설명하는 대신 그대로 해 본다. 아무 데나 누르면 그 자리에 밥이 떨어지고,
 * 상어가 헤엄쳐 와서 문다. **창 위를 눌러도 된다** — 앱에서 창이 클릭을 삼키지 않는 것과 같다.
 * 타자를 쳐도 작은 밥이 떨어진다. 오른쪽의 어두운 창은 앱의 「도감」 창이고, 거기서
 * 누른 것만 밥이 안 된다(앱과 같은 규칙).
 *
 * 엔진은 앱의 것 그대로다. 데모는 여섯 종을 다 키워 둔 상태로 시작해서, 도감에서 종과
 * 단계를 바로 바꿔 볼 수 있다. 여기서 준 밥은 어디에도 올라가지 않는다.
 */

/** kit 은 JS 라 타입이 없다(엔진은 스텝마다 모양이 조금씩 다른 객체를 돌려준다). 이 파일이 만지는 만큼만 적는다. */
type Engine = { swimmer: { x: number; y: number; heading: number }; justAte: boolean };
type Wake = { x: number; y: number; heading: number; age: number };
type Ripple = { x: number; y: number; age: number; duration: number; maxRadius: number };

/** 데모는 다 키운 상어로 시작한다 — 첫 화면의 아기상어는 너무 작아서 안 보인다. */
const FULL = Object.fromEntries(SPECIES_ORDER.map((key: string) => [key, 18000]));

export default function Stage({ hero }: { hero: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [species, setSpecies] = useState("white");
  const [stage, setStage] = useState(6);
  const [eaten, setEaten] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!box || !canvas || !ctx) return;

    let view = { width: 0, height: 0, scale: 1 };
    let engine: Engine =
      engineRef.current ??
      (createEngine({
        seed: (Date.now() & 0xffff) | 1,
        now: Date.now(),
        lastFedAt: Date.now(),
        total: 200000,
        grown: FULL,
      }) as unknown as Engine);
    engineRef.current = engine;

    // 레티나 배율은 여기서 한 번만 건다 — draw() 는 setTransform 을 부르지 않는다(앱과 같다).
    const resize = () => {
      const width = box.clientWidth;
      const height = box.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scale = Math.min(width, height);
      view = { width, height, scale };
      engine = setBounds(engine, { w: width / scale, h: height / scale }) as unknown as Engine;
      engineRef.current = engine;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    let wake: Wake[] = [];
    let ripples: Ripple[] = [];
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    let running = true;

    // 고정 타임스텝 — 앱과 같은 1/60.
    const frame = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      acc += dt;
      engine = engineRef.current ?? engine;
      const wall = Date.now();
      while (acc >= DT) {
        engine = step(engine, wall, DT) as unknown as Engine;
        acc -= DT;
        wake.push({ x: engine.swimmer.x, y: engine.swimmer.y, heading: engine.swimmer.heading, age: 0 });
        if (engine.justAte) {
          ripples.push({
            x: engine.swimmer.x,
            y: engine.swimmer.y,
            age: 0,
            duration: 0.9,
            maxRadius: snapshot(engine).length * RIPPLE_REACH,
          });
          setEaten((n) => n + 1);
        }
      }
      engineRef.current = engine;
      wake = wake.map((w) => ({ ...w, age: w.age + dt })).filter((w) => w.age < WAKE_LIFE);
      ripples = ripples.map((r) => ({ ...r, age: r.age + dt })).filter((r) => r.age < r.duration);
      draw(ctx, view, snapshot(engine), { wake, ripples });
      if (running) raf = requestAnimationFrame(frame);
    };

    // 화면 밖으로 스크롤하면 쉰다.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!entry.isIntersecting) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(box);
    raf = requestAnimationFrame(frame);

    // **창 위를 눌러도 밥이 된다.** 막지 않으니 창 안의 버튼도 그대로 눌린다.
    // 도감 창(data-panel) 위에서 누른 것만 뺀다 — 앱과 같은 규칙이다.
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-panel]")) return;
      const r = box.getBoundingClientRect();
      const current = engineRef.current;
      if (!current) return;
      engineRef.current = feedAt(
        current,
        (e.clientX - r.left) / view.scale,
        (e.clientY - r.top) / view.scale,
        "big",
      ) as unknown as Engine;
    };
    box.addEventListener("pointerdown", down);

    // 타자는 데모가 화면에 보일 때만 받는다. 어떤 키였는지는 안 본다(앱처럼 세기만 한다).
    const key = (e: KeyboardEvent) => {
      if (!running || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const current = engineRef.current;
      if (current) engineRef.current = feedTyped(current) as unknown as Engine;
    };
    window.addEventListener("keydown", key);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      box.removeEventListener("pointerdown", down);
      window.removeEventListener("keydown", key);
    };
  }, []);

  const choose = (key: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    // 종을 바꾸면 앱처럼 단계 못 박기가 풀린다. 고른 단계는 다시 건다.
    engineRef.current = pinStage(chooseSpecies(engine, key), stage) as unknown as Engine;
    setSpecies(key);
  };

  const pick = (next: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engineRef.current = pinStage(engine, next) as unknown as Engine;
    setStage(next);
  };

  return (
    <div
      ref={boxRef}
      className="sk-desk relative h-[940px] w-full touch-pan-y select-none overflow-hidden rounded-[36px] shadow-[inset_0_0_0_1px_rgba(15,42,58,0.06)] md:h-[640px]"
    >
      <div aria-hidden className="sk-caustics pointer-events-none absolute inset-0" />

      {/* 맨 앞 창 — 이름과 받기. */}
      <Window
        title="바탕화면 상어"
        className="left-4 right-4 top-6 md:left-[6%] md:right-auto md:top-16 md:w-[min(500px,48%)]"
      >
        <div className="p-6 md:p-8">{hero}</div>
      </Window>

      {/* 일하는 척 창. 여기를 눌러도 밥이 된다는 것을 보여 주려고 둔다. */}
      <Window
        title="메모 — 오늘 할 일"
        className="bottom-[300px] left-6 w-[230px] md:bottom-14 md:left-[14%] md:w-[250px]"
      >
        <div className="space-y-1.5 px-4 py-3.5 text-[13px] leading-relaxed text-[#3d5a6a]">
          <p>☑ 주간 보고서 보내기</p>
          <p>☐ 회의록 정리</p>
          <p>☐ 상어 밥 주기 (저절로 됨)</p>
        </div>
      </Window>

      {/* 앱의 도감 창. 앱의 패널과 같은 남색이고, 여기서 누른 것은 밥이 안 된다. */}
      <div
        data-panel
        className="absolute bottom-5 left-4 right-4 z-20 rounded-[18px] border border-[rgba(120,200,235,0.22)] bg-[rgba(6,20,30,0.9)] p-4 text-[rgba(230,246,252,0.95)] shadow-[0_24px_60px_-10px_rgba(0,20,35,0.5)] backdrop-blur-xl md:bottom-auto md:left-auto md:right-[5%] md:top-16 md:w-[300px] md:p-5"
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="sk-display text-[19px]">도감</p>
          <p className="text-[11.5px] text-[rgba(230,246,252,0.55)]">눌러서 데려오기</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {SPECIES_ORDER.map((key: string) => (
            <button
              key={key}
              type="button"
              onClick={() => choose(key)}
              aria-pressed={species === key}
              className={`flex flex-col items-center rounded-xl px-1 pb-1.5 pt-1 transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7fd3f0] ${
                species === key
                  ? "bg-[rgba(90,190,230,0.22)] shadow-[inset_0_0_0_1px_rgba(127,211,240,0.6)]"
                  : "hover:bg-white/5"
              }`}
            >
              <SharkIcon species={key} width={76} height={36} light />
              <span className="text-[11.5px] leading-tight">
                {(SPECIES as Record<string, { name: string }>)[key].name}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-[11.5px] text-[rgba(230,246,252,0.55)]">단계 — 클수록 크고 진해져요</p>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => pick(n)}
              aria-pressed={stage === n}
              className={`h-8 flex-1 rounded-lg text-[13px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7fd3f0] ${
                stage === n ? "bg-[#7fd3f0] text-[#06141e]" : "bg-white/8 text-[rgba(230,246,252,0.8)] hover:bg-white/15"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      />

      <p className="pointer-events-none absolute bottom-[262px] left-0 right-0 z-40 px-6 text-center text-[13px] text-[#0f2a3a]/65 md:bottom-5 md:left-auto md:right-[5%] md:w-[300px] md:px-0 md:text-right">
        {eaten > 0
          ? `방금 ${eaten}개 먹었어요. 실제 앱에서는 이게 일하는 내내 일어나요.`
          : "아무 데나 눌러 보세요. 창 위도 돼요. 타자를 쳐도 돼요."}
      </p>
    </div>
  );
}

/** 창틀. 끌어 옮기지는 않는다 — 이 데모의 주인공은 창이 아니라 상어다. */
function Window({
  title,
  className,
  children,
}: {
  title: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute z-10 overflow-hidden rounded-[14px] bg-white shadow-[0_18px_40px_-14px_rgba(15,42,58,0.35),0_0_0_1px_rgba(15,42,58,0.07)] ${className}`}
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-[#e6eef2] bg-[#f3f7f9] px-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate text-[12px] text-[#6d8796]">{title}</span>
      </div>
      {children}
    </div>
  );
}
