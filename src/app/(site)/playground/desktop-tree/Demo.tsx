"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// 앱과 같은 엔진·같은 그림. kit/README.md 참고.
import { createEngine, parseKey } from "./kit/game/engine.js";
import { BOARD, mulberry32 } from "./kit/game/tree.js";
import { createView } from "./kit/render/view.js";

/**
 * 페이지 맨 위 — **작은 바탕화면.** 앱이 하는 일을 설명하는 대신 여기서 눌러 보게 한다.
 *
 * 가짜 창이 몇 개 떠 있고, 창마다 방울 셋이 트리에 달려 있다. 트리의 빨강을 누르면 그 창이 닫히고
 * 방울이 떨어진다. 노랑은 접고, 초록은 키운다. 창의 단추를 직접 눌러도 트리가 따라온다.
 * 엔진도 그림도 앱의 것(kit/)이라 방울이 달리는 자리와 떨어지는 길이 앱과 같다.
 */

type Kind = "red" | "yellow" | "green";
type Win = { id: number; app: string; slot: number; min: boolean; big: boolean };
type Hit = { key: string; x: number; y: number; r: number };

const APPS = ["Safari", "메모", "Finder", "Xcode", "카카오톡", "Music", "미리보기", "터미널"];

/** 창이 놓이는 자리(바탕화면에 대한 %). 겹쳐 쌓인다. */
const SLOTS = [
  { left: 4, top: 8, width: 44, height: 44 },
  { left: 22, top: 30, width: 40, height: 40 },
  { left: 8, top: 52, width: 36, height: 36 },
  { left: 36, top: 12, width: 34, height: 34 },
  { left: 30, top: 56, width: 34, height: 32 },
  { left: 14, top: 22, width: 30, height: 30 },
];
const MAX_WINDOWS = 6;

export default function Demo() {
  const deskRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  /** 엔진을 만지는 손잡이. 효과 안에서 만들고 버튼과 창의 단추가 쓴다. */
  const api = useRef<{ sync: (wins: Win[]) => void; press: (id: number, kind: Kind) => void } | null>(null);

  const [wins, setWins] = useState<Win[]>([]);
  const [scale, setScale] = useState(1);

  const open = useCallback(() => {
    setWins((now) => {
      if (now.length >= MAX_WINDOWS) return now;
      const id = nextId.current++;
      const used = new Set(now.map((w) => w.slot));
      const slot = SLOTS.findIndex((_, i) => !used.has(i));
      return [...now, { id, app: APPS[(id - 1) % APPS.length], slot: Math.max(0, slot), min: false, big: false }];
    });
  }, []);

  /** 방울이든 창의 단추든 같은 일을 한다. 앱에서처럼, 눌린 것을 먼저 보여 주고 조금 뒤에 창이 바뀐다. */
  const act = useCallback((id: number, kind: Kind) => {
    api.current?.press(id, kind);
    window.setTimeout(() => {
      setWins((now) =>
        kind === "red"
          ? now.filter((w) => w.id !== id)
          : now.map((w) =>
              w.id !== id
                ? w
                : kind === "yellow"
                  ? { ...w, min: !w.min }
                  : { ...w, big: !w.big, min: false },
            ),
      );
    }, 200);
  }, []);

  // 트리와 엔진. 한 번만 만든다.
  useEffect(() => {
    const root = treeRef.current;
    if (!root) return;
    const seed = (Date.now() >>> 0) || 1;
    const engine = createEngine({ rng: mulberry32(seed) });
    const view = createView(root, { rng: mulberry32(seed ^ 0x9e3779b9) });
    const flush = () => {
      for (const event of engine.drain()) view.apply(event);
    };
    const under = (e: MouseEvent): string | null => {
      const box = root.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      const hit = (view.hits() as Hit[]).find((h) => Math.hypot(h.x - x, h.y - y) <= h.r);
      return hit ? hit.key : null;
    };
    const onMove = (e: MouseEvent) => {
      const key = under(e);
      root.dataset.over = key ? "true" : "false";
      engine.hover(key);
      flush();
    };
    const onLeave = () => {
      root.dataset.over = "false";
      engine.hover(null);
      flush();
    };
    const onClick = (e: MouseEvent) => {
      const hit = parseKey(under(e));
      if (hit) act(hit.id, hit.kind as Kind);
    };
    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", onLeave);
    root.addEventListener("click", onClick);

    api.current = {
      sync: (list) => {
        engine.sync(list.map((w) => ({ id: w.id, app: w.app, pid: 0, min: w.min, big: w.big })));
        flush();
      },
      press: (id, kind) => {
        engine.press(`${id}:${kind}`, "ok");
        flush();
      },
    };
    // 바탕화면의 폭에 맞춰 트리를 줄인다. 좁은 화면에서도 창이 보일 자리를 남긴다.
    const fit = () => {
      const width = deskRef.current?.clientWidth ?? 800;
      const next = Math.max(0.5, Math.min(1, width / 760));
      view.setLayout({ x: 0, y: 0, scale: next });
      setScale(next);
    };
    fit();
    window.addEventListener("resize", fit);
    for (let i = 0; i < 4; i++) open();

    return () => {
      window.removeEventListener("resize", fit);
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onLeave);
      root.removeEventListener("click", onClick);
      api.current = null;
      root.replaceChildren();
    };
  }, [act, open]);

  // 창이 바뀌면 트리에 알린다 — 앱에서 셸이 창의 목록을 보내는 것과 같다.
  useEffect(() => {
    api.current?.sync(wins);
  }, [wins]);

  return (
    <div>
      <div ref={deskRef} className="dt-desk relative h-[560px] overflow-hidden rounded-[28px] md:h-[620px]">
        {wins.map((w) => {
          const at = SLOTS[w.slot];
          const style = w.big
            ? { left: "1.5%", top: "2%", width: "97%", height: "96%", zIndex: 10 }
            : { left: `${at.left}%`, top: `${at.top}%`, width: `${at.width}%`, height: `${at.height}%`, zIndex: w.slot + 1 };
          return (
            <div key={w.id} className="dt-win" data-min={w.min} style={style}>
              <div className="dt-win-bar">
                {(["red", "yellow", "green"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    className="dt-dot"
                    data-kind={kind}
                    aria-label={`${w.app} 창 ${kind === "red" ? "닫기" : kind === "yellow" ? "접기" : "키우기"}`}
                    onClick={() => act(w.id, kind)}
                  />
                ))}
                <span className="dt-win-name">{w.app}</span>
              </div>
              <div className="space-y-2.5 p-4">
                <div className="dt-line w-[70%]" />
                <div className="dt-line w-[92%]" />
                <div className="dt-line w-[55%]" />
                <div className="dt-line w-[80%]" />
              </div>
            </div>
          );
        })}
        <div
          ref={treeRef}
          className="dt-tree"
          style={{ right: 12, bottom: 0, width: BOARD.w * scale, height: BOARD.h * scale }}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] leading-relaxed text-[#16203a]/65 break-keep">
          트리의 방울을 눌러 보세요. 빨강은 닫기, 노랑은 접기, 초록은 키우기예요.
        </p>
        <button
          type="button"
          onClick={open}
          disabled={wins.length >= MAX_WINDOWS}
          className="rounded-[10px] bg-[#141d33] px-4 py-2 text-[14px] font-semibold text-[#ffe9a8] transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2ab3f]"
        >
          새 창 띄우기
        </button>
      </div>
    </div>
  );
}
