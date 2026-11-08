"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import {
  type Answer,
  type Challenge,
  cleanName,
  cm,
  duration,
  hashOf,
  judge,
  MAX_MM,
  MIN_MM,
  mouthsAt,
  NAME_MAX,
  type Outcome,
  routeOf,
  SPEED,
  STICK_MM,
} from "./rules";
import { makeSound, type Sound } from "./sound";
import Stage, { type Crumb, type Mood, xOf } from "./Stage";

/* ───────────── 링크(#) 읽기 ───────────── */

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const noop = () => () => {};

/** # 를 바꾼다. 빈 문자열이면 # 없이 처음 화면으로. */
function go(hash: string) {
  if (hash) {
    window.location.hash = hash;
  } else {
    history.pushState(null, "", window.location.pathname + window.location.search);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  window.scrollTo({ top: 0 });
}

const linkFor = (hash: string) => `${window.location.origin}${window.location.pathname}${hash}`;

type ShareResult = "shared" | "copied" | "cancel" | "manual";

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** 휴대폰이면 공유 시트, 안 되면 복사. 인스타 앱 안 브라우저처럼 둘 다 막히면 manual. */
async function shareLink(url: string, text: string): Promise<ShareResult> {
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

/* ───────────── 맨 위 ───────────── */

export default function Game() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash, () => "");
  const [soundOn, setSoundOn] = useState(true);
  /** 「이 폰으로 바로」로 만든 도전장 — 넘겨주기 화면부터 보여 준다. */
  const [handoff, setHandoff] = useState<string | null>(null);

  const route = routeOf(hash);

  return (
    <div className="mx-auto w-full max-w-[560px] px-4">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          className="pp-chip"
          onClick={() => setSoundOn((v) => !v)}
          aria-pressed={soundOn}
        >
          {soundOn ? "🔊 바삭 소리 켬" : "🔇 소리 끔"}
        </button>
      </div>

      {!hydrated ? (
        <div className="pp-card h-[340px] animate-pulse" aria-hidden />
      ) : route.kind === "make" ? (
        <Make
          key="make"
          onHandoff={(game) => {
            const h = hashOf(game);
            setHandoff(h);
            go(h);
          }}
        />
      ) : route.kind === "answer" ? (
        <AnswerView key={hash} game={route.game} soundOn={soundOn} covered={handoff === hash} />
      ) : route.kind === "replay" ? (
        <Replay key={hash} game={route.game} soundOn={soundOn} />
      ) : (
        <div className="pp-card text-center">
          <p className="pp-display text-[22px]">앗, 링크가 부서졌어요 🍫💥</p>
          <p className="mt-2 text-[14px] opacity-70 break-keep">
            복사하다가 끝이 잘렸을 수도 있어요. 보낸 사람한테 링크를 다시 달라고 해 보세요.
          </p>
          <button type="button" className="pp-btn mt-5" onClick={() => go("")}>
            내가 도전장 만들기
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────── 1. 먼저 하는 사람 ───────────── */

function Make({ onHandoff }: { onHandoff: (game: Challenge) => void }) {
  const [name, setName] = useState("");
  const [a, setA] = useState(64);
  const [link, setLink] = useState<string | null>(null);
  const [toast, say] = useToast();

  const game = (): Challenge => ({ a, n: cleanName(name, "도전자") });

  if (link) {
    const text = `🍫 빼빼로 게임 도전장! ${game().n}님이 막대과자를 물고 기다려요. 어디까지 먹을지 골라 봐 — 너무 많이 먹으면 입술 깨문다?`;
    return (
      <section className="pp-card">
        <p className="pp-display text-center text-[24px]">도전장 완성! 📮</p>
        <p className="mt-1 text-center text-[14px] opacity-70 break-keep">
          이 링크를 인스타 DM·카톡으로 보내 보세요. 상대가 자기 자리를 고르면 둘이 같이 먹기 시작해요.
        </p>
        <div className="mt-4">
          <Stage
            left={0}
            right={STICK_MM}
            leftMood="proud"
            rightMood="mystery"
            leftName={game().n}
            rightName="두구두구"
            pickLeft={a}
          />
        </div>
        <label className="mt-4 block">
          <span className="sr-only">도전장 링크</span>
          <input
            readOnly
            value={link}
            className="pp-input text-[13px]"
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="pp-btn"
            onClick={async () => {
              const r = await shareLink(link, text);
              if (r === "copied") say("링크랑 문구를 복사했어요. DM 에 붙여 넣으세요!");
              if (r === "manual") say("위 링크를 꾹 눌러 복사해 주세요");
            }}
          >
            링크 보내기
          </button>
          <button
            type="button"
            className="pp-btn pp-btn-ghost"
            onClick={async () => say((await copy(link)) ? "링크를 복사했어요!" : "위 링크를 꾹 눌러 복사해 주세요")}
          >
            링크만 복사
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" className="pp-btn pp-btn-ghost" onClick={() => onHandoff(game())}>
            옆 사람이랑 이 폰으로
          </button>
          <button type="button" className="pp-btn pp-btn-ghost" onClick={() => setLink(null)}>
            다시 고르기
          </button>
        </div>
        <Toast text={toast} />
      </section>
    );
  }

  return (
    <section className="pp-card">
      <Step n={1} title="내가 먼저 물게요" />
      <NameField value={name} onChange={setName} placeholder="내 이름 (안 적으면 도전자)" />
      <div className="mt-4">
        <Stage
          left={0}
          right={STICK_MM}
          leftMood="idle"
          rightMood="mystery"
          leftName={cleanName(name, "나")}
          rightName="두구두구"
          pickLeft={a}
          onPick={setA}
          caption="막대를 누르거나 끌어서 내가 어디까지 먹을지 고르세요"
        />
      </div>
      <PickSlider value={a} onChange={setA} label="내가 먹을 자리" />
      <p className="mt-2 text-center text-[15px] break-keep">
        왼쪽부터 <b className="text-[#e0577b]">{cm(a)}cm</b> 먹을게요
      </p>
      <p className="mt-1 text-center text-[13px] opacity-60 break-keep">
        상대는 이 자리를 몰라요. 욕심내면 상대가 입술을 깨물 수도 있어요!
      </p>
      <button
        type="button"
        className="pp-btn mt-5 w-full"
        onClick={() => setLink(linkFor(hashOf(game())))}
      >
        도전장 만들기 🍫
      </button>
      <Rules />
    </section>
  );
}

/* ───────────── 2. 받은 사람 ───────────── */

function AnswerView({ game, soundOn, covered }: { game: Challenge; soundOn: boolean; covered: boolean }) {
  const [cover, setCover] = useState(covered);
  const [name, setName] = useState("");
  const [b, setB] = useState(86);
  const [play, setPlay] = useState<{ answer: Answer; sound: Sound; round: number } | null>(null);
  const [toast, say] = useToast();

  if (cover) {
    return (
      <section className="pp-card text-center">
        <p className="text-[48px]">🙈</p>
        <p className="pp-display mt-1 text-[24px] break-keep">폰을 옆 사람한테 넘겨 주세요</p>
        <p className="mt-2 text-[14px] opacity-70 break-keep">{game.n}님은 화면 보지 말기!</p>
        <button type="button" className="pp-btn mt-5" onClick={() => setCover(false)}>
          받았어요
        </button>
      </section>
    );
  }

  if (play) {
    const { answer } = play;
    const outcome = judge(answer.a, answer.b);
    return (
      <section className="pp-card">
        <Bout key={`bout-${play.round}`} game={answer} sound={play.sound} />
        <ResultCard key={`result-${play.round}`} game={answer} outcome={outcome} delay={duration(answer.a, answer.b) + COUNTDOWN}>
          <button
            type="button"
            className="pp-btn"
            onClick={async () => {
              const r = await shareLink(linkFor(hashOf(answer)), shareText(outcome));
              if (r === "copied") say(`결과 링크를 복사했어요. ${answer.n}님한테 보내 주세요!`);
              if (r === "manual") say("공유가 막혀 있어요. 화면을 캡처해서 보내 주세요");
            }}
          >
            {answer.n}님한테 결과 보내기
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="pp-btn pp-btn-ghost"
              onClick={() => setPlay({ ...play, sound: makeSound(soundOn), round: play.round + 1 })}
            >
              다시 보기
            </button>
            <button type="button" className="pp-btn pp-btn-ghost" onClick={() => go("")}>
              내가 도전장 만들기
            </button>
          </div>
        </ResultCard>
        <Toast text={toast} />
      </section>
    );
  }

  return (
    <section className="pp-card">
      <p className="pp-display text-center text-[22px] break-keep">
        <span className="text-[#e0577b]">{game.n}</span>님이 막대과자를 물고 기다려요 🍫
      </p>
      <p className="mt-1 text-center text-[13.5px] opacity-70 break-keep">
        {game.n}님은 이미 어딘가까지 먹기로 정했어요. 짧게 남길수록 좋지만, 너무 먹으면 앙!
      </p>
      <div className="mt-4">
        <Step n={2} title="나는 오른쪽에서 먹을게요" />
        <NameField value={name} onChange={setName} placeholder="내 이름 (안 적으면 상대)" />
      </div>
      <div className="mt-4">
        <Stage
          left={0}
          right={STICK_MM}
          leftMood="idle"
          rightMood="idle"
          leftName={game.n}
          rightName={cleanName(name, "나")}
          pickRight={b}
          onPick={setB}
          caption="막대를 누르거나 끌어서 내가 어디까지 먹을지 고르세요"
        />
      </div>
      <PickSlider value={b} onChange={setB} label="내가 먹을 자리" />
      <p className="mt-2 text-center text-[15px] break-keep">
        오른쪽부터 <b className="text-[#2e9479]">{cm(STICK_MM - b)}cm</b> 먹을게요
      </p>
      <button
        type="button"
        className="pp-btn mt-5 w-full"
        onClick={() =>
          setPlay({ answer: { ...game, b, m: cleanName(name, "상대") }, sound: makeSound(soundOn), round: 0 })
        }
      >
        냠냠 시작!
      </button>
    </section>
  );
}

/* ───────────── 3. 결과 링크를 받은 사람 ───────────── */

function Replay({ game, soundOn }: { game: Answer; soundOn: boolean }) {
  const [play, setPlay] = useState<{ sound: Sound; round: number } | null>(null);

  if (!play) {
    return (
      <section className="pp-card text-center">
        <p className="text-[44px]">📬</p>
        <p className="pp-display mt-1 text-[24px] break-keep">
          {game.n} × {game.m}
          <br />
          빼빼로 게임 결과가 왔어요
        </p>
        <div className="mt-4">
          <Stage
            left={0}
            right={STICK_MM}
            leftMood="idle"
            rightMood="idle"
            leftName={game.n}
            rightName={game.m}
          />
        </div>
        <button
          type="button"
          className="pp-btn mt-5"
          onClick={() => setPlay({ sound: makeSound(soundOn), round: 0 })}
        >
          두근두근 결과 보기 ▶
        </button>
      </section>
    );
  }

  const outcome = judge(game.a, game.b);
  return (
    <section className="pp-card">
      <Bout key={`bout-${play.round}`} game={game} sound={play.sound} />
      <ResultCard key={`result-${play.round}`} game={game} outcome={outcome} delay={duration(game.a, game.b) + COUNTDOWN}>
        <button type="button" className="pp-btn" onClick={() => go("")}>
          한 판 더! 내가 도전장 만들기
        </button>
        <button
          type="button"
          className="pp-btn pp-btn-ghost"
          onClick={() => setPlay({ sound: makeSound(soundOn), round: play.round + 1 })}
        >
          다시 보기
        </button>
      </ResultCard>
    </section>
  );
}

/* ───────────── 먹는 장면 ───────────── */

const COUNTDOWN = 1.1;
/** 깨물 때 입 사이에 남겨 두는 틈(mm) — 입이 붙는 장면은 그리지 않는다 */
const BITE_GAP = 4;
/** 깨문 뒤 둘이 튕겨 나가는 거리(mm) */
const RECOIL = 14;
/** 바삭 소리 간격(초) */
const CRUNCH_EVERY = 0.16;

/** 부스러기 번호 — 다시 보기를 해도 안 겹치게 모듈에서 센다. */
let crumbSeq = 0;

interface LiveCrumb extends Crumb {
  born: number;
}

function Bout({ game, sound }: { game: Answer; sound: Sound }) {
  const [t, setT] = useState(0);
  const [crumbs, setCrumbs] = useState<LiveCrumb[]>([]);
  const outcome = judge(game.a, game.b);
  const total = duration(game.a, game.b);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    let prev = mouthsAt(0, game.a, game.b);
    const nextCrunch = { left: COUNTDOWN, right: COUNTDOWN };
    let ended = false;

    const tick = (now: number) => {
      const el = (now - t0) / 1000;
      const eat = Math.max(0, el - COUNTDOWN);
      const pos = mouthsAt(eat, game.a, game.b);
      const born: LiveCrumb[] = [];

      (["left", "right"] as const).forEach((side) => {
        if (pos[side] === prev[side] || el < nextCrunch[side]) return;
        nextCrunch[side] = el + CRUNCH_EVERY;
        sound.crunch(side === "left" ? -1 : 1);
        for (let i = 0; i < 2; i++) {
          born.push({
            id: crumbSeq++,
            born: el,
            x: xOf(pos[side]) + (side === "left" ? -4 : 4),
            dx: (side === "left" ? -1 : 1) * (6 + Math.random() * 14),
            dy: 26 + Math.random() * 26,
            r: 1.4 + Math.random() * 1.6,
            dark: Math.random() < 0.6,
          });
        }
      });
      prev = pos;

      if (!ended && eat >= total) {
        ended = true;
        if (outcome.kind === "bite") {
          sound.bite();
          navigator.vibrate?.(150);
        } else {
          sound.ding();
        }
      }

      setT(el);
      setCrumbs((cs) => [...cs.filter((c) => el - c.born < 0.8), ...born]);
      if (el < COUNTDOWN + total + 1.2) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [game.a, game.b, sound, total, outcome.kind]);

  const eat = Math.max(0, t - COUNTDOWN);
  const done = eat >= total;
  const pos = shown(eat);
  /**
   * 그리는 자리. 깨무는 판에서는 입이 딱 붙는 순간을 그리지 않는다 —
   * 4mm 앞에서 「앙!」 하고, 둘 다 깜짝 놀라 뒤로 튕겨 나간다.
   */
  function shown(at: number) {
    const p = mouthsAt(at, game.a, game.b);
    if (outcome.kind !== "bite") return p;
    const mid = (p.left + p.right) / 2;
    const half = Math.max(BITE_GAP / 2, (p.right - p.left) / 2);
    const k = Math.min(1, Math.max(0, at - total) / 0.3);
    const recoil = RECOIL * (1 - (1 - k) ** 3);
    return { left: mid - half - recoil, right: mid + half + recoil };
  }

  const moving = (side: "left" | "right") =>
    !done && t >= COUNTDOWN && (side === "left" ? eat < game.a / SPEED : eat < (STICK_MM - game.b) / SPEED);

  const moodOf = (side: "left" | "right"): Mood => {
    if (done && outcome.kind === "bite") {
      const bitten = outcome.biter === "both" || outcome.biter !== side;
      return bitten ? "ouch" : "blush";
    }
    if (moving(side)) return "chomp";
    if (t < COUNTDOWN) return "idle";
    // 멈춘 쪽은 남은 길이가 짧을수록 얼굴이 빨개진다.
    return pos.right - pos.left <= 30 ? "blush" : "proud";
  };

  return (
    <div className="relative">
      <Stage
        left={pos.left}
        right={pos.right}
        leftMood={moodOf("left")}
        rightMood={moodOf("right")}
        leftName={game.n}
        rightName={game.m}
        crumbs={crumbs}
        measure={done && outcome.kind === "ok"}
        bite={done && outcome.kind === "bite" ? outcome.at : null}
        caption={`${game.n}·${game.m} 둘이 막대과자를 양쪽에서 먹는 중`}
      />
      {t < COUNTDOWN && (
        <p key={t < COUNTDOWN / 2 ? "a" : "b"} className="pp-display pp-pop pointer-events-none absolute inset-x-0 top-1 text-center text-[26px] text-[#5b3221]">
          {t < COUNTDOWN / 2 ? "준비…" : "냠!"}
        </p>
      )}
    </div>
  );
}

function shareText(outcome: Outcome) {
  return outcome.kind === "ok"
    ? `🍫 빼빼로 게임 결과: ${cm(outcome.leftMm)}cm 남겼다! [${outcome.tier.title}] 어떻게 됐는지 직접 봐 👀`
    : "🍫 빼빼로 게임 결과: 앙! 입술을 깨물어 버렸다 🩹 어떻게 된 건지 직접 봐 👀";
}

function ResultCard({
  game,
  outcome,
  delay,
  children,
}: {
  game: Answer;
  outcome: Outcome;
  delay: number;
  children: React.ReactNode;
}) {
  const eatenL = cm(game.a);
  const eatenR = cm(STICK_MM - game.b);
  const greedy =
    outcome.kind === "bite"
      ? outcome.biter === "both"
        ? "둘 다 욕심쟁이"
        : `욕심쟁이는 ${outcome.biter === "left" ? game.n : game.m}님`
      : null;

  return (
    <div className="pp-result mt-4" style={{ animationDelay: `${delay + 0.7}s` }}>
      {outcome.kind === "ok" ? (
        <div className="text-center">
          <p className="text-[13px] opacity-60">남은 빼빼로</p>
          <p className="pp-display text-[56px] leading-none text-[#5b3221]">
            {cm(outcome.leftMm)}
            <span className="text-[24px]">cm</span>
          </p>
          <p className="pp-display mt-2 text-[24px] text-[#e0577b]">{outcome.tier.title}</p>
          <p className="mt-1 text-[14px] opacity-75 break-keep">{outcome.tier.line}</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="pp-display text-[28px] text-[#e0577b] break-keep">
            {outcome.biter === "both"
              ? "둘이 동시에 앙!"
              : outcome.biter === "right"
                ? `${game.m}님이 ${game.n}님 입술을 앙!`
                : `${game.n}님이 ${game.m}님 입술을 앙!`}
          </p>
          <p className="mt-1 text-[14px] opacity-75 break-keep">
            {greedy}! 반창고 붙여 줄게요 🩹 다음엔 조금만 덜 먹기
          </p>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[13px]">
        <div className="rounded-2xl bg-[#ffe3ea] px-3 py-2">
          <b>{game.n}</b>
          <br />
          {eatenL}cm 먹기로 했어요
        </div>
        <div className="rounded-2xl bg-[#dcf3ea] px-3 py-2">
          <b>{game.m}</b>
          <br />
          {eatenR}cm 먹기로 했어요
        </div>
      </div>
      <div className="mt-4 grid gap-2">{children}</div>
    </div>
  );
}

/* ───────────── 작은 조각들 ───────────── */

function Step({ n, title }: { n: number; title: string }) {
  return (
    <p className="pp-display flex items-center justify-center gap-2 text-[20px]">
      <span className="pp-step">{n}</span>
      {title}
    </p>
  );
}

function NameField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="mt-3 block">
      <span className="sr-only">이름</span>
      <input
        className="pp-input text-center"
        value={value}
        maxLength={NAME_MAX * 2}
        placeholder={placeholder}
        onChange={(e) => onChange([...e.target.value].slice(0, NAME_MAX).join(""))}
      />
    </label>
  );
}

function PickSlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <input
      type="range"
      className="pp-range mt-2 w-full"
      min={MIN_MM}
      max={MAX_MM}
      step={1}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(+e.target.value)}
    />
  );
}

function Rules() {
  return (
    <details className="pp-rules mt-5 text-[13.5px]">
      <summary className="cursor-pointer font-bold">어떻게 하는 거예요?</summary>
      <ol className="mt-2 list-decimal space-y-1 pl-5 opacity-80 break-keep">
        <li>내가 왼쪽 끝부터 어디까지 먹을지 몰래 고르고 링크를 보내요.</li>
        <li>링크를 받은 친구는 내 자리를 모른 채 오른쪽 끝부터 어디까지 먹을지 골라요.</li>
        <li>둘이 동시에 먹기 시작! 남은 막대가 짧을수록 호흡이 잘 맞는 거예요.</li>
        <li>둘이 고른 자리가 겹치면… 상대 입술을 앙 깨물고 끝나요 🩹</li>
      </ol>
      <p className="mt-2 opacity-60 break-keep">서버에 아무것도 저장하지 않아요. 고른 자리는 링크 안에만 들어 있어요.</p>
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
