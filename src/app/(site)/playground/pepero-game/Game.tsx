"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { BITE_STEP, camZoom, slowFactor, stepped, visibleGap } from "./motion";
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
  STICK_MM,
} from "./rules";
import { makeSound, type Sound } from "./sound";
import type { Crumb, Expr, Side } from "./Scene3D";

/** 3D 무대는 브라우저에서만 — three.js 를 처음 화면에 안 싣고 따로 받는다. */
const Stage = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => <div className="pp-3d-loading w-full" style={{ aspectRatio: "500 / 290" }} aria-hidden />,
});

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

/** 많이 먹으려 할수록 얼굴이 긴장한다(고르는 동안). */
const pickExpr = (eatMm: number): Expr => (eatMm > 80 ? "nervous" : "idle");

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
        <button type="button" className="pp-chip" onClick={() => setSoundOn((v) => !v)} aria-pressed={soundOn}>
          {soundOn ? "🔊 소리 켬" : "🔇 소리 끔"}
        </button>
      </div>

      {!hydrated ? (
        <div className="pp-card h-[380px] animate-pulse" aria-hidden />
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
  const me = (expr: Expr): Side => ({ at: 0, expr, name: cleanName(name, "나") });
  const stranger: Side = { at: STICK_MM, expr: "mystery", name: "두구두구" };

  if (link) {
    const text = `🍫 빼빼로 게임 도전장! ${game().n}님이 막대과자를 물고 기다려요. 어디까지 먹을지 골라 봐 — 너무 많이 먹으면 입술 깨문다?`;
    return (
      <section className="pp-card">
        <p className="pp-display text-center text-[24px]">도전장 완성! 📮</p>
        <p className="mt-1 text-center text-[14px] opacity-70 break-keep">
          이 링크를 인스타 DM·카톡으로 보내 보세요. 상대가 자기 자리를 고르면 둘이 같이 먹기 시작해요.
        </p>
        <div className="mt-4">
          <Stage left={{ ...me("proud"), bubble: "기다릴게!" }} right={stranger} pickLeft={a} />
        </div>
        <label className="mt-4 block">
          <span className="sr-only">도전장 링크</span>
          <input readOnly value={link} className="pp-input text-[13px]" onFocus={(e) => e.currentTarget.select()} />
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
      <div className="mt-3">
        <Stage
          left={me(pickExpr(a))}
          right={stranger}
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
      <button type="button" className="pp-btn mt-5 w-full" onClick={() => setLink(linkFor(hashOf(game())))}>
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
  const [shown, setShown] = useState(false);
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
        <Bout key={`bout-${play.round}`} game={answer} sound={play.sound} onDone={() => setShown(true)} />
        {shown && (
          <ResultCard key={`result-${play.round}`} game={answer} outcome={outcome}>
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
                onClick={() => {
                  setShown(false);
                  setPlay({ ...play, sound: makeSound(soundOn), round: play.round + 1 });
                }}
              >
                다시 보기
              </button>
              <button type="button" className="pp-btn pp-btn-ghost" onClick={() => go("")}>
                내가 도전장 만들기
              </button>
            </div>
          </ResultCard>
        )}
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
      <div className="mt-3">
        <Stage
          left={{ at: 0, expr: "idle", name: game.n }}
          right={{ at: STICK_MM, expr: pickExpr(STICK_MM - b), name: cleanName(name, "나") }}
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
  const [shown, setShown] = useState(false);

  if (!play) {
    return (
      <section className="pp-card text-center">
        <p className="pp-display text-[24px] break-keep">
          {game.n} × {game.m}
          <br />
          빼빼로 게임 결과가 왔어요 📬
        </p>
        <div className="mt-4">
          <Stage
            left={{ at: 0, expr: "idle", name: game.n }}
            right={{ at: STICK_MM, expr: "idle", name: game.m }}
          />
        </div>
        <button type="button" className="pp-btn mt-5" onClick={() => setPlay({ sound: makeSound(soundOn), round: 0 })}>
          두근두근 결과 보기 ▶
        </button>
      </section>
    );
  }

  const outcome = judge(game.a, game.b);
  return (
    <section className="pp-card">
      <Bout key={`bout-${play.round}`} game={game} sound={play.sound} onDone={() => setShown(true)} />
      {shown && (
        <ResultCard key={`result-${play.round}`} game={game} outcome={outcome}>
          <button type="button" className="pp-btn" onClick={() => go("")}>
            한 판 더! 내가 도전장 만들기
          </button>
          <button
            type="button"
            className="pp-btn pp-btn-ghost"
            onClick={() => {
              setShown(false);
              setPlay({ sound: makeSound(soundOn), round: play.round + 1 });
            }}
          >
            다시 보기
          </button>
        </ResultCard>
      )}
    </section>
  );
}

/* ───────────── 먹는 장면 ───────────── */

/** 「준비~ 냠!」 시간(초) */
const COUNTDOWN = 1.3;
/** 깨문 뒤 둘이 튕겨 나가는 거리(mm) */
const RECOIL = 16;
/** 다 먹고 막대가 똑 부러질 때 둘이 물러나는 거리(mm) */
const PULL_BACK = 12;
/** 이보다 가까우면 두근두근 */
const TENSE_GAP = 30;
/** 장면이 끝나고 결과 카드가 뜨기까지(초) */
const AFTER = { ok: 1.3, bite: 1.6 };

/** 부스러기 번호 — 다시 보기를 해도 안 겹치게 모듈에서 센다. */
let crumbSeq = 0;

interface LiveCrumb extends Crumb {
  /** 태어난 실제 시각 — 0.8초 지나면 치운다 */
  born: number;
}

interface Frame {
  /** 시작부터 흐른 실제 시간(초) */
  real: number;
  /** 슬로모션을 반영한 장면 시간(초) */
  sim: number;
  /** 장면이 끝난 실제 시각 */
  endedAt: number | null;
  crumbs: LiveCrumb[];
}

function Bout({ game, sound, onDone }: { game: Answer; sound: Sound; onDone: () => void }) {
  const [frame, setFrame] = useState<Frame>({ real: 0, sim: 0, endedAt: null, crumbs: [] });
  const outcome = judge(game.a, game.b);
  const total = duration(game.a, game.b);
  const final = mouthsAt(total, game.a, game.b);

  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    let last = t0;
    let sim = 0;
    let endedAt: number | null = null;
    let done = false;
    let nextBeat = 0;
    const bites = { left: 0, right: 0 };
    let crumbs: LiveCrumb[] = [];
    const kind = judge(game.a, game.b).kind;

    const tick = (now: number) => {
      const real = (now - t0) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (real >= COUNTDOWN && endedAt === null) {
        const p = mouthsAt(sim, game.a, game.b);
        sim = Math.min(total, sim + dt * slowFactor(p.right - p.left));
        if (sim >= total) {
          endedAt = real;
          if (kind === "bite") {
            sound.bite();
            navigator.vibrate?.(160);
          } else {
            sound.ding();
          }
        }
      }

      const pos = mouthsAt(sim, game.a, game.b);
      const gap = pos.right - pos.left;
      const born: LiveCrumb[] = [];
      const eaten = { left: pos.left, right: STICK_MM - pos.right };
      (["left", "right"] as const).forEach((side) => {
        const n = Math.floor(eaten[side] / BITE_STEP);
        if (n <= bites[side]) return;
        bites[side] = n;
        sound.crunch(side === "left" ? -1 : 1);
        const c = (pos.left + pos.right) / 2;
        const h = visibleGap(gap) / 2;
        const at = side === "left" ? c - h : c + h;
        for (let i = 0; i < 4; i++) {
          born.push({ id: crumbSeq++, born: real, at, dir: side === "left" ? -1 : 1, seed: Math.random() * 1000 });
        }
      });

      if (endedAt === null && real >= COUNTDOWN && gap < TENSE_GAP && real >= nextBeat) {
        sound.heartbeat();
        nextBeat = real + 0.62;
      }

      crumbs = [...crumbs.filter((c) => real - c.born < 0.8), ...born];
      setFrame({ real, sim, endedAt, crumbs });

      if (endedAt !== null && !done && real - endedAt >= AFTER[kind]) {
        done = true;
        doneRef.current();
      }
      if (endedAt === null || real - endedAt < AFTER[kind] + 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [game.a, game.b, sound, total]);

  const { real, sim, endedAt, crumbs } = frame;
  const ended = endedAt !== null;
  const after = ended ? real - endedAt : 0;
  const counting = real < COUNTDOWN;

  // 판정용 자리 → 한 입씩 끊어서 보여 줄 자리
  const raw = mouthsAt(sim, game.a, game.b);
  const stepL = stepped(raw.left, final.left);
  const stepR = STICK_MM - stepped(STICK_MM - raw.right, STICK_MM - final.right);
  const realGap = stepR - stepL;
  // 화면 속 틈은 가까울수록 눌러서 그린다 — 얼굴이 맞닿아 보이는 순간은 없다.
  // 끝나면 깨문 판은 튕겨 나가고, 아닌 판은 막대가 똑 부러지며 둘 다 물러난다.
  const back =
    !ended
      ? 0
      : outcome.kind === "bite"
        ? RECOIL * (1 - (1 - Math.min(1, after / 0.28)) ** 3)
        : after < 0.2
          ? 0
          : PULL_BACK * (1 - (1 - Math.min(1, (after - 0.2) / 0.3)) ** 3);
  const half = visibleGap(realGap) / 2 + back;
  const center = (stepL + stepR) / 2;
  const left = center - half;
  const right = center + half;
  const gap = realGap;
  const moving = {
    left: !ended && !counting && raw.left < final.left,
    right: !ended && !counting && raw.right > final.right,
  };

  const exprOf = (side: "left" | "right"): Expr => {
    if (ended && outcome.kind === "bite") return outcome.biter === side ? "oops" : "ouch";
    if (ended && outcome.kind === "ok") return after < 0.2 ? "nervous" : outcome.leftMm <= 60 ? "proud" : "meh";
    if (moving[side]) return gap < 14 ? "nervous" : "chew";
    if (counting) return "idle";
    return gap < TENSE_GAP ? "nervous" : "idle";
  };

  const bubbleOf = (side: "left" | "right"): string | null => {
    if (!ended) return null;
    if (outcome.kind === "bite") {
      if (after < 0.45) return null;
      return outcome.biter === side ? "미안…!" : "아야!";
    }
    if (after < 0.55) return null;
    if (outcome.leftMm > 60) return "…";
    if (outcome.leftMm <= TENSE_GAP) return side === "left" ? "휴…!" : "아슬아슬!";
    return null;
  };

  const side = (s: "left" | "right"): Side => ({
    at: s === "left" ? left : right,
    expr: exprOf(s),
    name: s === "left" ? game.n : game.m,
    bubble: bubbleOf(s),
  });

  const tense = !ended && !counting && gap < TENSE_GAP;
  // 끝나면 카메라가 천천히 물러나 둘 다·말풍선·이름표가 다 보이게 한다.
  const pullOut = ended ? Math.min(1, Math.max(0, after - 0.15) / 0.6) : 0;
  const zoom = 1 + (camZoom(right - left) - 1) * (1 - pullOut);
  const ok = outcome.kind === "ok";

  return (
    <div className={`relative overflow-hidden rounded-[20px] ${tense ? "pp-tense" : ""}`}>
      <Stage
        left={side("left")}
        right={side("right")}
        crumbs={crumbs}
        cam={{ at: (left + right) / 2, zoom: zoom }}
        piece={ok && ended && after >= 0.2 ? outcome.leftMm : null}
        sparkle={ok && ended && after > 0.3 && outcome.leftMm <= TENSE_GAP}
        confetti={ok && ended && after > 0.3 && outcome.leftMm <= 5}
        bite={!ok && ended ? (outcome.kind === "bite" ? outcome.at : null) : null}
        caption={`${game.n}·${game.m} 둘이 막대과자를 양쪽에서 먹는 중`}
      />
      {counting && (
        <p
          key={real < COUNTDOWN * 0.6 ? "ready" : "go"}
          className="pp-display pp-pop pointer-events-none absolute inset-x-0 top-2 text-center text-[30px] text-[#5b3221]"
        >
          {real < COUNTDOWN * 0.6 ? "준비~" : "냠!"}
        </p>
      )}
      {tense && (
        <p className="pp-display pp-beat pointer-events-none absolute inset-x-0 top-2 text-center text-[18px] text-[#e0577b]">
          아슬아슬…
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

function ResultCard({ game, outcome, children }: { game: Answer; outcome: Outcome; children: React.ReactNode }) {
  const biter = outcome.kind === "bite" ? (outcome.biter === "left" ? game.n : game.m) : "";
  const bitten = outcome.kind === "bite" ? (outcome.biter === "left" ? game.m : game.n) : "";

  return (
    <div className="pp-result mt-4">
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
            {biter}님이 {bitten}님 입술을 앙!
          </p>
          <p className="mt-1 text-[14px] opacity-75 break-keep">
            욕심쟁이는 {biter}님! {bitten}님한테 반창고 붙여 주기 🩹
          </p>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[13px]">
        <div className="rounded-2xl bg-[#ffe3ea] px-3 py-2">
          <b>{game.n}</b>
          <br />
          {cm(game.a)}cm 먹기로 했어요
        </div>
        <div className="rounded-2xl bg-[#dcf3ea] px-3 py-2">
          <b>{game.m}</b>
          <br />
          {cm(STICK_MM - game.b)}cm 먹기로 했어요
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
        <li>둘이 고른 자리가 겹치면… 욕심낸 쪽이 상대 입술을 앙 깨물고 끝나요 🩹</li>
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
