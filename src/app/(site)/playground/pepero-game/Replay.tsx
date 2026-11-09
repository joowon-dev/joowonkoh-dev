"use client";

import { useEffect, useRef, useState } from "react";

import { BITE_STEP, camZoom, slowFactor, stepped, visibleGap } from "./motion";
import {
  cm,
  eatenOf,
  type Input,
  movingAt,
  type Outcome,
  type SideKey,
  STICK_MM,
  type Turn,
  viewAt,
} from "./rules";
import { Scene } from "./scene";
import type { Crumb, Expr } from "./Scene3D";
import type { Sound } from "./sound";

/**
 * 공개 — 따로 정한 두 사람을 같은 「냠!」에 겹쳐서 동시에 먹는 장면으로 틀어 준다.
 * VS 화면 → 3·2·1 → 둘이 동시에 냠냠. 가까워지면 슬로모션, 만나면 멈춤 화면(히트스톱) 뒤 「앙!」·「쿵!」.
 */

const VS = 1.9; // VS 화면(초)
const COUNT = 1.5; // 빠른 3·2·1(초)
const HITSTOP = 0.45; // 만나는 순간 멈춰 있는 시간(초)
const AFTER = 1.7; // 끝나고 결과 패널까지(초)
const STOP_BUBBLE = 0.9;

interface Props {
  left: Turn;
  right: Turn;
  sound: () => Sound;
  onEnd: (o: Outcome) => void;
}

/** t 초까지 드러난 입력 — 아직 안 뗀 사람은 먹는 중으로 본다 */
function revealAt(turn: Turn, t: number): Input {
  if (turn.press === null)
    return { press: null, release: null, until: Infinity };
  return {
    press: turn.press <= t ? turn.press : null,
    release: turn.release !== null && turn.release <= t ? turn.release : null,
    until: t,
  };
}

interface Frame {
  phase: "vs" | "count" | "play" | "end";
  clock: number; // 시작부터 실제로 흐른 초
  sim: number; // 장면 속 시각(「냠!」부터, 슬로모션 반영)
  left: number;
  right: number;
  outcome: Outcome | null;
  stopL: number | null;
  stopR: number | null;
  crumbs: Crumb[];
  endAt: number;
  beat: number;
}

export default function Replay({ left, right, sound, onEnd }: Props) {
  const [f, setF] = useState<Frame>({
    phase: "vs",
    clock: 0,
    sim: 0,
    left: 0,
    right: 0,
    outcome: null,
    stopL: null,
    stopR: null,
    crumbs: [],
    endAt: 0,
    beat: 0,
  });
  const getSound = useRef(sound);
  const end = useRef(onEnd);
  useEffect(() => {
    getSound.current = sound;
    end.current = onEnd;
  });

  useEffect(() => {
    const t0 = performance.now();
    let last = t0;
    let sim = 0;
    let hit = 0; // 히트스톱 남은 시간
    let outcome: Outcome | null = null;
    let endAt = 0;
    let sent = false;
    let beep = 4;
    let biteL = 0;
    let biteR = 0;
    let lastBeat = 0;
    let stopL: number | null = null;
    let stopR: number | null = null;
    let crumbs: Crumb[] = [];
    let cid = 0;
    let vsBoom = false;
    let beats = 0;
    let whooshed = false;

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const nowMs = performance.now();
      const clock = (nowMs - t0) / 1000;
      const dt = Math.min(0.05, (nowMs - last) / 1000);
      last = nowMs;
      const snd = getSound.current();

      let phase: Frame["phase"] = "vs";
      if (clock >= VS) phase = "count";
      if (clock >= VS + COUNT) phase = "play";

      if (!whooshed) {
        whooshed = true;
        snd.whoosh();
      }
      if (!vsBoom && clock > 0.35) {
        vsBoom = true;
        snd.bonk();
      }
      if (phase === "count") {
        const n = Math.ceil((VS + COUNT - clock) / (COUNT / 3));
        if (n < beep) {
          beep = n;
          snd.beep();
        }
      }

      let L = 0;
      let R = 0;
      if (phase === "play") {
        if (beep > 0) {
          beep = 0;
          snd.beep(true);
        }
        const peek = viewAt(revealAt(left, sim), revealAt(right, sim), sim);
        const gap = STICK_MM - peek.left - peek.right;
        const anyMoving =
          movingAt(revealAt(left, sim), sim + 1e-6) ||
          movingAt(revealAt(right, sim), sim + 1e-6);
        if (!outcome) {
          if (hit > 0) hit -= dt;
          else sim += dt * (anyMoving ? slowFactor(gap) : 1);
        }
        const v = viewAt(revealAt(left, sim), revealAt(right, sim), sim);
        L = v.left;
        R = v.right;

        // 멈춘 순간
        if (
          stopL === null &&
          left.release !== null &&
          left.press !== null &&
          sim >= left.release
        ) {
          stopL = clock;
          snd.tick();
        }
        if (
          stopR === null &&
          right.release !== null &&
          right.press !== null &&
          sim >= right.release
        ) {
          stopR = clock;
          snd.tick();
        }

        if (v.outcome && !outcome) {
          if (v.outcome.kind !== "ok" && hit <= 0 && endAt === 0) {
            // 만나는 순간 — 잠깐 멈췄다가 터진다
            hit = HITSTOP;
            endAt = -1;
          } else if (hit <= 0) {
            outcome = v.outcome;
            endAt = clock;
            if (outcome.kind === "bite") snd.bite();
            else if (outcome.kind === "bonk") snd.bonk();
            else snd.ding();
          }
        }

        // 바삭 + 부스러기
        const kl = Math.floor(L / BITE_STEP);
        const kr = Math.floor(R / BITE_STEP);
        if (kl > biteL) {
          biteL = kl;
          snd.crunch(-0.6);
          crumbs = [
            ...crumbs.slice(-18),
            { id: cid++, at: L, dir: 1, seed: Math.random() },
          ];
        }
        if (kr > biteR) {
          biteR = kr;
          snd.crunch(0.6);
          crumbs = [
            ...crumbs.slice(-18),
            { id: cid++, at: STICK_MM - R, dir: -1, seed: Math.random() },
          ];
        }
        // 가까워질수록 긴장음이 높아지고 심장이 빨라진다
        snd.tension(!outcome && anyMoving ? 0.15 + 0.85 * (1 - gap / STICK_MM) : 0);
        if (!outcome && anyMoving && gap < 80) {
          const every = Math.max(220, 260 + gap * 8);
          if (nowMs - lastBeat > every) {
            lastBeat = nowMs;
            beats++;
            snd.heartbeat();
          }
        }
      }

      setF({
        phase: outcome ? "end" : phase,
        clock,
        sim,
        left: L,
        right: R,
        outcome,
        stopL,
        stopR,
        crumbs,
        endAt,
        beat: beats,
      });

      if (outcome && !sent && clock - endAt > AFTER) {
        sent = true;
        end.current(outcome);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      getSound.current().tension(0);
    };
  }, [left, right]);

  /* ── 그리기 ── */
  const o = f.outcome;
  const finalL = eatenOf(left);
  const finalR = eatenOf(right);
  const eL = stepped(f.left, finalL);
  const eR = stepped(f.right, finalR);
  const gap = STICK_MM - eL - eR;
  // 부딪힌 뒤에는 둘이 뒤로 물러난다 — 얼굴이 가까워 보이지 않게
  // 이마 쿵: 부딪힌 순간 둘이 앞으로 쏠려 이마가 닿았다가(0.3초) 튕겨 나간다. 깨물기는 바로 물러난다.
  const since = o ? f.clock - f.endAt : 0;
  const lunge =
    o?.kind === "bonk"
      ? since < 0.08
        ? since / 0.08
        : since < 0.32
          ? 1
          : Math.max(0, 1 - (since - 0.32) / 0.2)
      : 0;
  const backFrom = o?.kind === "bonk" ? 0.32 : 0;
  const recoil =
    o && o.kind !== "ok"
      ? Math.min(1, Math.max(0, since - backFrom) / 0.25) * 30
      : 0;
  const vis = visibleGap(gap) + recoil;
  const push = Math.max(0, vis - gap);
  const share = eL + eR > 0 ? eL / (eL + eR) : 0.5;
  const leftAt = eL - push * share;
  const rightAt = STICK_MM - (eR - push * (1 - share));

  const realGap = STICK_MM - f.left - f.right;
  const playing = f.phase === "play";
  const movingL =
    playing &&
    left.press !== null &&
    f.sim > left.press &&
    (left.release === null || f.sim < left.release);
  const movingR =
    playing &&
    right.press !== null &&
    f.sim > right.press &&
    (right.release === null || f.sim < right.release);
  const heat = (m: boolean) => (m ? Math.min(1, 0.25 + f.sim / 4.5) : 0);
  const close = realGap < 30;

  const exprOf = (
    side: SideKey,
    moving: boolean,
    otherMoving: boolean,
  ): Expr => {
    if (o) {
      if (o.kind === "bonk") return "dizzy";
      if (o.kind === "bite") return o.biter === side ? "oops" : "ouch";
      if (o.winner === "tie") return "idle";
      return o.winner === side ? "win" : "lose";
    }
    if (f.phase === "vs") return "ready";
    if (f.phase === "count") return "ready";
    if (moving) return "chew";
    if (otherMoving && close) return "nervous";
    return (side === "left" ? left : right).press === null ? "nervous" : "hold";
  };

  const bubbleOf = (side: SideKey, stop: number | null): string | null => {
    if (o) {
      if (o.kind === "bonk") return "아이고…";
      if (o.kind === "bite") return o.biter === side ? "미안…!" : "아야!";
      if (o.winner === "tie") return "비겼다!";
      return o.winner === side ? "내가 더 먹었다!" : "으앙…";
    }
    if (stop !== null && f.clock - stop < STOP_BUBBLE) return "멈춤!";
    if (
      playing &&
      (side === "left" ? left : right).press === null &&
      f.sim > 0.6
    )
      return "무서워서 못 먹겠어…";
    return null;
  };

  const zoom = o ? 1 : camZoom(gap);
  const hitstop =
    !o &&
    playing &&
    viewAt(revealAt(left, f.sim), revealAt(right, f.sim), f.sim).outcome
      ?.kind !== undefined;
  const meet = o && o.kind !== "ok" ? o.at : null;
  const danger =
    playing && !o ? Math.min(1, Math.max(0, (40 - realGap) / 40)) : 0;
  const hot = Math.max(heat(movingL), heat(movingR));

  const count = Math.ceil((VS + COUNT - f.clock) / (COUNT / 3));

  return (
    <div
      className="pp-surface absolute inset-0"
      style={{ ["--heat" as string]: hot, ["--danger" as string]: danger }}
    >
      <Scene
        left={{
          at: leftAt,
          expr: exprOf("left", movingL, movingR),
          name: left.name,
          heat: heat(movingL),
          bubble: bubbleOf("left", f.stopL),
          lunge,
        }}
        right={{
          at: rightAt,
          expr: exprOf("right", movingR, movingL),
          name: right.name,
          heat: heat(movingR),
          bubble: bubbleOf("right", f.stopR),
          lunge,
        }}
        crumbs={f.crumbs}
        bite={meet}
        burst={o?.kind === "bonk" ? "쿵!" : "앙!"}
        piece={o?.kind === "ok" ? o.rest : null}
        confetti={o?.kind === "ok" && o.rest <= 15}
        cam={{
          at: (leftAt + rightAt) / 2,
          span: (((rightAt - leftAt) * 0.04) / 2 + 3.0 + (o ? 1.4 : 0)) / zoom,
          shake: hot * 0.5 + danger * 0.6 + (hitstop ? 1 : 0),
          lift: o && f.clock - f.endAt > AFTER - 0.3 ? 0.15 : 0,
          // 아슬아슬하면 화면이 이쪽저쪽 기울고, 확 다가온다
          roll: danger * 0.12 * Math.sin(f.clock * 1.7) + (hitstop ? 0.06 : 0),
          push: o ? 0 : hitstop ? 0.7 : danger * 0.5,
        }}
        caption={`${left.name}·${right.name} 동시에 냠냠 — 공개!`}
      />
      <div className="pp-speedlines" aria-hidden />
      <div className="pp-vignette" aria-hidden />
      {f.beat > 0 && !o && <div key={f.beat} className="pp-beat" aria-hidden />}
      {(hitstop || meet !== null) && (
        <div
          className={`pp-flash ${hitstop ? "pp-flash-hold" : ""}`}
          aria-hidden
        />
      )}

      {/* 위: 두 사람이 먹은 길이 */}
      {f.phase !== "vs" && (
        <div className="pp-hud-top pp-hud-duel">
          <div className="pp-duel-side pp-duel-left">
            <span className="pp-display pp-duel-name">{left.name}</span>
            <span className="pp-display pp-duel-cm">
              {cm(f.left)}
              <small>cm</small>
            </span>
          </div>
          <div
            className={`pp-display pp-duel-gap ${close && !o ? "pp-duel-gap-hot" : ""}`}
          >
            {o
              ? o.kind === "ok"
                ? `남은 ${cm(o.rest)}cm`
                : "0cm"
              : `${cm(Math.max(0, realGap))}cm`}
          </div>
          <div className="pp-duel-side pp-duel-right">
            <span className="pp-display pp-duel-name">{right.name}</span>
            <span className="pp-display pp-duel-cm">
              {cm(f.right)}
              <small>cm</small>
            </span>
          </div>
        </div>
      )}

      {f.phase === "vs" && (
        <div className="pp-vs" aria-live="polite">
          <div className="pp-vs-panel pp-vs-left">
            <span className="pp-display">{left.name}</span>
          </div>
          <div className="pp-vs-panel pp-vs-right">
            <span className="pp-display">{right.name}</span>
          </div>
          <p className="pp-display pp-vs-mark">VS</p>
          <p className="pp-display pp-vs-sub">동시에 먹으면 어떻게 될까?</p>
        </div>
      )}
      {f.phase === "count" && count > 0 && count <= 3 && (
        <div className="pp-center" key={count}>
          <p className="pp-display pp-count">{count}</p>
        </div>
      )}
      {playing && f.sim < 0.5 && (
        <div className="pp-center">
          <p className="pp-display pp-count pp-count-go">냠!</p>
        </div>
      )}
      {playing && !o && danger > 0.5 && (
        <div className="pp-center pp-center-low">
          <p className="pp-display pp-slowmo">SLOW…</p>
        </div>
      )}
    </div>
  );
}
