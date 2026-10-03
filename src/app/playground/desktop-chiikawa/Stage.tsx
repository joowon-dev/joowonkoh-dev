"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// 앱과 같은 월드·같은 그림. kit/README.md 참고.
import { STEP } from "./kit/game/constants.js";
import {
  createWorld,
  drainEvents,
  resize,
  setMouse,
  setWindows,
  step,
} from "./kit/game/engine.js";
import { segmentAt } from "./kit/game/surfaces.js";
import {
  EFFECT_LIFE,
  drawBubble,
  drawChar,
  drawEffect,
  drawExclaim,
  drawProp,
  drawZzz,
  setScale,
} from "./kit/render/draw.js";
import * as fx from "./kit/render/fx.js";

/**
 * 페이지 맨 위 — **페이지 자체가 바탕화면이다.**
 *
 * 제목·받기 버튼이 들어 있는 것도 창이고, 그 창들 위로 아이들이 튀어나와 선다. 앱이
 * 하는 일을 설명하는 대신 그대로 보여 준다. 창은 제목줄을 끌어 옮기고, 빨간 점으로 닫고,
 * 「창 하나 더」로 연다 — 앱에서 창을 열고 닫을 때와 똑같이 아이들이 나오고 떨어진다.
 *
 * 그림은 캔버스 한 장이 창들 **위에** 덮여서 그린다(클릭은 통과한다). 앱과 같은 순서로
 * 그린다: 뒤 창부터 그 창 자리를 비우고 그 위 아이들을 그린다 — 앞 창이 뒤 아이를 가린다.
 */

type Kind = "hero" | "memo" | "music" | "photo";

/** kit 은 JS 라 타입이 없다. 이 파일이 만지는 만큼만 적는다. */
type Ch = { mode: string; win: number; x: number; y: number };
type World = {
  chars: Ch[];
  windows: { id: number; x: number; y: number; w: number; h: number }[];
  segs: Map<number, number[][]>;
};

type Win = {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  /** 너비는 정해 주고, 높이는 내용에 맞춰 잰다. */
  w: number;
  h: number;
  title: string;
  closable: boolean;
};

const EXTRA: { kind: Kind; title: string; w: number }[] = [
  { kind: "photo", title: "사진", w: 260 },
  { kind: "memo", title: "할 일", w: 240 },
  { kind: "music", title: "노래", w: 280 },
  { kind: "photo", title: "풀밭", w: 230 },
];

const MAX_WINDOWS = 7;

/** 처음 자리. 화면 너비에 따라 둘 중 하나. */
function initialWindows(width: number): Win[] {
  if (width < 760) {
    const w = width - 32;
    return [
      { id: 1, kind: "hero", x: 16, y: 96, w, h: 340, title: "바탕화면 치이카와", closable: false },
      { id: 2, kind: "memo", x: 22, y: 520, w: Math.min(260, w - 30), h: 150, title: "메모", closable: true },
      { id: 3, kind: "music", x: Math.max(16, width - 16 - 230), y: 690, w: 230, h: 120, title: "노래", closable: true },
    ];
  }
  const heroW = Math.min(560, width * 0.52);
  return [
    { id: 1, kind: "hero", x: Math.round(width * 0.06), y: 150, w: heroW, h: 340, title: "바탕화면 치이카와", closable: false },
    { id: 2, kind: "memo", x: Math.round(width * 0.64), y: 96, w: 290, h: 170, title: "메모", closable: true },
    { id: 3, kind: "music", x: Math.round(width * 0.6), y: 360, w: 320, h: 150, title: "노래", closable: true },
  ];
}

export default function Stage({ hero }: { hero: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const winRefs = useRef(new Map<number, HTMLDivElement>());
  const worldRef = useRef<World | null>(null);
  // 앞에서 뒤 순서(앱과 같다).
  const [wins, setWins] = useState<Win[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const nextId = useRef(4);
  const extraIndex = useRef(0);

  // 처음 크기를 재고 창을 놓는다.
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => setSize({ w: box.clientWidth, h: box.clientHeight });
    measure();
    setWins((current) => (current.length ? current : initialWindows(box.clientWidth)));
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  // 창 높이는 내용이 정한다. 잰 값을 상태로 되돌린다.
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      setWins((current) => {
        let changed = false;
        const next = current.map((win) => {
          const el = winRefs.current.get(win.id);
          const h = el ? Math.round(el.offsetHeight) : win.h;
          if (h !== win.h) changed = true;
          return h === win.h ? win : { ...win, h };
        });
        return changed ? next : current;
      });
    });
    winRefs.current.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [wins.length]);

  // 창이 바뀔 때마다 월드에 알린다.
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    setWindows(world, wins.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })));
  }, [wins]);

  // 월드 + 그리기 루프.
  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas || size.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const world: World =
      worldRef.current ??
      (createWorld({ seed: 20261003, w: size.w, h: size.h, maxChars: 6 }) as unknown as World);
    worldRef.current = world;
    resize(world, size.w, size.h);
    setScale(size.w < 760 ? 0.95 : 1.15);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);

    type Effect = { type: string; x: number; y: number; age: number; life: number };
    const effects: Effect[] = [];
    let last = performance.now();
    let acc = 0;
    let raf = 0;
    let running = true;

    const visible = (ch: Ch) =>
      ch.mode === "air" || !!segmentAt(world.segs.get(ch.win), ch.x);

    const frame = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      acc += dt;
      while (acc >= STEP) {
        step(world);
        acc -= STEP;
      }
      for (const e of drainEvents(world)) {
        effects.push({ ...e, age: 0, life: (EFFECT_LIFE as Record<string, number>)[e.type] || 0.4 });
        if (e.type === "pop") fx.burst("pop", e.x, e.y);
      }
      for (const e of effects) e.age += dt;
      fx.emit(world.chars, dt, visible);
      fx.update(dt);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size.w, size.h);
      const ground = new Map<number, Ch[]>();
      for (const ch of world.chars) {
        if (ch.mode !== "ground") continue;
        if (!ground.has(ch.win)) ground.set(ch.win, []);
        ground.get(ch.win)!.push(ch);
      }
      for (let i = world.windows.length - 1; i >= 0; i--) {
        const win = world.windows[i];
        ctx.clearRect(win.x, win.y, win.w, win.h);
        const list = ground.get(win.id);
        if (!list) continue;
        for (const ch of list) {
          drawChar(ctx, ch);
          drawProp(ctx, ch);
        }
        for (const ch of list) {
          drawZzz(ctx, ch);
          drawExclaim(ctx, ch);
          drawBubble(ctx, ch);
        }
      }
      for (const ch of world.chars) {
        if (ch.mode !== "air") continue;
        drawChar(ctx, ch);
        drawExclaim(ctx, ch);
      }
      fx.draw(ctx);
      for (let i = effects.length - 1; i >= 0; i--) {
        if (effects[i].age >= effects[i].life) effects.splice(i, 1);
        else drawEffect(ctx, effects[i]);
      }
      if (running) raf = requestAnimationFrame(frame);
    };

    // 화면 밖으로 스크롤하면 쉰다.
    const io = new IntersectionObserver(([entry]) => {
      const on = entry.isIntersecting;
      if (on && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!on) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(box);
    raf = requestAnimationFrame(frame);

    const move = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      setMouse(world, { x: e.clientX - r.left, y: e.clientY - r.top });
    };
    const leave = () => setMouse(world, null);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerleave", leave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerleave", leave);
    };
  }, [size.w, size.h]);

  // 처음 창 목록은 루프가 생긴 뒤에 넣어야 한다.
  useEffect(() => {
    if (worldRef.current && wins.length) {
      setWindows(worldRef.current, wins.map(({ id, x, y, w, h }) => ({ id, x, y, w, h })));
    }
  }, [size.w, wins]);

  const toFront = useCallback((id: number) => {
    setWins((current) => {
      const target = current.find((w) => w.id === id);
      if (!target || current[0].id === id) return current;
      return [target, ...current.filter((w) => w.id !== id)];
    });
  }, []);

  const startDrag = (id: number) => (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    toFront(id);
    const box = boxRef.current;
    if (!box) return;
    let px = e.clientX;
    let py = e.clientY;
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - px;
      const dy = ev.clientY - py;
      px = ev.clientX;
      py = ev.clientY;
      setWins((current) =>
        current.map((w) =>
          w.id === id
            ? {
                ...w,
                x: Math.max(-w.w + 80, Math.min(box.clientWidth - 80, w.x + dx)),
                y: Math.max(40, Math.min(box.clientHeight - 40, w.y + dy)),
              }
            : w,
        ),
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const close = (id: number) => setWins((current) => current.filter((w) => w.id !== id));

  const open = () => {
    const box = boxRef.current;
    if (!box || wins.length >= MAX_WINDOWS) return;
    const pick = EXTRA[extraIndex.current % EXTRA.length];
    extraIndex.current += 1;
    const n = nextId.current++;
    const w = Math.min(pick.w, box.clientWidth - 40);
    // 겹치게 두되 매번 조금씩 다른 자리에.
    const x = Math.round(((n * 0.37) % 1) * Math.max(1, box.clientWidth - w - 32)) + 16;
    const y = Math.round(140 + ((n * 0.61) % 1) * Math.max(1, box.clientHeight - 360));
    setWins((current) => [{ id: n, kind: pick.kind, x, y, w, h: 140, title: pick.title, closable: true }, ...current]);
  };

  return (
    <div
      ref={boxRef}
      className="ck-desk relative h-[860px] w-full touch-pan-y overflow-hidden rounded-[36px] md:h-[620px]"
    >
      {/* 창들. 배열 앞쪽이 앞 창이다. */}
      {wins.map((win, index) => (
        <div
          key={win.id}
          ref={(el) => {
            if (el) winRefs.current.set(win.id, el);
            else winRefs.current.delete(win.id);
          }}
          onPointerDown={() => toFront(win.id)}
          className="absolute overflow-hidden rounded-[14px] bg-white shadow-[0_18px_40px_-12px_rgba(75,58,53,0.35),0_0_0_1px_rgba(75,58,53,0.08)]"
          style={{ left: win.x, top: win.y, width: win.w, zIndex: 100 - index }}
        >
          <div
            onPointerDown={startDrag(win.id)}
            className="flex h-8 cursor-grab touch-none select-none items-center gap-1.5 border-b border-[#efe9ef] bg-[#f6f3f7] px-3 active:cursor-grabbing"
          >
            {win.closable ? (
              <button
                type="button"
                aria-label={`${win.title} 창 닫기`}
                onClick={() => close(win.id)}
                className="h-3 w-3 rounded-full bg-[#ff5f57] outline-offset-2 hover:brightness-90"
              />
            ) : (
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]/40" />
            )}
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-2 truncate text-[12px] text-[#8a7b78]">{win.title}</span>
          </div>
          <WindowBody kind={win.kind}>{hero}</WindowBody>
        </div>
      ))}

      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[200] h-full w-full"
      />

      <button
        type="button"
        onClick={open}
        disabled={wins.length >= MAX_WINDOWS}
        className="absolute bottom-5 right-5 z-[300] rounded-full bg-white/90 px-4 py-2 text-[14px] font-semibold text-[#4b3a35] shadow-[0_6px_18px_-6px_rgba(75,58,53,0.4)] backdrop-blur transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8fab] disabled:opacity-40"
      >
        창 하나 더 열기
      </button>
      <p className="pointer-events-none absolute bottom-6 left-6 z-[300] hidden text-[13px] text-[#4b3a35]/70 md:block">
        제목줄을 끌어 보세요. 빨간 점을 누르면 창이 닫혀요.
      </p>
    </div>
  );
}

/** 창 안쪽. 맨 앞 창(hero)만 진짜 내용이고 나머지는 분위기. */
function WindowBody({ kind, children }: { kind: Kind; children: ReactNode }) {
  if (kind === "hero") return <div className="p-6 md:p-8">{children}</div>;
  if (kind === "memo") {
    return (
      <div className="space-y-2 px-4 py-4 text-[13px] leading-relaxed text-[#6b5b57]">
        <p>☐ 풀 뽑기 검정 공부하기</p>
        <p>☑ 토벌 다녀오기</p>
        <p>☐ 라멘 먹으러 가기</p>
      </div>
    );
  }
  if (kind === "music") {
    return (
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-[#ffd1dc] to-[#cfe8ff]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#4b3a35]">어떻게든 되겠지</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f1ecef]">
            <div className="h-full w-2/5 rounded-full bg-[#ff8fab]" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-3">
      <div className="h-24 rounded-lg bg-gradient-to-b from-[#cfe8ff] via-[#e6f4ff] to-[#bfe6a9]" />
    </div>
  );
}
