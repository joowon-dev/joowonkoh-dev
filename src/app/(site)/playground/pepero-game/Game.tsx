"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import Arena, { Stage } from "./Arena";
import { type Bot, makeBot } from "./bot";
import { useRoom } from "./net";
import {
  cleanName,
  cm,
  COUNTDOWN,
  isRoomCode,
  NAME_MAX,
  newRoomCode,
  other,
  type Outcome,
  type SideKey,
  STICK_MM,
  winnerOf,
} from "./rules";
import { makeSound, type Sound } from "./sound";

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
  window.scrollTo({ top: 0 });
}

type Route = { kind: "home" } | { kind: "practice" } | { kind: "room"; code: string } | { kind: "broken" };

function routeOf(hash: string): Route {
  const h = hash.replace(/^#/, "");
  if (!h) return { kind: "home" };
  if (h === "practice") return { kind: "practice" };
  const m = /^room=([A-Za-z0-9]+)$/.exec(h);
  if (m && isRoomCode(m[1].toUpperCase())) return { kind: "room", code: m[1].toUpperCase() };
  return { kind: "broken" };
}

const roomLink = (code: string) => `${window.location.origin}${window.location.pathname}#room=${code}`;

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** 휴대폰이면 공유 시트, 안 되면 복사. 둘 다 막히면 manual. */
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

export default function Game() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => "");
  const [soundOn, setSoundOn] = useState(true);
  /** 방금 내가 만든 방 — 입장 화면 없이 바로 들어간다 */
  const [created, setCreated] = useState<string | null>(null);

  // 소리는 누르기 안에서만 만들 수 있다. 버튼 핸들러가 unlock() 을 부르고, 게임은 sound() 로 꺼내 쓴다.
  const audio = useRef<{ on: boolean; s: Sound } | null>(null);
  const unlock = useCallback(
    (on = soundOn) => {
      if (!audio.current || audio.current.on !== on) audio.current = { on, s: makeSound(on) };
    },
    [soundOn],
  );
  const sound = useCallback(() => audio.current?.s ?? makeSound(false), []);

  const route = routeOf(hash);

  return (
    <div className="mx-auto w-full max-w-[560px] px-4">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          className="pp-chip"
          onClick={() => {
            setSoundOn(!soundOn);
            unlock(!soundOn);
          }}
          aria-pressed={soundOn}
        >
          {soundOn ? "🔊 소리 켬" : "🔇 소리 끔"}
        </button>
      </div>

      {!hydrated ? (
        <div className="pp-card h-[380px] animate-pulse" aria-hidden />
      ) : route.kind === "home" ? (
        <Home
          onRoom={() => {
            unlock();
            const code = newRoomCode();
            setCreated(code);
            go(`#room=${code}`);
          }}
          onPractice={() => {
            unlock();
            go("#practice");
          }}
        />
      ) : route.kind === "practice" ? (
        <Practice key="practice" unlock={unlock} sound={sound} />
      ) : route.kind === "room" ? (
        <Room key={route.code} code={route.code} entered={created === route.code} unlock={unlock} sound={sound} />
      ) : (
        <div className="pp-card text-center">
          <p className="pp-display text-[22px]">앗, 방 주소가 이상해요 🍫💥</p>
          <p className="mt-2 text-[14px] opacity-70 break-keep">링크 끝이 잘렸을 수도 있어요. 다시 받아 보세요.</p>
          <button type="button" className="pp-btn mt-5" onClick={() => go("")}>
            처음으로
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────── 처음 화면 ───────────── */

function Home({ onRoom, onPractice }: { onRoom: () => void; onPractice: () => void }) {
  const [name, setName] = useState(loadName);
  return (
    <section className="pp-card">
      <div>
        <Stage left={{ at: 0, expr: "idle", name: cleanName(name, "나") }} right={{ at: STICK_MM, expr: "mystery", name: "친구" }} />
      </div>
      <p className="pp-display mt-4 text-center text-[22px] break-keep">먼저 겁먹는 사람이 진다!</p>
      <p className="mt-1 text-center text-[14px] opacity-70 break-keep">
        둘이 동시에 버튼을 꾹 누르면 양쪽에서 냠냠 먹기 시작해요. 손을 떼면 멈춰요.
        <br />더 많이 먹은 사람이 이기지만, 상대가 멈췄는데 계속 먹으면… 입술을 앙!
      </p>
      <NameField value={name} onChange={setName} />
      <button
        type="button"
        className="pp-btn mt-4 w-full"
        onClick={() => {
          saveName(name);
          onRoom();
        }}
      >
        친구랑 대결하기 ⚔️
      </button>
      <button
        type="button"
        className="pp-btn pp-btn-ghost mt-2 w-full"
        onClick={() => {
          saveName(name);
          onPractice();
        }}
      >
        혼자 연습하기 (컴퓨터랑)
      </button>
      <Rules />
    </section>
  );
}

/* ───────────── 혼자 연습 ───────────── */

function Practice({ unlock, sound }: { unlock: () => void; sound: () => Sound }) {
  const [name] = useState(() => cleanName(loadName(), "나"));
  const [bout, setBout] = useState<{ startAt: number; bot: Bot; id: number } | null>(null);
  const [result, setResult] = useState<Outcome | null>(null);
  const [tally, setTally] = useState({ me: 0, cpu: 0 });
  const names = { left: name, right: "컴퓨터" };

  const start = () => {
    unlock();
    setResult(null);
    setBout((b) => ({ startAt: performance.now() + COUNTDOWN * 1000, bot: makeBot(), id: (b?.id ?? 0) + 1 }));
  };

  const getOpp = useCallback(
    (mine: Parameters<Bot>[0], now: number) => (bout ? bout.bot(mine, now) : mine),
    [bout],
  );
  const onEnd = useCallback((o: Outcome) => {
    setResult(o);
    const w = winnerOf(o);
    setTally((t) => ({ me: t.me + (w === "left" ? 1 : 0), cpu: t.cpu + (w === "right" ? 1 : 0) }));
  }, []);

  return (
    <section className="pp-card">
      <Score names={names} me="left" tally={{ left: tally.me, right: tally.cpu }} />
      {!bout ? (
        <>
          <Stage left={{ at: 0, expr: "idle", name: `${name} (나)` }} right={{ at: STICK_MM, expr: "idle", name: "컴퓨터" }} />
          <p className="mt-3 text-center text-[14px] opacity-75 break-keep">
            컴퓨터는 판마다 성격이 달라요. 욕심쟁이일 때도, 겁쟁이일 때도 있어요.
          </p>
          <button type="button" className="pp-btn mt-4 w-full" onClick={start}>
            시작! 🍫
          </button>
        </>
      ) : (
        <>
          <Arena
            key={bout.id}
            me="left"
            names={names}
            startAt={bout.startAt}
            getOpp={getOpp}
            onEnd={onEnd}
            sound={sound}
          />
          {result && (
            <ResultCard outcome={result} me="left" names={names}>
              <button type="button" className="pp-btn" onClick={start}>
                한 판 더!
              </button>
              <button type="button" className="pp-btn pp-btn-ghost" onClick={() => go("")}>
                친구랑 대결하러 가기
              </button>
            </ResultCard>
          )}
        </>
      )}
    </section>
  );
}

/* ───────────── 친구랑 대결 방 ───────────── */

function Room({
  code,
  entered,
  unlock,
  sound,
}: {
  code: string;
  entered: boolean;
  unlock: () => void;
  sound: () => Sound;
}) {
  const [name, setName] = useState(loadName);
  const [joined, setJoined] = useState(entered);

  if (!joined) {
    return (
      <section className="pp-card">
        <p className="pp-display text-center text-[24px] break-keep">빼빼로 대결 초대장이 왔어요 📮</p>
        <p className="mt-1 text-center text-[14px] opacity-70 break-keep">
          들어가면 친구와 동시에 시작해요. 버튼을 꾹 누르는 동안 먹고, 떼면 멈춰요.
        </p>
        <div className="mt-4">
          <Stage left={{ at: 0, expr: "mystery", name: "친구" }} right={{ at: STICK_MM, expr: "idle", name: cleanName(name, "나") }} />
        </div>
        <NameField value={name} onChange={setName} />
        <button
          type="button"
          className="pp-btn mt-4 w-full"
          onClick={() => {
            unlock();
            saveName(name);
            setJoined(true);
          }}
        >
          입장하기
        </button>
        <Rules />
      </section>
    );
  }
  return <RoomLive code={code} name={cleanName(name, "나")} unlock={unlock} sound={sound} />;
}

interface Played {
  round: number;
  outcome: Outcome;
  /** 그 판의 왼쪽·오른쪽 사람 id */
  ids: [string, string];
}

function RoomLive({ code, name, unlock, sound }: { code: string; name: string; unlock: () => void; sound: () => Sound }) {
  const room = useRoom(code, name);
  const { status, left, right, side, go: start, ready, unready, sendInput, inputOf, me } = room;
  const [played, setPlayed] = useState<Played[]>([]);
  const [toast, say] = useToast();

  const round = start?.round ?? null;
  const both = !!left && !!right;
  const finished = round !== null && played.some((p) => p.round === round);
  const playing = both && round !== null && !finished && (side === "left" || side === "right");

  // 판이 시작되면 내 「준비」 표를 내린다
  useEffect(() => {
    if (round !== null) unready();
  }, [round, unready]);

  const mySide: SideKey = side === "right" ? "right" : "left";
  const opp = mySide === "left" ? right : left;
  const iAmReady = (side === "left" ? left : right)?.ready ? true : false;
  const oppReady = !!opp?.ready;

  const getOpp = useCallback(
    () => (round === null ? { press: null, release: null, until: 0 } : inputOf(round, other(mySide))),
    [inputOf, round, mySide],
  );
  const onMine = useCallback(
    (m: Parameters<typeof sendInput>[2]) => {
      if (round !== null) sendInput(round, mySide, m);
    },
    [round, mySide, sendInput],
  );
  const onEnd = useCallback(
    (o: Outcome) => {
      if (round === null || !left || !right) return;
      setPlayed((p) => (p.some((x) => x.round === round) ? p : [...p, { round, outcome: o, ids: [left.id, right.id] }]));
    },
    [round, left, right],
  );

  if (status === "error") {
    return (
      <section className="pp-card text-center">
        <p className="pp-display text-[22px]">연결이 안 돼요 📡</p>
        <p className="mt-2 text-[14px] opacity-70 break-keep">인터넷 연결을 확인하고 다시 들어와 주세요.</p>
        <button type="button" className="pp-btn mt-5" onClick={() => window.location.reload()}>
          다시 연결
        </button>
      </section>
    );
  }
  if (side === "watch") {
    return (
      <section className="pp-card text-center">
        <p className="pp-display text-[22px]">이 방은 꽉 찼어요 🙈</p>
        <p className="mt-2 text-[14px] opacity-70 break-keep">빼빼로 게임은 둘이서만 할 수 있어요.</p>
        <button type="button" className="pp-btn mt-5" onClick={() => go("")}>
          내 방 만들기
        </button>
      </section>
    );
  }

  const names: Record<SideKey, string> = { left: left?.name ?? "…", right: right?.name ?? "친구" };
  // 지금 상대와 둔 판만 센다
  const vs = played.filter((p) => left && right && p.ids[0] === left.id && p.ids[1] === right.id);
  const tally = {
    left: vs.filter((p) => winnerOf(p.outcome) === "left").length,
    right: vs.filter((p) => winnerOf(p.outcome) === "right").length,
  };
  const last = finished ? played.find((p) => p.round === round) : null;

  const invite = async () => {
    const r = await shareLink(
      roomLink(code),
      `🍫 빼빼로 게임 한 판 할래? 버튼 꾹 누르는 동안 먹고 떼면 멈춰. 먼저 겁먹는 사람이 지는 거야!`,
    );
    if (r === "copied") say("초대 링크를 복사했어요. DM·카톡에 붙여 넣으세요!");
    if (r === "manual") say("아래 주소를 꾹 눌러 복사해 주세요");
  };

  // 대결 중이거나, 방금 끝난 판(마지막 장면을 그대로 두고 아래에 결과)
  if (both && start && round !== null && (playing || last) && (side === "left" || side === "right")) {
    return (
      <section className="pp-card">
        <Score names={names} me={mySide} tally={tally} />
        <Arena
          key={start.round}
          me={mySide}
          names={names}
          startAt={start.startAt}
          getOpp={getOpp}
          onMine={onMine}
          onEnd={onEnd}
          sound={sound}
        />
        {last && (
          <ResultCard outcome={last.outcome} me={mySide} names={names}>
            <ReadyButton
              mine={iAmReady}
              theirs={oppReady}
              oppName={opp?.name ?? "친구"}
              onReady={() => {
                unlock();
                ready();
              }}
              label="한 판 더!"
            />
          </ResultCard>
        )}
      </section>
    );
  }

  return (
    <section className="pp-card">
      {both && <Score names={names} me={mySide} tally={tally} />}

          <Stage
            left={{ at: 0, expr: left ? (left.ready ? "proud" : "idle") : "mystery", name: left ? (left.id === me ? `${left.name} (나)` : left.name) : "…" }}
            right={
              right
                ? { at: STICK_MM, expr: right.ready ? "proud" : "idle", name: right.id === me ? `${right.name} (나)` : right.name }
                : { at: STICK_MM, expr: "mystery", name: "친구 기다리는 중" }
            }
          />
          {status === "connecting" ? (
            <p className="pp-display mt-4 text-center text-[18px] opacity-70">방에 들어가는 중…</p>
          ) : !both ? (
            <div className="mt-4">
              <p className="pp-display text-center text-[20px] break-keep">친구를 불러 주세요 📮</p>
              <p className="mt-1 text-center text-[13.5px] opacity-70 break-keep">
                링크를 받은 친구가 들어오면 둘이 준비를 누르고 바로 시작해요. 이 화면은 켜 두세요!
              </p>
              <label className="mt-3 block">
                <span className="sr-only">초대 링크</span>
                <input readOnly value={roomLink(code)} className="pp-input text-[13px]" onFocus={(e) => e.currentTarget.select()} />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" className="pp-btn" onClick={invite}>
                  초대 링크 보내기
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn-ghost"
                  onClick={async () => say((await copy(roomLink(code))) ? "링크를 복사했어요!" : "주소를 꾹 눌러 복사해 주세요")}
                >
                  링크만 복사
                </button>
              </div>
              <p className="pp-waiting mt-4 text-center text-[13px] opacity-60">친구 기다리는 중</p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="pp-display text-center text-[20px] break-keep">
                {names.left} vs {names.right}
              </p>
              <p className="mt-1 text-center text-[13.5px] opacity-70 break-keep">
                둘 다 준비를 누르면 3초 뒤 시작! 카운트다운 동안 미리 꾹 누르고 있어도 돼요.
              </p>
              <ReadyButton
                mine={iAmReady}
                theirs={oppReady}
                oppName={opp?.name ?? "친구"}
                onReady={() => {
                  unlock();
                  ready();
                }}
                label="준비!"
              />
            </div>
          )}
      {both && <Rules />}
      <Toast text={toast} />
    </section>
  );
}

function ReadyButton({
  mine,
  theirs,
  oppName,
  onReady,
  label,
}: {
  mine: boolean;
  theirs: boolean;
  oppName: string;
  onReady: () => void;
  label: string;
}) {
  return (
    <div className="mt-4 grid gap-2">
      <button type="button" className={`pp-btn w-full ${mine ? "pp-btn-wait" : ""}`} disabled={mine} onClick={onReady}>
        {mine ? `${oppName}님 기다리는 중…` : label}
      </button>
      <p className="text-center text-[13px] opacity-70">
        {theirs ? `✅ ${oppName}님은 준비 완료!` : `${oppName}님은 아직 준비 전`}
      </p>
    </div>
  );
}

/* ───────────── 결과 ───────────── */

function Score({ names, me, tally }: { names: Record<SideKey, string>; me: SideKey; tally: Record<SideKey, number> }) {
  return (
    <div className="pp-score pp-display mb-3">
      <span className="truncate text-right">{names.left}{me === "left" ? " (나)" : ""}</span>
      <b>
        {tally.left} : {tally.right}
      </b>
      <span className="truncate">{names.right}{me === "right" ? " (나)" : ""}</span>
    </div>
  );
}

function ResultCard({
  outcome,
  me,
  names,
  children,
}: {
  outcome: Outcome;
  me: SideKey;
  names: Record<SideKey, string>;
  children: React.ReactNode;
}) {
  const w = winnerOf(outcome);
  const head = w === null ? (outcome.kind === "bonk" ? "둘 다 패배 💥" : "무승부!") : w === me ? "이겼다! 🏆" : "졌다… 😵";

  let line: React.ReactNode;
  if (outcome.kind === "bite") {
    const biter = names[outcome.biter];
    const bitten = names[other(outcome.biter)];
    line = (
      <>
        <p className="pp-display text-[22px] text-[#e0577b] break-keep">
          {biter}님이 {bitten}님 입술을 앙!
        </p>
        <p className="mt-1 text-[14px] opacity-75 break-keep">상대가 멈췄는데 계속 먹으면 반칙패예요. {bitten}님한테 반창고 🩹</p>
      </>
    );
  } else if (outcome.kind === "bonk") {
    line = (
      <>
        <p className="pp-display text-[22px] text-[#e0577b] break-keep">둘 다 끝까지 버티다 이마를 쿵!</p>
        <p className="mt-1 text-[14px] opacity-75 break-keep">아무도 안 멈추면 둘 다 져요. 누군가는 겁을 먹어야…</p>
      </>
    );
  } else {
    line = (
      <>
        <p className="text-[13px] opacity-60">남은 빼빼로</p>
        <p className="pp-display text-[52px] leading-none text-[#5b3221]">
          {cm(outcome.rest)}
          <span className="text-[22px]">cm</span>
        </p>
        <p className="pp-display mt-2 text-[20px] text-[#e0577b]">{outcome.tier.title}</p>
        <p className="mt-1 text-[13.5px] opacity-75 break-keep">{outcome.tier.line}</p>
      </>
    );
  }

  return (
    <div className="pp-result mt-4">
      <div className="text-center">
        <p className={`pp-display pp-pop text-[34px] ${w === me ? "text-[#e0577b]" : "text-[#5b3221]"}`}>{head}</p>
        <div className="mt-2">{line}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[13px]">
        {(["left", "right"] as const).map((s) => (
          <div key={s} className={`pp-eat pp-eat-${s}`}>
            <b className="block truncate">
              {names[s]}
              {s === me ? " (나)" : ""}
            </b>
            <span className="pp-display text-[20px]">{cm(outcome[s])}</span>cm 먹음
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">{children}</div>
    </div>
  );
}

/* ───────────── 작은 조각들 ───────────── */

function NameField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="mt-4 block">
      <span className="sr-only">내 이름</span>
      <input
        className="pp-input text-center"
        value={value}
        maxLength={NAME_MAX * 2}
        placeholder="내 이름 (안 적으면 「나」)"
        onChange={(e) => onChange([...e.target.value].slice(0, NAME_MAX).join(""))}
      />
    </label>
  );
}

function Rules() {
  return (
    <details className="pp-rules mt-5 text-[13.5px]">
      <summary className="cursor-pointer font-bold">어떻게 하는 거예요?</summary>
      <ol className="mt-2 list-decimal space-y-1 pl-5 opacity-80 break-keep">
        <li>「3·2·1·냠!」 하면 버튼을 꾹 누르는 동안 막대를 먹어요. 갈수록 빨라져요.</li>
        <li>손을 떼면 그 자리에서 멈춰요. 그 판에선 다시 못 먹어요.</li>
        <li>둘 다 멈추면 더 많이 먹은 사람이 이겨요.</li>
        <li>상대가 멈췄는데 계속 먹으면 입술을 앙 — 깨문 사람이 져요 🩹</li>
        <li>둘 다 끝까지 안 멈추면 이마를 쿵 — 둘 다 져요 💥</li>
      </ol>
      <p className="mt-2 opacity-60 break-keep">대결 중 누른·뗀 시각만 실시간으로 오가고, 아무것도 저장하지 않아요.</p>
    </details>
  );
}

function useToast(): [string | null, (text: string) => void] {
  const [text, setText] = useState<string | null>(null);
  const say = (next: string) => {
    setText(next);
    window.setTimeout(() => setText((cur) => (cur === next ? null : cur)), 2600);
  };
  return [text, say];
}

function Toast({ text }: { text: string | null }) {
  return (
    <p aria-live="polite" className={`pp-toast ${text ? "pp-toast-on" : ""}`}>
      {text}
    </p>
  );
}
