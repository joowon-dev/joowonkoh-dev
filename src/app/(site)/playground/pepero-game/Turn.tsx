"use client";

import { useEffect, useRef, useState } from "react";

import { BITE_STEP, stepped, visibleGap } from "./motion";
import { AUTO_STOP, cm, COUNTDOWN, dist, PRESS_WINDOW, type SideKey, STICK_MM, timeToEat } from "./rules";
import { Scene } from "./scene";
import type { Crumb, Expr } from "./Scene3D";
import type { Sound } from "./sound";

/**
 * 내 차례 — 상대 기록을 모른 채, 꾹 누르는 동안 먹고 떼면 멈춘다.
 * 상대는 그림자로만 보인다. 끝나면 누른·뗀 시각을 onDone 으로 넘긴다.
 */

const INTRO = 0.7; // 「내 차례」 글자가 뜨는 시간(초)
const AFTER = 1.5; // 멈춘 뒤 다음 화면까지(초)

interface Props {
  me: SideKey;
  names: { left: string; right: string };
  sound: () => Sound;
  onDone: (t: { press: number | null; release: number | null }) => void;
}

interface Frame {
  now: number;
  eaten: number;
  pressing: boolean;
  press: number | null;
  release: number | null;
  ended: "stop" | "auto" | "none" | null;
  crumbs: Crumb[];
}

export default function Turn({ me, names, sound, onDone }: Props) {
  const [f, setF] = useState<Frame>({
    now: -COUNTDOWN - INTRO,
    eaten: 0,
    pressing: false,
    press: null,
    release: null,
    ended: null,
    crumbs: [],
  });

  const st = useRef({
    startAt: 0,
    down: false,
    press: null as number | null,
    release: null as number | null,
    ended: null as Frame["ended"],
    endedAt: 0,
    lastBite: 0,
    lastBeat: 0,
    lastBeep: 99,
    crumbs: [] as Crumb[],
    crumbId: 0,
    sent: false,
  });
  const done = useRef(onDone);
  const getSound = useRef(sound);
  useEffect(() => {
    done.current = onDone;
    getSound.current = sound;
  });

  useEffect(() => {
    const s = st.current;
    s.startAt = performance.now() + (INTRO + COUNTDOWN) * 1000;
    const clock = () => (performance.now() - s.startAt) / 1000;

    const down = () => {
      if (s.ended || s.release !== null) return;
      s.down = true;
      const now = clock();
      if (now >= 0 && s.press === null) s.press = now;
    };
    const up = () => {
      if (!s.down) return;
      s.down = false;
      const now = clock();
      if (s.press !== null && s.release === null) s.release = Math.max(s.press, now);
    };
    const key = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;
      e.preventDefault();
      if (e.type === "keydown" && !e.repeat) down();
      if (e.type === "keyup") up();
    };
    const surface = document.getElementById("pp-turn-surface");
    const pd = (e: PointerEvent) => {
      e.preventDefault();
      down();
    };
    surface?.addEventListener("pointerdown", pd);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", up);
    window.addEventListener("keydown", key);
    window.addEventListener("keyup", key);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = clock();
      const snd = getSound.current();

      // 3·2·1 삑
      if (now < 0) {
        const n = Math.ceil(-now);
        if (n <= COUNTDOWN && n < s.lastBeep) {
          s.lastBeep = n;
          snd.beep();
        }
      } else if (s.lastBeep > 0) {
        s.lastBeep = 0;
        snd.beep(true);
        if (s.down && s.press === null) s.press = 0; // 미리 꾹 눌러 둔 사람은 「냠!」과 함께 출발
      }

      let eaten = 0;
      if (s.press !== null) {
        const end = s.release ?? now;
        eaten = Math.max(0, dist(Math.max(s.press, end)) - dist(s.press));
        if (eaten >= AUTO_STOP && s.release === null) {
          s.release = timeToEat(s.press, AUTO_STOP);
          s.ended = "auto";
          eaten = AUTO_STOP;
        }
      }
      if (!s.ended && s.release !== null) s.ended = "stop";
      if (!s.ended && s.press === null && now >= PRESS_WINDOW) s.ended = "none";
      if (s.ended && !s.endedAt) {
        s.endedAt = now;
        if (s.ended === "none") snd.bonk();
        else snd.ding();
      }

      // 바삭 + 부스러기
      const k = Math.floor(eaten / BITE_STEP);
      if (k > s.lastBite) {
        s.lastBite = k;
        snd.crunch(me === "left" ? -0.4 : 0.4);
        const at = me === "left" ? eaten : STICK_MM - eaten;
        s.crumbs = [...s.crumbs.slice(-14), { id: s.crumbId++, at, dir: me === "left" ? 1 : -1, seed: Math.random() }];
      }
      // 반 넘으면 두근두근, 갈수록 빨리
      if (s.press !== null && s.release === null && eaten > 55) {
        const gap = Math.max(260, 900 - (eaten - 55) * 7);
        const t = performance.now();
        if (t - s.lastBeat > gap) {
          s.lastBeat = t;
          snd.heartbeat();
        }
      }

      setF({
        now,
        eaten,
        pressing: s.down,
        press: s.press,
        release: s.release,
        ended: s.ended,
        crumbs: s.crumbs,
      });

      if (s.ended && now - s.endedAt > AFTER && !s.sent) {
        s.sent = true;
        done.current({ press: s.press, release: s.press === null ? null : s.release });
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      surface?.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", up);
      window.removeEventListener("keydown", key);
      window.removeEventListener("keyup", key);
    };
  }, [me]);

  /* ── 그리기 ── */
  const eating = f.press !== null && f.release === null;
  const shown = stepped(f.eaten, f.release !== null ? f.eaten : Infinity);
  const gapShown = visibleGap(STICK_MM - shown);
  const mine = STICK_MM - gapShown; // 내 입이 막대 끝에서 들어간 거리(화면)
  const heat = eating ? Math.min(1, 0.25 + f.now / 4.5) : 0;
  const danger = Math.min(1, Math.max(0, (f.eaten - 60) / 80));
  const myExpr: Expr = f.ended === "none" ? "lose" : eating ? "chew" : f.release !== null ? "hold" : "ready";
  const leftAt = me === "left" ? mine : 0;
  const rightAt = me === "left" ? STICK_MM : STICK_MM - mine;
  const myName = me === "left" ? names.left : names.right;
  const opName = me === "left" ? names.right : names.left;
  const counting = f.now < 0 && f.now > -COUNTDOWN;
  const count = Math.ceil(-f.now);
  const left = me === "left";

  const bubble = f.ended === "auto" ? "더는 못 가!" : f.ended === "stop" ? "여기까지!" : f.ended === "none" ? "무서워…" : null;
  const me3 = { expr: myExpr, name: myName, heat, bubble };
  const op = { expr: "shadow" as Expr, name: opName, heat: 0 };

  const stopWord = f.ended === "none" ? "포기…" : f.ended === "auto" ? "끝까지!" : "STOP!";

  return (
    <div
      id="pp-turn-surface"
      className="pp-surface absolute inset-0"
      onContextMenu={(e) => e.preventDefault()}
      style={{ ["--heat" as string]: heat, ["--danger" as string]: danger }}
    >
      <Scene
        left={{ at: leftAt, ...(left ? me3 : op) }}
        right={{ at: rightAt, ...(left ? op : me3) }}
        half
        crumbs={f.crumbs}
        cam={{ at: (leftAt + rightAt) / 2, span: ((rightAt - leftAt) * 0.04) / 2 + 2.9, shake: heat * 0.6 + danger * 0.4 }}
        caption={`${myName} 차례 — 꾹 누르는 동안 막대과자를 먹어요`}
      />
      <div className="pp-speedlines" aria-hidden />
      <div className="pp-vignette" aria-hidden />

      {/* 위: 먹은 길이 + 위험 */}
      <div className="pp-hud-top">
        <p className="pp-display pp-hud-chip">{myName}의 차례 · 상대 기록은 비밀</p>
        <p className={`pp-display pp-meter ${eating ? "pp-meter-hot" : ""}`}>
          {cm(f.eaten)}
          <small>cm</small>
        </p>
        <p className={`pp-display pp-warn ${danger > 0.4 ? "pp-warn-hot" : ""}`}>
          {f.eaten < 1
            ? "많이 먹을수록 이기지만, 둘이 합쳐 15cm 넘으면 입술을 앙!"
            : `${opName}님이 ${cm(STICK_MM - f.eaten)}cm 넘게 먹으면… 앙!`}
        </p>
      </div>

      {f.now < -COUNTDOWN + 0.05 && (
        <div className="pp-center">
          <p className="pp-display pp-title-pop">내 차례!</p>
        </div>
      )}
      {counting && (
        <div className="pp-center" key={count}>
          <p className="pp-display pp-count">{count}</p>
        </div>
      )}
      {f.now >= 0 && f.now < 0.7 && (
        <div className="pp-center">
          <p className="pp-display pp-count pp-count-go">냠!</p>
        </div>
      )}
      {f.ended && (
        <div className="pp-center">
          <p className="pp-display pp-stamp">{stopWord}</p>
        </div>
      )}

      {/* 아래: 큰 버튼 */}
      <div className="pp-hud-bottom">
        <div
          className={`pp-display pp-hold ${f.pressing && !f.ended ? "pp-hold-on" : ""} ${
            f.now >= 0 && f.press === null && !f.ended ? "pp-hold-urgent" : ""
          } ${f.ended ? "pp-hold-off" : ""}`}
          aria-hidden
        >
          {f.ended
            ? f.ended === "none"
              ? "안 먹었어요"
              : `${cm(f.eaten)}cm 냠!`
            : f.now < 0
              ? f.pressing
                ? "그대로 꾹! 곧 시작"
                : "화면을 꾹 누르고 기다려!"
              : eating
                ? "냠냠냠… 떼면 멈춰요"
                : `빨리 꾹! ${Math.max(0, PRESS_WINDOW - f.now).toFixed(1)}초`}
        </div>
        <p className="pp-hud-sub">화면 어디든 꾹 · PC는 스페이스바</p>
      </div>
    </div>
  );
}
