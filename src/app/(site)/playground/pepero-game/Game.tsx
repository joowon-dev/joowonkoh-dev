"use client";

import Link from "next/link";
import { type ReactNode, useCallback, useRef, useState, useSyncExternalStore } from "react";

import { botTurn } from "./bot";
import Replay from "./Replay";
import {
  cleanName,
  cm,
  decodeChallenge,
  decodeResult,
  eatenOf,
  encodeChallenge,
  encodeResult,
  NAME_MAX,
  type Outcome,
  type SideKey,
  STICK_MM,
  type Turn as TurnT,
  winnerOf,
} from "./rules";
import { Scene } from "./scene";
import { makeSound, type Sound } from "./sound";
import Turn from "./Turn";

/**
 * 빼빼로 게임 — 링크로 차례를 주고받는다.
 * 1) 도전자가 꾹 눌러 얼마나 먹을지 정하고 링크를 보낸다(기록은 링크 속에 숨겨 둔다).
 * 2) 받은 사람도 상대 기록을 모른 채 정한다.
 * 3) 둘을 겹쳐서 동시에 먹는 장면을 공개한다. 결과 링크로 도전자에게 돌려줄 수 있다.
 */

/* ───────────── 링크(#) ───────────── */

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const noop = () => () => {};

function go(hash: string) {
  if (hash) {
    window.location.hash = hash;
  } else {
    history.pushState(null, "", window.location.pathname + window.location.search);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
}

type Route =
  | { kind: "home" }
  | { kind: "make" }
  | { kind: "practice" }
  | { kind: "challenge"; code: string; from: TurnT }
  | { kind: "result"; code: string; left: TurnT; right: TurnT }
  | { kind: "broken" };

function routeOf(hash: string): Route {
  const h = hash.replace(/^#/, "");
  if (!h) return { kind: "home" };
  if (h === "make") return { kind: "make" };
  if (h === "practice") return { kind: "practice" };
  const c = /^c=([A-Za-z0-9_-]+)$/.exec(h);
  if (c) {
    const from = decodeChallenge(c[1]);
    return from ? { kind: "challenge", code: c[1], from } : { kind: "broken" };
  }
  const r = /^r=([A-Za-z0-9_-]+)$/.exec(h);
  if (r) {
    const both = decodeResult(r[1]);
    return both ? { kind: "result", code: r[1], ...both } : { kind: "broken" };
  }
  return { kind: "broken" };
}

const linkTo = (hash: string) => `${window.location.origin}${window.location.pathname}#${hash}`;

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** 휴대폰이면 공유 시트, 안 되면 복사 */
async function shareLink(url: string, text: string): Promise<"shared" | "copied" | "cancel" | "manual"> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text, url });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancel";
    }
  }
  return (await copy(`${text}\n${url}`)) ? "copied" : "manual";
}

const NAME_KEY = "pp-name";
const loadName = () => {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
};
const saveName = (n: string) => {
  try {
    localStorage.setItem(NAME_KEY, n);
  } catch {
    /* 저장이 막혀 있어도 게임은 된다 */
  }
};

/* ───────────── 맨 위 ───────────── */

interface Audio {
  unlock: () => void;
  sound: () => Sound;
}

export default function Game() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => "");
  const [soundOn, setSoundOn] = useState(true);
  const [toast, say] = useToast();

  // 소리는 누르기 안에서만 만들 수 있다. 버튼 핸들러가 unlock() 을 부르고, 게임은 sound() 로 꺼내 쓴다.
  const audio = useRef<{ on: boolean; s: Sound } | null>(null);
  const unlockWith = useCallback((on: boolean) => {
    if (!audio.current || audio.current.on !== on) audio.current = { on, s: makeSound(on) };
  }, []);
  const a: Audio = {
    unlock: () => unlockWith(soundOn),
    sound: () => audio.current?.s ?? makeSound(false),
  };

  const route = routeOf(hash);

  let body: ReactNode = null;
  if (hydrated) {
    switch (route.kind) {
      case "home":
        body = <Home audio={a} />;
        break;
      case "make":
        body = <Make audio={a} say={say} />;
        break;
      case "practice":
        body = <Practice audio={a} />;
        break;
      case "challenge":
        body = <Challenge key={route.code} from={route.from} audio={a} say={say} />;
        break;
      case "result":
        body = <ResultView key={route.code} left={route.left} right={route.right} audio={a} />;
        break;
      default:
        body = (
          <Sheet>
            <p className="pp-display pp-sheet-title">앗, 링크가 이상해요 🍫💥</p>
            <p className="pp-sheet-text">링크 끝이 잘렸을 수도 있어요. 다시 받아 보세요.</p>
            <button type="button" className="pp-btn mt-4 w-full" onClick={() => go("")}>
              처음으로
            </button>
          </Sheet>
        );
    }
  }

  return (
    <div className="pp-app">
      {body}
      <div className="pp-topbar">
        <Link href="/playground" className="pp-chip pp-display">
          ← 놀이터
        </Link>
        {route.kind !== "home" && (
          <button type="button" className="pp-chip pp-display" onClick={() => go("")}>
            처음으로
          </button>
        )}
        <button
          type="button"
          className="pp-chip pp-display ml-auto"
          onClick={() => {
            setSoundOn(!soundOn);
            unlockWith(!soundOn);
          }}
          aria-pressed={soundOn}
          aria-label={soundOn ? "소리 끄기" : "소리 켜기"}
        >
          {soundOn ? "🔊" : "🔇"}
        </button>
      </div>
      <Toast text={toast} />
    </div>
  );
}

/* ───────────── 처음 화면 ───────────── */

function Home({ audio }: { audio: Audio }) {
  const [name, setName] = useState(loadName);
  const [rules, setRules] = useState(false);
  return (
    <>
      <Scene
        left={{ at: 0, expr: "ready", name: cleanName(name, "나"), heat: 0.35 }}
        right={{ at: STICK_MM, expr: "ready", name: "친구", heat: 0.35 }}
        cam={{ at: STICK_MM / 2, span: 5.6, lift: 0.16 }}
      />
      <div className="pp-speedlines pp-speedlines-soft" aria-hidden />
      <header className="pp-hero">
        <p className="pp-display pp-hero-kicker">먼저 겁먹는 사람이 진다!</p>
        <h1 className="pp-display pp-hero-title">
          빼빼로
          <br />
          치킨 게임
        </h1>
      </header>
      <Sheet>
        <NameField value={name} onChange={setName} />
        <button
          type="button"
          className="pp-btn pp-btn-big mt-3 w-full"
          onClick={() => {
            saveName(name);
            audio.unlock();
            go("#make");
          }}
        >
          도전장 만들기 🔥
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="pp-btn pp-btn-ghost w-full"
            onClick={() => {
              saveName(name);
              audio.unlock();
              go("#practice");
            }}
          >
            컴퓨터랑 연습
          </button>
          <button type="button" className="pp-btn pp-btn-ghost w-full" onClick={() => setRules(!rules)}>
            {rules ? "규칙 닫기" : "어떻게 해요?"}
          </button>
        </div>
        {rules && <Rules />}
      </Sheet>
    </>
  );
}

/* ───────────── 도전장 만들기 ───────────── */

function Make({ audio, say }: { audio: Audio; say: (t: string) => void }) {
  const [name] = useState(() => cleanName(loadName(), "도전자"));
  const [round, setRound] = useState(0);
  const [mine, setMine] = useState<TurnT | null>(null);

  if (!mine) {
    return (
      <Turn
        key={round}
        me="left"
        names={{ left: name, right: "???" }}
        sound={audio.sound}
        onDone={(t) => setMine({ name, ...t })}
      />
    );
  }

  const eaten = eatenOf(mine);
  const send = async () => {
    const r = await shareLink(
      linkTo(`c=${encodeChallenge(mine)}`),
      `🍫 ${name}의 빼빼로 도전장! 나는 이미 얼마나 먹을지 정했어. 너는? 먼저 겁먹는 사람이 진다!`,
    );
    if (r === "copied") say("링크를 복사했어요! 친구에게 붙여 넣어 보내세요");
    if (r === "manual") say("복사가 막혀 있어요. 주소창 링크를 직접 보내 주세요");
  };

  return (
    <>
      <Scene
        left={{ at: eaten, expr: "hold", name, bubble: eaten > 0 ? "두근두근" : "…" }}
        right={{ at: STICK_MM, expr: "shadow", name: "누구?" }}
        cam={{ at: (eaten + STICK_MM) / 2, span: ((STICK_MM - eaten) * 0.04) / 2 + 3, lift: 0.18 }}
      />
      <Sheet>
        <p className="pp-display pp-sheet-kicker">도전장 완성!</p>
        <p className="pp-display pp-sheet-title">
          {eaten > 0 ? (
            <>
              <span className="pp-pink">{cm(eaten)}cm</span> 먹고 멈췄어요
            </>
          ) : (
            "하나도 안 먹었어요…"
          )}
        </p>
        <p className="pp-sheet-text">
          친구는 내 기록을 모른 채 정해요. 친구가 끝내면 <b>둘이 동시에 먹는 장면</b>이 공개돼요!
        </p>
        <button type="button" className="pp-btn pp-btn-big mt-3 w-full" onClick={send}>
          친구에게 도전장 보내기 📮
        </button>
        <button
          type="button"
          className="pp-btn pp-btn-ghost mt-2 w-full"
          onClick={() => {
            audio.unlock();
            setMine(null);
            setRound(round + 1);
          }}
        >
          다시 정하기
        </button>
      </Sheet>
    </>
  );
}

/* ───────────── 도전장 받기 ───────────── */

function Challenge({ from: fromLink, audio, say }: { from: TurnT; audio: Audio; say: (t: string) => void }) {
  // 링크에서 읽은 값은 그릴 때마다 새 객체라, 처음 것을 붙잡아 둔다(다시 틀기 방지).
  const [from] = useState(fromLink);
  const [name, setName] = useState(loadName);
  const [phase, setPhase] = useState<"intro" | "turn" | "replay" | "done">("intro");
  const [mine, setMine] = useState<TurnT | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const me = cleanName(name, "나");

  if (phase === "intro") {
    return (
      <>
        <Scene
          left={{ at: 0, expr: "ready", name: from.name, heat: 0.5, bubble: "덤벼!" }}
          right={{ at: STICK_MM, expr: "shadow", name: me }}
          cam={{ at: STICK_MM / 2, span: 5.6, lift: 0.16 }}
        />
        <div className="pp-speedlines pp-speedlines-soft" aria-hidden />
        <header className="pp-hero">
          <p className="pp-display pp-hero-kicker">📮 도전장 도착</p>
          <h1 className="pp-display pp-hero-title pp-hero-title-sm">
            {from.name}님이
            <br />
            빼빼로 대결을 걸었어요!
          </h1>
        </header>
        <Sheet>
          <p className="pp-sheet-text">
            {from.name}님은 이미 얼마나 먹을지 정했어요. <b>몇 cm인지는 비밀!</b>
            <br />
            꾹 누르는 동안 먹고, 떼면 멈춰요. 더 많이 먹으면 이기지만, 둘이 합쳐 15cm를 넘으면… 아직 먹던 사람이
            입술을 <b>앙!</b>
          </p>
          <NameField value={name} onChange={setName} />
          <button
            type="button"
            className="pp-btn pp-btn-big mt-3 w-full"
            onClick={() => {
              saveName(name);
              audio.unlock();
              setPhase("turn");
            }}
          >
            도전 받기 🔥
          </button>
        </Sheet>
      </>
    );
  }

  if (phase === "turn" || !mine) {
    return (
      <Turn
        me="right"
        names={{ left: from.name, right: me }}
        sound={audio.sound}
        onDone={(t) => {
          setMine({ name: me, ...t });
          setPhase("replay");
        }}
      />
    );
  }

  const sendBack = async () => {
    const r = await shareLink(
      linkTo(`r=${encodeResult(from, mine)}`),
      `🍫 ${from.name} vs ${mine.name} 빼빼로 대결 결과 나왔어! 동시에 먹으면 어떻게 됐을지 보러 와`,
    );
    if (r === "copied") say("결과 링크를 복사했어요!");
    if (r === "manual") say("복사가 막혀 있어요");
  };

  return (
    <>
      <Replay
        left={from}
        right={mine}
        sound={audio.sound}
        onEnd={(o) => {
          setOutcome(o);
          setPhase("done");
        }}
      />
      {phase === "done" && outcome && (
        <ResultPanel left={from} right={mine} outcome={outcome} me="right">
          <button type="button" className="pp-btn pp-btn-big w-full" onClick={sendBack}>
            {from.name}님에게 결과 보내기 📮
          </button>
          <button type="button" className="pp-btn pp-btn-ghost mt-2 w-full" onClick={() => go("#make")}>
            나도 도전장 만들기
          </button>
        </ResultPanel>
      )}
    </>
  );
}

/* ───────────── 결과 링크 ───────────── */

function ResultView({ left: l0, right: r0, audio }: { left: TurnT; right: TurnT; audio: Audio }) {
  const [{ left, right }] = useState({ left: l0, right: r0 });
  const [phase, setPhase] = useState<"ready" | "replay" | "done">("ready");
  const [round, setRound] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  if (phase === "ready") {
    return (
      <>
        <Scene
          left={{ at: 0, expr: "ready", name: left.name, heat: 0.4 }}
          right={{ at: STICK_MM, expr: "ready", name: right.name, heat: 0.4 }}
          cam={{ at: STICK_MM / 2, span: 5.6, lift: 0.16 }}
        />
        <div className="pp-speedlines pp-speedlines-soft" aria-hidden />
        <header className="pp-hero">
          <p className="pp-display pp-hero-kicker">빼빼로 대결 결과</p>
          <h1 className="pp-display pp-hero-title pp-hero-title-sm">
            {left.name} <span className="pp-vs-inline">VS</span> {right.name}
          </h1>
        </header>
        <Sheet>
          <p className="pp-sheet-text">둘 다 상대 기록을 모른 채 정했어요. 동시에 먹으면 어떻게 될까?</p>
          <button
            type="button"
            className="pp-btn pp-btn-big mt-3 w-full"
            onClick={() => {
              audio.unlock();
              setPhase("replay");
            }}
          >
            결과 공개 ▶
          </button>
        </Sheet>
      </>
    );
  }

  return (
    <>
      <Replay
        key={round}
        left={left}
        right={right}
        sound={audio.sound}
        onEnd={(o) => {
          setOutcome(o);
          setPhase("done");
        }}
      />
      {phase === "done" && outcome && (
        <ResultPanel left={left} right={right} outcome={outcome} me={null}>
          <button type="button" className="pp-btn pp-btn-big w-full" onClick={() => go("#make")}>
            다시 붙자! 도전장 만들기 🔥
          </button>
          <button
            type="button"
            className="pp-btn pp-btn-ghost mt-2 w-full"
            onClick={() => {
              audio.unlock();
              setOutcome(null);
              setPhase("replay");
              setRound(round + 1);
            }}
          >
            다시 보기
          </button>
        </ResultPanel>
      )}
    </>
  );
}

/* ───────────── 혼자 연습 ───────────── */

function Practice({ audio }: { audio: Audio }) {
  const [name] = useState(() => cleanName(loadName(), "나"));
  const [round, setRound] = useState(0);
  const [mine, setMine] = useState<TurnT | null>(null);
  const [bot, setBot] = useState<TurnT>(() => botTurn());
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [tally, setTally] = useState({ me: 0, bot: 0 });

  if (!mine) {
    return (
      <Turn
        key={round}
        me="left"
        names={{ left: name, right: bot.name }}
        sound={audio.sound}
        onDone={(t) => setMine({ name, ...t })}
      />
    );
  }

  return (
    <>
      <Replay
        key={round}
        left={mine}
        right={bot}
        sound={audio.sound}
        onEnd={(o) => {
          setOutcome(o);
          const w = winnerOf(o);
          setTally((t) => ({ me: t.me + (w === "left" ? 1 : 0), bot: t.bot + (w === "right" ? 1 : 0) }));
        }}
      />
      {outcome && (
        <ResultPanel left={mine} right={bot} outcome={outcome} me="left" score={`${tally.me} : ${tally.bot}`}>
          <button
            type="button"
            className="pp-btn pp-btn-big w-full"
            onClick={() => {
              audio.unlock();
              setOutcome(null);
              setMine(null);
              setBot(botTurn());
              setRound(round + 1);
            }}
          >
            한 판 더!
          </button>
          <button type="button" className="pp-btn pp-btn-ghost mt-2 w-full" onClick={() => go("#make")}>
            친구한테 도전장 보내기
          </button>
        </ResultPanel>
      )}
    </>
  );
}

/* ───────────── 결과 패널 ───────────── */

function ResultPanel({
  left,
  right,
  outcome: o,
  me,
  score,
  children,
}: {
  left: TurnT;
  right: TurnT;
  outcome: Outcome;
  me: SideKey | null;
  score?: string;
  children: ReactNode;
}) {
  const w = winnerOf(o);
  const nameOf = (s: SideKey) => (s === "left" ? left.name : right.name);
  let head: string;
  let tone: "win" | "lose" | "draw";
  if (o.kind === "bonk") {
    head = "둘 다 패배 💥";
    tone = "lose";
  } else if (!w) {
    head = "무승부!";
    tone = "draw";
  } else if (me) {
    head = w === me ? "이겼다! 🏆" : "졌다… 😵";
    tone = w === me ? "win" : "lose";
  } else {
    head = `${nameOf(w)} 승리! 🏆`;
    tone = "win";
  }

  const line =
    o.kind === "bite"
      ? `${nameOf(o.biter)}님이 욕심내다 ${nameOf(o.biter === "left" ? "right" : "left")}님 입술을 앙! 깨문 사람이 져요.`
      : o.kind === "bonk"
        ? "둘 다 끝까지 안 멈추다 이마를 쿵! 둘 다 졌어요."
        : `${o.tier.title} — ${o.tier.line}`;

  return (
    <Sheet className="pp-result">
      {score && <p className="pp-display pp-score">나 {score} 컴퓨터</p>}
      <p className={`pp-display pp-result-head pp-result-${tone}`}>{head}</p>
      <div className="pp-result-bars">
        <ResultBar name={left.name} mm={o.left} side="left" win={w === "left"} />
        <ResultBar name={right.name} mm={o.right} side="right" win={w === "right"} />
      </div>
      <p className="pp-sheet-text mt-2">{line}</p>
      <div className="mt-3">{children}</div>
    </Sheet>
  );
}

function ResultBar({ name, mm, side, win }: { name: string; mm: number; side: SideKey; win: boolean }) {
  return (
    <div className={`pp-bar pp-bar-${side}`}>
      <span className="pp-display pp-bar-name">
        {win && "👑 "}
        {name}
      </span>
      <span className="pp-bar-track">
        <span className="pp-bar-fill" style={{ width: `${Math.min(100, (mm / STICK_MM) * 100)}%` }} />
      </span>
      <span className="pp-display pp-bar-cm">{cm(mm)}cm</span>
    </div>
  );
}

/* ───────────── 조각들 ───────────── */

function Sheet({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="pp-sheet-wrap">
      <section className={`pp-sheet ${className}`}>{children}</section>
    </div>
  );
}

function NameField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="pp-display pp-label">내 이름</span>
      <input
        className="pp-input"
        value={value}
        maxLength={NAME_MAX * 2}
        placeholder="이름(최대 8글자)"
        onChange={(e) => onChange(e.target.value)}
        enterKeyHint="done"
      />
    </label>
  );
}

function Rules() {
  return (
    <ol className="pp-rules">
      <li>
        <b>꾹 누르는 동안</b> 막대과자를 먹어요. 갈수록 빨라지고, <b>손을 떼면 멈춰요.</b>
      </li>
      <li>
        도전장 링크를 보내면 친구도 <b>내 기록을 모른 채</b> 정해요.
      </li>
      <li>
        둘을 겹쳐 <b>동시에 먹는 장면</b>이 공개돼요. 더 많이 먹은 사람이 이겨요.
      </li>
      <li>
        만나 버리면? 아직 먹고 있던 사람이 멈춘 사람 입술을 <b>앙!</b> — 깨문 사람이 져요. 둘 다 먹고 있었으면
        이마를 <b>쿵!</b> 둘 다 패배.
      </li>
    </ol>
  );
}

function useToast(): [string | null, (text: string) => void] {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef(0);
  const say = useCallback((next: string) => {
    setText(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setText(null), 2400);
  }, []);
  return [text, say];
}

function Toast({ text }: { text: string | null }) {
  return (
    <p aria-live="polite" className={`pp-toast pp-display ${text ? "pp-toast-on" : ""}`}>
      {text}
    </p>
  );
}
