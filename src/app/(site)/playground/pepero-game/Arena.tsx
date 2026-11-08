"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { BITE_STEP, camZoom, visibleGap } from "./motion";
import {
  cm,
  freshInput,
  type Input,
  type Outcome,
  PRESS_WINDOW,
  type SideKey,
  STICK_MM,
  type View,
  viewAt,
} from "./rules";
import type { Crumb, Expr, Side } from "./Scene3D";
import type { Sound } from "./sound";

/** 손가락이 버튼 밖으로 미끄러져도 뗀 걸로 치지 않게 붙잡는다 */
const capture = (e: React.PointerEvent<HTMLElement>) => {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    /* 붙잡기가 안 되는 환경이면 그냥 둔다 */
  }
};

/** 3D 무대는 브라우저에서만 — three.js 를 처음 화면에 안 싣고 따로 받는다. */
export const Stage = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => <div className="pp-3d-loading w-full" style={{ aspectRatio: "500 / 290" }} aria-hidden />,
});

/** 끝나고 결과 카드가 뜨기까지(초) */
const AFTER = 1.9;
/** 깨물거나 부딪힌 뒤 둘이 튕겨 나가는 거리(mm) */
const RECOIL = 16;
/** 안 부딪히고 끝나면 막대가 똑 부러지며 둘이 물러나는 거리(mm) */
const PULL_BACK = 12;
/** 이보다 가까우면 조마조마 연출 */
const TENSE_GAP = 40;
/** 입력을 상대에게 알리는 간격(ms) — 누르고 뗄 때는 바로 보낸다 */
const BEAT_MS = 140;
/** 「멈춤!」 말풍선을 띄워 두는 시간(초) */
const STOP_BUBBLE = 0.9;

let crumbSeq = 0;
interface LiveCrumb extends Crumb {
  born: number;
}

interface Frame {
  /** 「냠!」부터 흐른 시간(초). 카운트다운 중엔 음수 */
  now: number;
  view: View;
  /** 끝난 순간의 now */
  endedAt: number | null;
  crumbs: LiveCrumb[];
  stopped: Record<SideKey, number | null>;
  /** 내 입력 상태(그리기용 사본) */
  mine: { pressed: boolean; released: boolean };
}

const EMPTY_VIEW: View = { t: 0, left: 0, right: 0, outcome: null, pending: false };

export interface ArenaProps {
  me: SideKey;
  names: Record<SideKey, string>;
  /** 「냠!」 하는 순간(performance.now ms) */
  startAt: number;
  /** 지금 아는 상대 입력 */
  getOpp: (mine: Input, now: number) => Input;
  /** 내 입력을 상대에게 */
  onMine?: (mine: Input) => void;
  onEnd: (o: Outcome) => void;
  sound: () => Sound;
}

export default function Arena({ me, names, startAt, getOpp, onMine, onEnd, sound }: ArenaProps) {
  const [frame, setFrame] = useState<Frame>({
    now: (0 - 3000) / 1000,
    view: EMPTY_VIEW,
    endedAt: null,
    crumbs: [],
    stopped: { left: null, right: null },
    mine: { pressed: false, released: false },
  });
  const [holding, setHolding] = useState(false);

  const mine = useRef<Input>(freshInput());
  const held = useRef(false);
  const ended = useRef(false);
  const sent = useRef({ at: 0, press: null as number | null, release: null as number | null });
  const props = useRef({ getOpp, onMine, onEnd, sound });
  useEffect(() => {
    props.current = { getOpp, onMine, onEnd, sound };
  }, [getOpp, onMine, onEnd, sound]);

  const nowSec = () => (performance.now() - startAt) / 1000;

  const send = (force: boolean) => {
    const m = mine.current;
    const s = sent.current;
    const t = performance.now();
    if (!force && t - s.at < BEAT_MS && s.press === m.press && s.release === m.release) return;
    sent.current = { at: t, press: m.press, release: m.release };
    props.current.onMine?.({ ...m });
  };

  const down = () => {
    if (ended.current || mine.current.release !== null) return;
    held.current = true;
    setHolding(true);
    const now = nowSec();
    if (now >= 0 && mine.current.press === null) {
      mine.current.press = now;
      send(true);
    }
  };

  const up = () => {
    if (!held.current) return;
    held.current = false;
    setHolding(false);
    const m = mine.current;
    if (ended.current || m.press === null || m.release !== null) return;
    m.release = Math.max(m.press, nowSec());
    m.until = Math.max(m.until, m.release);
    send(true);
  };

  const downRef = useRef(down);
  const upRef = useRef(up);
  useEffect(() => {
    downRef.current = down;
    upRef.current = up;
  });

  // 스페이스바로도 꾹
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      e.preventDefault();
      downRef.current();
    };
    const ku = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      upRef.current();
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let endedAt: number | null = null;
    let done = false;
    let lastCount = 4;
    let nextBeat = 0;
    let crumbs: LiveCrumb[] = [];
    const bites = { left: 0, right: 0 };
    const stopped: Record<SideKey, number | null> = { left: null, right: null };
    let afterSends = 0;

    const tick = () => {
      const now = (performance.now() - startAt) / 1000;
      const snd = props.current.sound();

      // 3·2·1·냠!
      const count = now < 0 ? Math.ceil(-now) : 0;
      if (count !== lastCount && count <= 3) {
        lastCount = count;
        snd.beep(count === 0);
      }

      let view = EMPTY_VIEW;
      if (now >= 0) {
        const m = mine.current;
        if (endedAt === null) {
          m.until = Math.max(m.until, now);
          // 카운트다운 동안 꾹 누르고 있었으면 「냠!」과 함께 바로 먹기 시작
          if (held.current && m.press === null && m.release === null) {
            m.press = now < 0.12 ? 0 : now;
            send(true);
          }
        }
        const opp = props.current.getOpp(m, now);
        const l = me === "left" ? m : opp;
        const r = me === "left" ? opp : m;
        view = viewAt(l, r, now);

        (["left", "right"] as const).forEach((s) => {
          const inp = s === "left" ? l : r;
          if (stopped[s] === null && inp.release !== null && endedAt === null) {
            stopped[s] = now;
            if (s !== me) snd.tick();
          }
        });

        if (view.outcome && endedAt === null) {
          endedAt = now;
          ended.current = true;
          const k = view.outcome.kind;
          if (k === "bite") snd.bite();
          else if (k === "bonk") snd.bonk();
          else snd.ding();
          if (k !== "ok") navigator.vibrate?.(180);
        }

        // 먹은 만큼 부스러기·바삭
        const born: LiveCrumb[] = [];
        const gap = STICK_MM - view.left - view.right;
        (["left", "right"] as const).forEach((s) => {
          const n = Math.floor(view[s] / BITE_STEP);
          if (n <= bites[s]) return;
          bites[s] = n;
          snd.crunch(s === "left" ? -1 : 1);
          if (s === me) navigator.vibrate?.(8);
          const c = (view.left + STICK_MM - view.right) / 2;
          const h = visibleGap(gap) / 2;
          for (let i = 0; i < 3; i++) {
            born.push({
              id: crumbSeq++,
              born: now,
              at: s === "left" ? c - h : c + h,
              dir: s === "left" ? -1 : 1,
              seed: Math.random() * 1000,
            });
          }
        });
        crumbs = [...crumbs.filter((c) => now - c.born < 0.8), ...born];

        // 가까울수록 빨라지는 두근두근
        if (endedAt === null && gap < TENSE_GAP && now >= nextBeat && (l.press !== null || r.press !== null)) {
          snd.heartbeat();
          nextBeat = now + 0.25 + 0.5 * (gap / TENSE_GAP);
        }
      }

      // 끝난 뒤에도 잠깐은 내 입력을 계속 보낸다 — 상대가 판정을 확인할 수 있게
      if (endedAt === null || afterSends < 8) {
        if (endedAt !== null) afterSends++;
        if (now >= 0) {
          if (endedAt !== null) mine.current.until = Math.max(mine.current.until, now);
          send(endedAt !== null);
        }
      }

      const m = mine.current;
      setFrame({
        now,
        view,
        endedAt,
        crumbs,
        stopped: { ...stopped },
        mine: { pressed: m.press !== null, released: m.release !== null },
      });

      if (endedAt !== null && !done && now - endedAt >= AFTER && view.outcome) {
        done = true;
        props.current.onEnd(view.outcome);
      }
      if (!done || now - (endedAt ?? 0) < AFTER + 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // send 는 ref 만 쓴다
  }, [me, startAt]);

  /* ───── 그리기 ───── */
  const { now, view, endedAt, crumbs, stopped, mine: myInput } = frame;
  const o = view.outcome;
  const isEnded = endedAt !== null && o !== null;
  const after = isEnded ? now - endedAt : 0;
  const counting = now < 0;
  const gap = STICK_MM - view.left - view.right;

  const back = !isEnded
    ? 0
    : o.kind !== "ok"
      ? RECOIL * (1 - (1 - Math.min(1, after / 0.28)) ** 3)
      : after < 0.2
        ? 0
        : PULL_BACK * (1 - (1 - Math.min(1, (after - 0.2) / 0.3)) ** 3);
  const center = (view.left + STICK_MM - view.right) / 2;
  const half = visibleGap(gap) / 2 + back;
  const xL = center - half;
  const xR = center + half;

  const movingSide = (s: SideKey) => !isEnded && !counting && stopped[s] === null && (s === me ? holding && myInput.pressed : view[s] > 0);

  const exprOf = (s: SideKey): Expr => {
    if (isEnded) {
      if (o.kind === "bite") return o.biter === s ? "oops" : "ouch";
      if (o.kind === "bonk") return "ouch";
      if (after < 0.2) return "nervous";
      return o.winner === s || o.winner === "tie" ? "proud" : "meh";
    }
    if (counting) return "idle";
    if (movingSide(s)) return gap < 22 ? "nervous" : "chew";
    return gap < TENSE_GAP ? "nervous" : "idle";
  };

  const bubbleOf = (s: SideKey): string | null => {
    if (isEnded) {
      if (after < 0.45) return null;
      if (o.kind === "bite") return o.biter === s ? "미안…!" : "아야!";
      if (o.kind === "bonk") return s === "left" ? "쿵…" : "아이고";
      if (o.winner === "tie") return "비겼다!";
      return o.winner === s ? "내가 더 먹었다!" : "으…";
    }
    const at = stopped[s];
    if (at !== null && now - at < STOP_BUBBLE) return "멈춤!";
    return null;
  };

  const side = (s: SideKey): Side => ({
    at: s === "left" ? xL : xR,
    expr: exprOf(s),
    name: s === me ? `${names[s]} (나)` : names[s],
    bubble: bubbleOf(s),
  });

  const tense = !isEnded && !counting && gap < TENSE_GAP;
  const danger = isEnded ? 0 : Math.max(0, Math.min(1, 1 - gap / TENSE_GAP));
  const pullOut = isEnded ? Math.min(1, Math.max(0, after - 0.15) / 0.6) : 0;
  const zoom = 1 + (camZoom(xR - xL) - 1) * (1 - pullOut);
  const ok = isEnded && o.kind === "ok";
  const missed = !counting && !isEnded && !myInput.pressed && now > PRESS_WINDOW - 1.5;

  const btnLabel = isEnded
    ? "끝!"
    : myInput.released
      ? "멈췄어요 — 숨죽이고 기다리기"
      : counting
        ? holding
          ? "그대로 꾹! 곧 시작"
          : "꾹 누르고 기다려!"
        : holding
          ? "냠냠냠… 떼면 멈춰요"
          : !myInput.pressed
            ? missed
              ? "빨리 눌러요!"
              : "꾹 눌러서 먹기"
            : "멈췄어요";

  return (
    <div className="pp-arena">
      <div
        className={`relative overflow-hidden rounded-[20px] ${tense ? "pp-tense" : ""}`}
        onPointerDown={(e) => {
          e.preventDefault();
          capture(e);
          down();
        }}
        onPointerUp={up}
        onPointerCancel={up}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: "none" }}
      >
        <Stage
          left={side("left")}
          right={side("right")}
          crumbs={crumbs}
          cam={{ at: (xL + xR) / 2, zoom }}
          piece={ok && after >= 0.2 && o.kind === "ok" ? o.rest : null}
          sparkle={ok && after > 0.3 && o.kind === "ok" && o.rest <= 30}
          confetti={ok && after > 0.3 && o.kind === "ok" && o.rest <= 5}
          bite={isEnded && o.kind !== "ok" ? o.at : null}
          burst={isEnded && o.kind === "bonk" ? "쿵!" : "앙!"}
          caption={`${names.left}·${names.right} 둘이 막대과자를 양쪽에서 먹는 중`}
        />
        <div className="pp-vignette pointer-events-none absolute inset-0" style={{ opacity: danger }} />

        {counting ? (
          <p key={Math.ceil(-now)} className="pp-count pp-display pointer-events-none">
            {Math.ceil(-now)}
          </p>
        ) : now < 0.6 && !isEnded ? (
          <p key="go" className="pp-count pp-count-go pp-display pointer-events-none">
            냠!
          </p>
        ) : null}

        {!counting && !isEnded && (
          <p className={`pp-gap pp-display pointer-events-none ${tense ? "pp-gap-hot" : ""}`}>
            {view.pending ? "…?!" : `남은 ${cm(gap)}cm`}
          </p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[13px]">
        {(["left", "right"] as const).map((s) => (
          <div key={s} className={`pp-eat pp-eat-${s} ${s === me ? "pp-eat-me" : ""}`}>
            <b className="block truncate">{s === me ? `${names[s]} (나)` : names[s]}</b>
            <span className="pp-display text-[20px]">{cm(view[s])}</span>cm 먹음
            {stopped[s] !== null && !isEnded && <span className="pp-stopchip">멈춤</span>}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`pp-hold pp-display mt-4 ${holding && !isEnded ? "pp-hold-on" : ""} ${
          myInput.released || isEnded ? "pp-hold-off" : ""
        } ${missed ? "pp-hold-urgent" : ""}`}
        onPointerDown={(e) => {
          e.preventDefault();
          capture(e);
          down();
        }}
        onPointerUp={up}
        onPointerCancel={up}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        style={{ touchAction: "none" }}
      >
        {btnLabel}
      </button>
      <p className="mt-2 text-center text-[12px] opacity-55 break-keep">
        누르는 동안 먹고, 손을 떼면 그 판은 거기서 멈춰요 · 스페이스바도 돼요
      </p>
    </div>
  );
}
