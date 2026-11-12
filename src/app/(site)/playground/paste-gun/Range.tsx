"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useDetectedPlatform } from "./Download";
// 앱과 같은 엔진·같은 그림. kit/README.md 참고.
import { FIRE, GUNS, GUN_NAMES } from "./kit/game/constants.js";
import { createEngine } from "./kit/game/engine.js";
import { createGunView } from "./kit/render/draw.js";
import { createFx } from "./kit/render/fx.js";
import { LATEST } from "./releases";

/**
 * 페이지 맨 위 — **사격장.** 앱이 하는 일을 설명하는 대신 여기서 쏘게 한다.
 *
 * 이 페이지에서 ⌘V(Ctrl+V)를 누르면 앱에서와 똑같이 총이 글자 커서로 날아와 한 글자씩 쏜다.
 * 엔진도 그림도 앱의 것(kit/)이라 총마다 빠르기가 다르고, 다 쏜 탄창에서 다시 당기면
 * 앱과 같은 규칙으로 다시 나간다. 페이지의 글을 진짜로 복사해도 총알이 된다.
 */

type Gun = "pistol" | "machinegun" | "shotgun" | "sniper";
type Shot = { type: string; text: string; after?: string | null };
type Hud = { gun: Gun; left: number; total: number };

/** 눌러서 장전하는 글. 실제 사람의 것이 아니다. */
const CLIPS = ["안녕하세요, 붙여넣기 총입니다.", "paste@example.com", "서울시 방아쇠구 총알로 12", "탕탕탕 🔫"];

/** 문서가 이만큼 차면 다음 발 전에 비운다 — 창이 한없이 길어지지 않게. */
const MAX_LINES = 4;

export default function Range() {
  const platform = useDetectedPlatform();
  const pasteKey = platform === "windows" ? "Ctrl+V" : "⌘V";

  const stageRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const gunRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const keyRef = useRef<HTMLButtonElement>(null);
  /** 엔진을 만지는 손잡이. 효과 안에서 만들고 버튼들이 쓴다. */
  const api = useRef<{ fire: () => void; load: (text: string) => void; setGun: (gun: Gun) => void } | null>(null);

  const [hud, setHud] = useState<Hud>({ gun: "pistol", left: 1, total: 1 });

  useEffect(() => {
    const stage = stageRef.current;
    const doc = docRef.current;
    const caret = caretRef.current;
    if (!stage || !doc || !caret || !fxRef.current || !gunRef.current) return;

    const engine = createEngine(null, "mac");
    const fx = createFx(fxRef.current);
    const view = createGunView(gunRef.current);
    engine.copied(CLIPS[0]);

    let text = "";
    const timers = new Set<number>();
    const write = (next: string) => {
      text = next;
      doc.textContent = text;
    };

    function onShot(shot: Shot) {
      const gun = engine.state.gun as Gun;
      const box = stage!.getBoundingClientRect();
      const at = caret!.getBoundingClientRect();
      // 다음 발이 글자가 닿기 전에 나오는 총(기관총)은 기다리지 않는다. 앱의 app.js 와 같은 판단이다.
      const rate = (FIRE as Record<string, { interval: number } | undefined>)[gun];
      const waits = !rate || rate.interval > fx.lead() + 0.01;
      const lead = waits ? fx.lead() : 0;
      fx.shoot(gun, at.left - box.left, at.top - box.top + at.height / 2, shot.text, !waits);
      view.fire(gun === "shotgun" ? 3 : 1);

      const piece = shot.text + (shot.after === "tab" ? "\t" : shot.after === "enter" ? "\n" : "");
      if (lead === 0) return write(text + piece);
      // 날아간 글자가 꽂히는 순간에 찍는다.
      const id = window.setTimeout(() => {
        timers.delete(id);
        write(text + piece);
      }, lead * 1000);
      timers.add(id);
    }

    function fire() {
      if (!engine.state.firing) {
        // 실제로는 쏠 때마다 커서를 옮겨 놓는다. 여기서는 줄을 바꿔 준다.
        if (text.split("\n").length >= MAX_LINES) write("");
        else if (text && !text.endsWith("\n")) write(`${text}\n`);
      }
      engine.trigger(false);
    }

    api.current = {
      fire,
      load: (clip) => engine.copied(clip),
      setGun: (gun) => {
        engine.setGun(gun);
        view.invalidate();
      },
    };

    /** 화면에 안 보일 때는 붙여넣기 키를 가로채지 않는다. */
    let onStage = true;
    const watcher = new IntersectionObserver(([entry]) => {
      onStage = entry.isIntersecting;
    });
    watcher.observe(stage);

    const onKey = (event: KeyboardEvent) => {
      if (!onStage || event.code !== "KeyV" || !(event.metaKey || event.ctrlKey) || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      event.preventDefault();
      if (event.repeat) return;
      const key = keyRef.current;
      if (key) {
        key.dataset.down = "true";
        window.setTimeout(() => delete key.dataset.down, 110);
      }
      fire();
    };
    // 이 페이지의 글을 진짜로 복사해도 총알이 된다 — 앱이 하는 일 그대로.
    const onCopy = () => {
      const picked = window.getSelection()?.toString().trim();
      if (picked) engine.copied(picked.slice(0, 200));
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("copy", onCopy);

    let last = performance.now();
    let seen = "";
    let raf = requestAnimationFrame(function frame(now) {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      engine.step(dt);
      for (const effect of engine.drain() as Shot[]) if (effect.type === "shot") onShot(effect);
      view.update(dt);
      view.draw(engine.state.gun);
      fx.update(dt);
      fx.draw();

      const next: Hud = {
        gun: engine.state.gun as Gun,
        left: engine.remaining(),
        total: engine.magazine().rounds.length,
      };
      const stamp = `${next.gun}|${next.left}|${next.total}`;
      if (stamp !== seen) {
        seen = stamp;
        setHud(next);
      }
      raf = requestAnimationFrame(frame);
    });

    return () => {
      cancelAnimationFrame(raf);
      watcher.disconnect();
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("copy", onCopy);
      for (const id of timers) window.clearTimeout(id);
      api.current = null;
    };
  }, []);

  const fire = useCallback(() => api.current?.fire(), []);

  return (
    <div ref={stageRef} className="pg-range relative overflow-hidden rounded-[28px] text-[#e8ecf1]">
      <div className="grid gap-8 px-5 pt-8 md:px-10 md:pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
        <div>
          <h1 className="pg-display text-[46px] leading-[1.02] md:text-[64px]">붙여넣기 총</h1>
          <p className="mt-4 max-w-[26ch] text-[17px] leading-relaxed text-[#e8ecf1]/75 break-keep md:text-[18px]">
            복사한 글자가 총알이 돼요. {pasteKey}를 누르면 총이 커서로 날아와 한 글자씩 쏴서 붙여넣어요.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {platform === "windows" ? (
              <>
                <DownloadLink primary href="#windows" label="윈도우에서 받기" />
                <DownloadLink href={LATEST.mac.href} download label="맥에서 받기" />
              </>
            ) : (
              <>
                <DownloadLink primary href={LATEST.mac.href} download label="맥에서 받기" />
                <DownloadLink href="#windows" label="윈도우에서 받기" />
              </>
            )}
          </div>
          <p className="mt-4 text-[13px] text-[#e8ecf1]/50">
            무료. 맥은 애플 공증을 받았어요. <span className="pg-num">{LATEST.version}</span>
          </p>
        </div>

        {/* 과녁 — 글을 받는 문서 창. */}
        <div className="self-start rounded-[14px] bg-[#f6f7f9] text-[#1a212c] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-1.5 border-b border-[#1a212c]/10 px-3.5 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[12.5px] text-[#1a212c]/55">받는 문서</span>
          </div>
          <div
            className="min-h-[148px] whitespace-pre-wrap px-4 py-3.5 text-[16px] leading-[1.7] [overflow-wrap:anywhere] [tab-size:4]"
            aria-live="off"
          >
            <span ref={docRef} />
            <span ref={caretRef} className="pg-caret" />
          </div>
        </div>
      </div>

      {/* 조작대 — 앱의 HUD 와 같은 것을 보여 준다: 든 총, 남은 발, 탄창. */}
      <div className="mt-8 grid items-end gap-x-8 gap-y-6 border-t border-white/8 px-5 py-6 md:px-10 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="flex items-center gap-4">
          <canvas ref={gunRef} width={172} height={76} className="h-[76px] w-[172px]" aria-hidden />
          <div>
            <p className="pg-num text-[40px] leading-none">
              {hud.left}
              <span className="text-[20px] text-[#e8ecf1]/45"> / {hud.total}</span>
            </p>
            <div className="mt-2 flex max-w-[170px] flex-wrap gap-[3px]" aria-hidden>
              {Array.from({ length: hud.total }, (_, i) => (
                <span key={i} className="pg-round" data-spent={i < hud.total - hud.left} />
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-3.5">
          <div role="radiogroup" aria-label="총" className="inline-flex flex-wrap gap-1 rounded-[12px] bg-black/25 p-1">
            {(GUNS as Gun[]).map((gun) => (
              <button
                key={gun}
                type="button"
                role="radio"
                aria-checked={hud.gun === gun}
                onClick={() => api.current?.setGun(gun)}
                className={`rounded-[9px] px-3.5 py-1.5 text-[14px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd682] ${
                  hud.gun === gun ? "bg-[#d8a23c] text-[#10151d]" : "text-[#e8ecf1]/65 hover:text-[#e8ecf1]"
                }`}
              >
                {(GUN_NAMES as Record<Gun, string>)[gun]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-[#e8ecf1]/50">복사하기</span>
            {CLIPS.map((clip) => (
              <button
                key={clip}
                type="button"
                onClick={() => api.current?.load(clip)}
                className="max-w-full truncate rounded-full bg-white/8 px-3 py-1.5 text-[13px] text-[#e8ecf1]/85 transition hover:bg-white/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd682]"
              >
                {clip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 lg:flex-col lg:items-end lg:gap-2">
          <button
            ref={keyRef}
            type="button"
            onClick={fire}
            className="pg-key pg-num px-6 py-3 text-[24px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd682]"
          >
            {pasteKey}
          </button>
          <p className="text-[12.5px] text-[#e8ecf1]/50 break-keep">누르거나, 키보드로 진짜 {pasteKey}</p>
        </div>
      </div>

      {/* 총과 날아가는 글자는 전부 이 한 장에 그린다. 클릭은 통과한다. */}
      <canvas ref={fxRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden />
    </div>
  );
}

function DownloadLink({ href, label, primary, download }: { href: string; label: string; primary?: boolean; download?: boolean }) {
  return (
    <a
      href={href}
      download={download}
      className={`pg-display rounded-[12px] px-5 py-2.5 text-[18px] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd682] ${
        primary ? "bg-[#d8a23c] text-[#10151d] shadow-[0_10px_24px_-10px_rgba(216,162,60,0.9)]" : "bg-white/10 text-[#e8ecf1]"
      }`}
    >
      {label}
    </a>
  );
}
