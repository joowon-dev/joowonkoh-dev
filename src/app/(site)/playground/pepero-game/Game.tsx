"use client";

import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { botTurn } from "./bot";
import { type Entry, fetchChallenge, fetchStats, recordMatch, type Stats, topPercent } from "./db";
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
  judge,
  type Turn as TurnT,
  winnerOf,
} from "./rules";
import { Scene } from "./scene";
import { makeSound, type Sound } from "./sound";
import Turn from "./Turn";

/**
 * 막대과자 게임 — 링크로 차례를 주고받는다.
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
  | { kind: "mine" }
  | { kind: "challenge"; code: string; from: TurnT }
  | { kind: "result"; code: string; left: TurnT; right: TurnT }
  | { kind: "broken" };

function routeOf(hash: string): Route {
  const h = hash.replace(/^#/, "");
  if (!h) return { kind: "home" };
  if (h === "make") return { kind: "make" };
  if (h === "practice") return { kind: "practice" };
  if (h === "mine") return { kind: "mine" };
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

/** 이 브라우저에서 만든 도전장 — 내 링크로 다시 들어오면 친구들 결과를 보여 준다 */
const MINE_KEY = "pp-mine";
const loadMine = (): string[] => {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(MINE_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
};
const addMine = (code: string) => {
  try {
    localStorage.setItem(MINE_KEY, JSON.stringify([code, ...loadMine().filter((c) => c !== code)].slice(0, 30)));
  } catch {
    /* 저장이 막혀 있으면 내 도전장 결과는 결과 링크로만 */
  }
};

/**
 * 이 브라우저에서 이미 끝낸 도전장 → 그 판의 결과 링크 코드.
 * 한 번 하면 상대가 몇 cm 먹었는지 알게 되니, 같은 도전장은 한 번만 — 다시 열면 결과만 보여 준다.
 */
const PLAYED_KEY = "pp-played";
const loadPlayed = (): Record<string, string> => {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(PLAYED_KEY) ?? "{}");
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, string>) : {};
  } catch {
    return {};
  }
};
const markPlayed = (challenge: string, result: string) => {
  try {
    const all = Object.entries(loadPlayed()).filter(([c]) => c !== challenge).slice(-49);
    localStorage.setItem(PLAYED_KEY, JSON.stringify(Object.fromEntries([...all, [challenge, result]])));
  } catch {
    /* 저장이 막혀 있으면 막을 방법이 없다 — 게임은 된다 */
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
      case "mine":
        body = <MineList />;
        break;
      case "challenge": {
        // 내가 만든 도전장 → 친구들 결과 / 이미 한 도전장 → 내 판 결과 / 처음 → 도전
        const done = loadPlayed()[route.code];
        const both = done ? decodeResult(done) : null;
        body = loadMine().includes(route.code) ? (
          <MyChallenge key={route.code} code={route.code} from={route.from} say={say} />
        ) : both ? (
          <ResultView key={route.code} left={both.left} right={both.right} audio={a} again say={say} />
        ) : (
          <Challenge key={route.code} code={route.code} from={route.from} audio={a} say={say} />
        );
        break;
      }
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [hall, setHall] = useState(false);
  const [mine] = useState(loadMine);
  useEffect(() => {
    let live = true;
    fetchStats().then((s) => live && setStats(s));
    return () => {
      live = false;
    };
  }, []);
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
          막대과자
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
        {mine.length > 0 && (
          <button
            type="button"
            className="pp-btn pp-btn-ghost mt-2 w-full"
            onClick={() => go(mine.length === 1 ? `#c=${mine[0]}` : "#mine")}
          >
            📬 내 도전장 결과 보기
          </button>
        )}
        {rules && <Rules />}
        {stats && stats.total > 0 && (
          <div className="pp-stats">
            <p>
              지금까지 <b>{stats.total.toLocaleString()}판</b> · 오늘 <b>{stats.today.toLocaleString()}판</b> · 이마 쿵{" "}
              <b>{stats.bonk.toLocaleString()}번</b>
            </p>
            {stats.top.length > 0 && (
              <button type="button" className="pp-stats-toggle" onClick={() => setHall(!hall)}>
                {hall ? "닫기" : "🏆 찰떡 호흡 TOP 5"}
              </button>
            )}
            {hall && (
              <ol className="pp-hall">
                {stats.top.map((t, i) => (
                  <li key={i}>
                    <span className="pp-hall-rank">{i + 1}</span>
                    <span className="pp-hall-names">
                      {t.l} · {t.r}
                    </span>
                    <span className="pp-hall-rest">{cm(t.rest)}cm 남김</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
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
    // 보낸 도전장만 「내 도전장」으로 기억한다(다시 정하기로 버린 건 빼고)
    const code = encodeChallenge(mine);
    addMine(code);
    const r = await shareLink(
      linkTo(`c=${code}`),
      `🍫 ${name}의 막대과자 도전장! 나는 이미 얼마나 먹을지 정했어. 너는? 먼저 겁먹는 사람이 진다!`,
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
          <br />
          결과는 <b>내가 보낸 링크로 다시 들어오면</b> 볼 수 있어요.
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

function Challenge({
  code,
  from: fromLink,
  audio,
  say,
}: {
  code: string;
  from: TurnT;
  audio: Audio;
  say: (t: string) => void;
}) {
  // 링크에서 읽은 값은 그릴 때마다 새 객체라, 처음 것을 붙잡아 둔다(다시 틀기 방지).
  const [from] = useState(fromLink);
  const [name, setName] = useState(loadName);
  const [phase, setPhase] = useState<"intro" | "turn" | "replay" | "done">("intro");
  const [mine, setMine] = useState<TurnT | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
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
            막대과자 대결을 걸었어요!
          </h1>
        </header>
        <Sheet>
          <p className="pp-sheet-text">
            {from.name}님은 이미 얼마나 먹을지 정했어요. <b>몇 cm인지는 비밀!</b>
            <br />
            꾹 누르는 동안 먹고, 떼면 멈춰요. 더 많이 먹으면 이기지만, 둘이 합쳐 15cm를 넘으면… 이마를{" "}
            <b>쿵!</b>
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
          const turn = { name: me, ...t };
          const result = encodeResult(from, turn);
          // 결과를 보기 전에 잠근다 — 새로고침해도 다시 못 하고 이 판 결과만 보인다.
          // 기록도 지금 남겨야 공개 장면 중에 나가도 도전자 화면에 뜬다.
          markPlayed(code, result);
          recordMatch(result, from, turn, judge(from, turn), code).then(setStats);
          setMine(turn);
          setPhase("replay");
        }}
      />
    );
  }

  const sendBack = async () => {
    const r = await shareLink(
      linkTo(`r=${encodeResult(from, mine)}`),
      `🍫 ${from.name} vs ${mine.name} 막대과자 대결 결과 나왔어! 동시에 먹으면 어떻게 됐을지 보러 와`,
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
        <ResultPanel left={from} right={mine} outcome={outcome} me="right" stats={stats}>
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

/* ───────────── 내 도전장(내가 만든 링크로 다시 들어왔을 때) ───────────── */

function MyChallenge({ code, from, say }: { code: string; from: TurnT; say: (t: string) => void }) {
  const [list, setList] = useState<Entry[] | null | "loading">("loading");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    fetchChallenge(code).then((l) => live && setList(l));
    return () => {
      live = false;
    };
  }, [code, tick]);

  const eaten = eatenOf(from);
  const resend = async () => {
    const r = await shareLink(
      linkTo(`c=${code}`),
      `🍫 ${from.name}의 막대과자 도전장! 나는 이미 얼마나 먹을지 정했어. 너는? 먼저 겁먹는 사람이 진다!`,
    );
    if (r === "copied") say("링크를 복사했어요! 친구에게 붙여 넣어 보내세요");
    if (r === "manual") say("복사가 막혀 있어요");
  };

  // 친구 판마다 내 쪽(왼쪽)에서 본 한 줄
  const rows = (Array.isArray(list) ? list : []).flatMap((e) => {
    const both = decodeResult(e.code);
    if (!both) return [];
    const o = judge(both.left, both.right);
    const w = winnerOf(o);
    const tag =
      o.kind === "bonk"
        ? "둘 다 쿵 💥"
        : o.kind === "bump"
          ? o.by === "left"
            ? "내가 들이받음 😵"
            : "친구가 들이받음 🏆"
          : w === "left"
            ? "내가 이김 🏆"
            : w === "right"
              ? "친구가 이김 😵"
              : "무승부";
    return [{ ...e, tag, win: w === "left" }];
  });

  return (
    <>
      <Scene
        left={{ at: eaten, expr: "hold", name: from.name, heat: 0.3 }}
        right={{ at: STICK_MM, expr: "shadow", name: "친구들" }}
        cam={{ at: (eaten + STICK_MM) / 2, span: ((STICK_MM - eaten) * 0.04) / 2 + 3, lift: 0.2 }}
      />
      <Sheet>
        <p className="pp-display pp-sheet-kicker">내 도전장 · {cm(eaten)}cm 먹고 멈춤</p>
        <p className="pp-display pp-sheet-title">
          {list === "loading"
            ? "결과 불러오는 중…"
            : list === null
              ? "결과를 못 불러왔어요"
              : rows.length
                ? `${rows.length}명이 도전했어요!`
                : "아직 아무도 안 했어요"}
        </p>
        {rows.length > 0 ? (
          <ul className="pp-mine">
            {rows.map((e) => (
              <li key={e.code}>
                <button type="button" onClick={() => go(`#r=${e.code}`)}>
                  <span className="pp-mine-name">{e.name}</span>
                  <span className={`pp-mine-tag ${e.win ? "pp-mine-win" : ""}`}>{e.tag}</span>
                  <span className="pp-mine-go">보기 ▶</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          list !== "loading" && <p className="pp-sheet-text">친구가 이 링크로 하고 나면 여기에 결과가 떠요.</p>
        )}
        <button type="button" className="pp-btn pp-btn-big mt-3 w-full" onClick={resend}>
          친구에게 도전장 보내기 📮
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" className="pp-btn pp-btn-ghost w-full" onClick={() => setTick(tick + 1)}>
            새로고침
          </button>
          <button type="button" className="pp-btn pp-btn-ghost w-full" onClick={() => go("#make")}>
            새 도전장
          </button>
        </div>
      </Sheet>
    </>
  );
}

/* ───────────── 내 도전장 목록(여러 개 보냈을 때) ───────────── */

function MineList() {
  const [list] = useState(() =>
    loadMine().flatMap((code) => {
      const t = decodeChallenge(code);
      return t ? [{ code, t }] : [];
    }),
  );
  return (
    <>
      <Scene
        left={{ at: 0, expr: "hold", name: list[0]?.t.name ?? "나", heat: 0.3 }}
        right={{ at: STICK_MM, expr: "shadow", name: "친구들" }}
        cam={{ at: STICK_MM / 2, span: 5.6, lift: 0.2 }}
      />
      <Sheet>
        <p className="pp-display pp-sheet-title">내가 보낸 도전장</p>
        {list.length ? (
          <ul className="pp-mine">
            {list.map(({ code, t }, i) => (
              <li key={code}>
                <button type="button" onClick={() => go(`#c=${code}`)}>
                  <span className="pp-mine-name">{i === 0 ? "가장 최근 도전장" : `도전장 ${list.length - i}`}</span>
                  <span className="pp-mine-tag">{cm(eatenOf(t))}cm 먹음</span>
                  <span className="pp-mine-go">결과 ▶</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pp-sheet-text">아직 보낸 도전장이 없어요.</p>
        )}
        <button type="button" className="pp-btn pp-btn-big mt-3 w-full" onClick={() => go("#make")}>
          새 도전장 만들기 🔥
        </button>
      </Sheet>
    </>
  );
}

/* ───────────── 결과 링크 ───────────── */

function ResultView({
  left: l0,
  right: r0,
  audio,
  again = false,
  say,
}: {
  left: TurnT;
  right: TurnT;
  audio: Audio;
  /** 받은 사람이 이미 한 도전장을 다시 열었다 — 다시 하기 대신 내 판 결과 */
  again?: boolean;
  say?: (t: string) => void;
}) {
  const [{ left, right }] = useState({ left: l0, right: r0 });
  const [phase, setPhase] = useState<"ready" | "replay" | "done">("ready");
  const [round, setRound] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

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
          <p className="pp-display pp-hero-kicker">{again ? "이미 도전한 판이에요" : "막대과자 대결 결과"}</p>
          <h1 className="pp-display pp-hero-title pp-hero-title-sm">
            {left.name} <span className="pp-vs-inline">VS</span> {right.name}
          </h1>
        </header>
        <Sheet>
          <p className="pp-sheet-text">
            {again
              ? "도전장 하나에 한 번만 할 수 있어요. 내가 한 판을 다시 볼 수 있어요."
              : "둘 다 상대 기록을 모른 채 정했어요. 동시에 먹으면 어떻게 될까?"}
          </p>
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
          // 받은 사람이 이미 기록했으면 같은 판이라 한 번만 남는다
          if (!stats) recordMatch(encodeResult(left, right), left, right, o).then(setStats);
        }}
      />
      {phase === "done" && outcome && (
        <ResultPanel left={left} right={right} outcome={outcome} me={again ? "right" : null} stats={stats}>
          {again && say ? (
            <button
              type="button"
              className="pp-btn pp-btn-big w-full"
              onClick={async () => {
                const r = await shareLink(
                  linkTo(`r=${encodeResult(left, right)}`),
                  `🍫 ${left.name} vs ${right.name} 막대과자 대결 결과 나왔어! 동시에 먹으면 어떻게 됐을지 보러 와`,
                );
                if (r === "copied") say("결과 링크를 복사했어요!");
                if (r === "manual") say("복사가 막혀 있어요");
              }}
            >
              {left.name}님에게 결과 보내기 📮
            </button>
          ) : (
            <button type="button" className="pp-btn pp-btn-big w-full" onClick={() => go("#make")}>
              다시 붙자! 도전장 만들기 🔥
            </button>
          )}
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
  stats = null,
  children,
}: {
  left: TurnT;
  right: TurnT;
  outcome: Outcome;
  me: SideKey | null;
  score?: string;
  stats?: Stats | null;
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
    o.kind === "bump"
      ? `${nameOf(o.by)}님이 욕심내다 ${nameOf(o.by === "left" ? "right" : "left")}님 이마를 쿵! 들이받은 사람이 져요.`
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
      {stats && <RankLine stats={stats} outcome={o} />}
      <div className="mt-3">{children}</div>
    </Sheet>
  );
}

/** 지금까지 쌓인 판과 견줘 이 판이 어디쯤인지 */
function RankLine({ stats, outcome }: { stats: Stats; outcome: Outcome }) {
  const pct = outcome.kind === "ok" ? topPercent(stats) : null;
  const text =
    outcome.kind === "ok"
      ? pct !== null
        ? `지금까지 끝까지 간 ${stats.ok.toLocaleString()}판 중 상위 ${pct}%의 호흡!`
        : `지금까지 끝까지 간 판은 ${stats.ok.toLocaleString()}판이에요`
      : `지금까지 ${stats.total.toLocaleString()}판 중 ${stats.bonk.toLocaleString()}판이 이마 쿵으로 끝났어요`;
  return <p className="pp-display pp-rank mt-2">{text}</p>;
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
        만나 버리면 이마를 <b>쿵!</b> 아직 먹고 있던 사람이 멈춘 사람을 들이받은 거라 그 사람이 져요. 둘 다
        먹고 있었으면 둘 다 패배.
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
