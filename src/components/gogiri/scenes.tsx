"use client";

import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { PLACE } from "./info";
import { G, SERIF } from "./palette";
import { Caption, Photo, ScrollStage, seeded, useTilt } from "./stage";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** 화면을 덮는 사진 층 */
const FILL = "absolute inset-0";

/* ───────────── 표지: 해 질 녘 돌담 앞 ───────────── */

export function CoverScene({ title, date, children }: { title: string; date?: string; children?: ReactNode }) {
  return (
    <ScrollStage screens={1.7} background={G.inkDeep}>
      {(p) => <Cover p={p} title={title} date={date} caption={children} />}
    </ScrollStage>
  );
}

function Cover({ p, title, date, caption }: { p: MotionValue<number>; title: string; date?: string; caption?: ReactNode }) {
  const reduce = useReducedMotion();
  const zoom = useTransform(p, [0, 1], [1, 1.22]);
  const dim = useTransform(p, [0, 1], [0.15, 0.7]);
  const lift = useTransform(p, [0, 1], ["0%", "-35%"]);
  const fade = useTransform(p, [0.2, 0.75], [1, 0]);

  return (
    <div className="relative h-full">
      <motion.div className={FILL} style={{ scale: zoom }}>
        <motion.div
          className={FILL}
          initial={reduce ? false : { scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
        >
          <Photo name="dusk" alt="해 질 녘, 불이 켜진 고기리막국수 돌담과 157 번지 표지" eager />
        </motion.div>
      </motion.div>
      <motion.div className={FILL} style={{ background: G.inkDeep, opacity: dim }} />
      <div className="absolute inset-x-0 bottom-0 h-2/3" style={{ background: `linear-gradient(transparent, ${G.inkDeep})` }} />

      <motion.div className="absolute inset-x-0 bottom-0 px-6 pb-16 text-center" style={{ y: lift, opacity: fade }}>
        <h1
          className="text-[clamp(2.6rem,9vw,5.6rem)] font-bold leading-[1.1] tracking-tight"
          style={{ fontFamily: SERIF, color: G.mist }}
          aria-label={title}
        >
          {/* 글자마다 떠오르되, 낱말 가운데서 줄이 바뀌지 않게 낱말로 묶는다 */}
          {title.split(" ").map((word, w, words) => {
            const before = words.slice(0, w).join(" ").length + (w > 0 ? 1 : 0);
            return (
              <span key={w} className="inline-block whitespace-nowrap">
                {Array.from(word).map((ch, i) => (
                  <motion.span
                    key={i}
                    aria-hidden
                    className="inline-block"
                    initial={reduce ? false : { y: "0.6em", opacity: 0, filter: "blur(8px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.1, delay: 0.5 + (before + i) * 0.07, ease: EASE }}
                  >
                    {ch}
                  </motion.span>
                ))}
                {w < words.length - 1 && <span aria-hidden>&nbsp;</span>}
              </span>
            );
          })}
        </h1>
        {date && (
          <motion.p
            className="mt-4 text-sm tracking-wide"
            style={{ color: G.mistDim }}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
          >
            {date.replace(/-/g, ".")} · {PLACE.address}
          </motion.p>
        )}
        {caption && (
          <motion.div
            className="mx-auto mt-6 max-w-lg [&_p]:mx-auto [&_p]:text-base [&_p]:leading-[1.8] [&_p]:text-[#D9CFBE]"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 1 }}
          >
            {caption}
          </motion.div>
        )}
        <motion.p
          className="mt-8 text-xs"
          style={{ color: G.mistDim }}
          animate={reduce ? undefined : { y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          천천히 내려 보세요
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ───────────── 가는 길: 비 갠 길 → 한옥 정면 ───────────── */

export function RouteScene({ children }: { children?: ReactNode }) {
  return <ScrollStage screens={3}>{(p) => <Route p={p} caption={children} />}</ScrollStage>;
}

function Route({ p, caption }: { p: MotionValue<number>; caption?: ReactNode }) {
  // 길을 따라 앞으로 나아가듯 길 사진이 커지고, 그 끝에서 가게 정면이 나타난다
  const roadScale = useTransform(p, [0, 0.62], [1, 1.7]);
  const roadOpacity = useTransform(p, [0.48, 0.66], [1, 0]);
  const roadBlur = useTransform(p, [0.4, 0.66], ["blur(0px)", "blur(10px)"]);
  const facadeScale = useTransform(p, [0.48, 1], [1.18, 1]);
  const facadeOpacity = useTransform(p, [0.48, 0.66], [0, 1]);
  const word1 = useTransform(p, [0.05, 0.14, 0.36, 0.46], [0, 1, 1, 0]);
  const word1Y = useTransform(p, [0.05, 0.46], [40, -40]);
  const word2 = useTransform(p, [0.68, 0.78, 1], [0, 1, 1]);
  const word2Y = useTransform(p, [0.68, 1], [40, 0]);

  return (
    <div className="relative h-full">
      <motion.div className={FILL} style={{ scale: roadScale, opacity: roadOpacity, filter: roadBlur }}>
        <Photo name="road" alt="비 갠 뒤 젖은 길 끝에 보이는 한옥 가게와 안개 낀 산" />
      </motion.div>
      <motion.div className={FILL} style={{ scale: facadeScale, opacity: facadeOpacity }}>
        <Photo name="facade" alt="기와지붕과 흰 회벽, 돌망태 담이 이어진 고기리막국수 정면" />
      </motion.div>
      <div
        className={FILL}
        style={{ background: "linear-gradient(rgba(20,18,16,0.35), transparent 30%, transparent 55%, rgba(20,18,16,0.75))" }}
      />

      <motion.p
        className="absolute inset-x-0 top-[30%] text-center text-[clamp(2.2rem,7vw,4.8rem)] font-bold"
        style={{ fontFamily: SERIF, color: G.mist, opacity: word1, y: word1Y, textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
      >
        고기리 계곡 쪽으로
      </motion.p>
      <motion.p
        className="absolute inset-x-0 top-[18%] text-center text-[clamp(2.2rem,7vw,4.8rem)] font-bold"
        style={{ fontFamily: SERIF, color: G.mist, opacity: word2, y: word2Y, textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
      >
        이종무로 157
      </motion.p>

      <Caption className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-auto">{caption}</Caption>
    </div>
  );
}

/* ───────────── 문 앞: 대기 번호가 0 이 되면 문이 열린다 ───────────── */

export function DoorScene({ from = 47, children }: { from?: number; children?: ReactNode }) {
  return <ScrollStage screens={3}>{(p) => <Door p={p} from={from} caption={children} />}</ScrollStage>;
}

function Door({ p, from, caption }: { p: MotionValue<number>; from: number; caption?: ReactNode }) {
  const left = useTransform(p, [0.04, 0.42], [from, 0]);
  const shown = useTransform(left, (v) => String(Math.round(v)));
  const ticketOpacity = useTransform(p, [0, 0.04, 0.48, 0.54], [0, 1, 1, 0]);
  const ticketScale = useTransform(p, [0.42, 0.48], [1, 1.08]);
  const called = useTransform(p, [0.41, 0.44], [0, 1]);
  const scrim = useTransform(p, [0, 0.48, 0.56], [0.55, 0.55, 0]);

  // 문이 좌우로 열리고, 안쪽 주방이 다가온다
  const leftDoor = useTransform(p, [0.55, 0.9], ["0%", "-102%"]);
  const rightDoor = useTransform(p, [0.55, 0.9], ["0%", "102%"]);
  const insideScale = useTransform(p, [0.55, 1], [1.25, 1]);
  const captionOpacity = useTransform(p, [0.86, 0.95], [0, 1]);

  const half = "absolute inset-0 overflow-hidden";
  return (
    <div className="relative h-full">
      <motion.div className={FILL} style={{ scale: insideScale }}>
        <Photo name="kitchen" alt="‘고기리막국수’ 나무 간판 아래 열린 주방과 놋쇠 장식 반닫이" style={{ objectPosition: "50% 18%" }} />
      </motion.div>

      <motion.div className={half} style={{ x: leftDoor, clipPath: "inset(0 50% 0 0)" }}>
        <Photo name="entrance" alt="‘고기리막국수’ 간판이 걸린 나무 출입문" />
      </motion.div>
      <motion.div className={half} style={{ x: rightDoor, clipPath: "inset(0 0 0 50%)" }}>
        <Photo name="entrance" alt="" />
      </motion.div>
      <motion.div className={FILL} style={{ background: G.inkDeep, opacity: scrim }} />

      {/* 대기 번호표 */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-[min(78vw,300px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl px-8 py-7 text-center shadow-2xl"
        style={{ opacity: ticketOpacity, scale: ticketScale, background: G.mist, color: G.gim }}
      >
        <p className="text-xs tracking-wide" style={{ color: "#7A6A55" }}>
          캐치테이블 원격 줄서기
        </p>
        <p className="mt-2 text-sm">내 앞 대기</p>
        <p className="mt-1 text-7xl font-bold tabular-nums" style={{ fontFamily: SERIF }}>
          <motion.span>{shown}</motion.span>
          <span className="ml-1 text-2xl">팀</span>
        </p>
        <motion.p className="mt-3 text-base font-bold" style={{ opacity: called, color: "#B9781A" }}>
          입장하세요
        </motion.p>
      </motion.div>

      <motion.div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-8" style={{ opacity: captionOpacity }}>
        <Caption>{caption}</Caption>
      </motion.div>
    </div>
  );
}

/* ───────────── 한 그릇: 작은 액자가 화면을 채우고, 그릇 안으로 다가간다 ───────────── */

const rand = seeded(2012);
/** 떨어지는 김가루·깨. 세 겹으로 나눠 다른 속도로 떨어뜨려 깊이를 낸다. */
const FLAKES = Array.from({ length: 54 }, (_, i) => ({
  layer: i % 3,
  x: rand() * 100,
  y: rand() * 100,
  w: 2 + rand() * 7,
  h: 1.5 + rand() * 4,
  rot: rand() * 180,
  sesame: rand() > 0.68,
}));

const WORDS = [
  { label: "메밀면", at: [0.36, 0.44, 0.54, 0.6] },
  { label: "들기름", at: [0.56, 0.64, 0.72, 0.78] },
  { label: "김가루와 깨", at: [0.74, 0.82, 1, 1.01] },
];

export function BowlScene({ children }: { children?: ReactNode }) {
  return (
    <ScrollStage screens={3.2} background={G.inkDeep}>
      {(p) => <Bowl p={p} caption={children} />}
    </ScrollStage>
  );
}

function Bowl({ p, caption }: { p: MotionValue<number>; caption?: ReactNode }) {
  const clipPath = useTransform(p, (v) => {
    const t = Math.min(1, v / 0.32);
    const e = 1 - Math.pow(1 - t, 3);
    const a = 22 * (1 - e);
    const b = 32 * (1 - e);
    return `inset(${a}% ${b}% ${a}% ${b}% round ${28 * (1 - e)}px)`;
  });
  const zoom = useTransform(p, [0.32, 1], [1, 1.55]);
  const fall0 = useTransform(p, [0.3, 1], ["-40%", "130%"]);
  const fall1 = useTransform(p, [0.3, 1], ["-70%", "160%"]);
  const fall2 = useTransform(p, [0.3, 1], ["-100%", "190%"]);
  const fall = [fall0, fall1, fall2];
  const flakeOpacity = useTransform(p, [0.3, 0.4, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div className="relative h-full">
      <motion.div className={FILL} style={{ clipPath }}>
        <motion.div className={FILL} style={{ scale: zoom, transformOrigin: "50% 42%" }}>
          <Photo name="deul_hero" alt="스테인리스 대접에 담긴 들기름막국수, 김가루와 깨가 수북하다" />
        </motion.div>
        <div className={FILL} style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(20,18,16,0.6))" }} />
      </motion.div>

      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: flakeOpacity }} aria-hidden>
        {fall.map((y, layer) => (
          <motion.div key={layer} className={FILL} style={{ y }}>
            {FLAKES.filter((f) => f.layer === layer).map((f, i) => (
              <span
                key={i}
                className="absolute block rounded-[1px]"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  width: f.w * (1 + layer * 0.5),
                  height: f.h * (1 + layer * 0.5),
                  background: f.sesame ? "#E2CB98" : G.gim,
                  transform: `rotate(${f.rot}deg)`,
                  filter: layer === 2 ? "blur(1.5px)" : undefined,
                }}
              />
            ))}
          </motion.div>
        ))}
      </motion.div>

      {WORDS.map((w) => (
        <Word key={w.label} p={p} at={w.at}>
          {w.label}
        </Word>
      ))}

      <Caption className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-auto">{caption}</Caption>
    </div>
  );
}

function Word({ p, at, children }: { p: MotionValue<number>; at: number[]; children: ReactNode }) {
  const opacity = useTransform(p, at, [0, 1, 1, 0]);
  const y = useTransform(p, [at[0], at[3]], [30, -30]);
  const spacing = useTransform(p, [at[0], at[1]], ["0.4em", "0.02em"]);
  return (
    <motion.p
      className="pointer-events-none absolute inset-x-0 top-[16%] text-center text-[clamp(2.4rem,8vw,5.4rem)] font-bold"
      style={{ fontFamily: SERIF, color: G.mist, opacity, y, letterSpacing: spacing, textShadow: "0 2px 6px rgba(0,0,0,0.7), 0 6px 60px rgba(0,0,0,0.85)" }}
    >
      {children}
    </motion.p>
  );
}

/* ───────────── 들어 올리기: 포인터를 따라 기우는 사진 ───────────── */

export function LiftScene({ children }: { children?: ReactNode }) {
  return (
    <ScrollStage screens={2} background={G.inkDeep}>
      {(p) => <Lift p={p} caption={children} />}
    </ScrollStage>
  );
}

function Lift({ p, caption }: { p: MotionValue<number>; caption?: ReactNode }) {
  const { rotateX, rotateY, handlers } = useTilt(9);
  const photoY = useTransform(p, [0, 1], ["8%", "-8%"]);
  const line1X = useTransform(p, [0, 1], ["-12%", "6%"]);
  const line2X = useTransform(p, [0, 1], ["12%", "-6%"]);
  const textOpacity = useTransform(p, [0, 0.15, 0.85, 1], [0, 1, 1, 0.4]);

  return (
    <div className="relative flex h-full items-center justify-center" style={{ perspective: 1200 }} {...handlers}>
      <motion.p
        className="pointer-events-none absolute left-0 right-0 top-[14%] whitespace-nowrap text-center text-[clamp(3rem,13vw,10rem)] font-bold leading-none"
        style={{ fontFamily: SERIF, color: "transparent", WebkitTextStroke: `1px ${G.mistDim}`, x: line1X, opacity: textOpacity }}
        aria-hidden
      >
        비비지 말고
      </motion.p>
      <motion.div
        className="relative aspect-[3/4] w-[min(72vw,440px,62svh)] overflow-hidden rounded-[28px] shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
        style={{ rotateX, rotateY, y: photoY }}
      >
        <Photo name="lift" alt="젓가락으로 김가루 묻은 메밀면을 높이 들어 올린 모습" />
      </motion.div>
      <motion.p
        className="pointer-events-none absolute bottom-[14%] left-0 right-0 whitespace-nowrap text-center text-[clamp(3rem,13vw,10rem)] font-bold leading-none"
        style={{ fontFamily: SERIF, color: G.oilLight, x: line2X, opacity: textOpacity }}
      >
        나온 그대로
      </motion.p>
      <Caption className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-8">{caption}</Caption>
    </div>
  );
}

/* ───────────── 곁들임: 세로 스크롤로 옆으로 넘어가는 사진들 ───────────── */

const SIDES = [
  { name: "mul", title: "물막국수", note: "살얼음 낀 동치미 육수에 만 메밀면. 새콤하고 맑다." },
  { name: "suyuk", title: "수육", note: "국내산 돼지고기. 막국수 옆에 한 접시." },
  { name: "spread", title: "한 상", note: "들기름막국수와 수육, 김치, 따끈한 면수." },
];

export function SidesScene({ children }: { children?: ReactNode }) {
  return (
    <ScrollStage screens={3} background={G.inkDeep}>
      {(p) => <Sides p={p} caption={children} />}
    </ScrollStage>
  );
}

function Sides({ p, caption }: { p: MotionValue<number>; caption?: ReactNode }) {
  // 마지막 카드가 오른쪽 끝에 닿을 때까지 민다. 거리는 화면 폭에 따라 달라서 재서 쓴다.
  const track = useRef<HTMLDivElement>(null);
  const travel = useMotionValue(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => travel.set(Math.max(0, el.scrollWidth - window.innerWidth + window.innerWidth * 0.06));
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [travel]);
  const x = useTransform(() => -Math.min(1, Math.max(0, (p.get() - 0.08) / 0.84)) * travel.get());

  return (
    <div className="relative flex h-full flex-col justify-center gap-8 pt-16">
      <p className="px-6 text-sm sm:px-12" style={{ color: G.mistDim }}>
        같이 시키면 좋은 것
      </p>
      <motion.div ref={track} className="flex w-max gap-[4vw] pl-[6vw]" style={{ x }}>
        {SIDES.map((s, i) => (
          <SideCard key={s.name} p={p} index={i} {...s} />
        ))}
      </motion.div>
      <Caption className="mx-6 sm:mx-12">{caption}</Caption>
    </div>
  );
}

function SideCard({
  p,
  index,
  name,
  title,
  note,
}: {
  p: MotionValue<number>;
  index: number;
  name: string;
  title: string;
  note: string;
}) {
  const center = 0.08 + (0.84 * index) / (SIDES.length - 1);
  const scale = useTransform(p, [center - 0.35, center, center + 0.35], [0.9, 1, 0.9]);
  const inner = useTransform(p, [center - 0.4, center + 0.4], ["-6%", "6%"]);
  return (
    <motion.figure className="relative w-[66vw] shrink-0 sm:w-[56vw]" style={{ scale }}>
      <div className="relative aspect-[4/3] max-h-[58svh] overflow-hidden rounded-3xl">
        <motion.div className="absolute inset-[-8%]" style={{ x: inner }}>
          <Photo name={name} alt={title} />
        </motion.div>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: SERIF, color: G.mist }}>
          {title}
        </span>
        <span className="text-sm" style={{ color: G.mistDim }}>
          {note}
        </span>
      </figcaption>
    </motion.figure>
  );
}

/* ───────────── 총평 ───────────── */

export interface Score {
  label: string;
  /** 0–5 */
  value: number;
  note?: string;
}

export function VerdictScene({ scores, children }: { scores: Score[]; children?: ReactNode }) {
  return (
    <ScrollStage screens={2} background={G.inkDeep}>
      {(p) => (
        <div className="relative flex h-full flex-col items-center justify-center gap-10 px-6 pt-16">
          <div className={FILL} aria-hidden>
            <Photo name="spread" alt="" className="scale-110 blur-2xl" />
            <div className={FILL} style={{ background: "rgba(20,18,16,0.78)" }} />
          </div>
          <ul className="relative w-[min(90vw,520px)] space-y-7">
            {scores.map((s, i) => (
              <ScoreBar key={s.label} p={p} score={s} index={i} count={scores.length} />
            ))}
          </ul>
          <Caption className="relative">{children}</Caption>
        </div>
      )}
    </ScrollStage>
  );
}

function ScoreBar({ p, score, index, count }: { p: MotionValue<number>; score: Score; index: number; count: number }) {
  const start = 0.05 + (index / count) * 0.45;
  const fill = useTransform(p, [start, start + 0.3], [0, score.value / 5]);
  return (
    <li>
      <div className="flex items-baseline justify-between" style={{ color: G.mist }}>
        <span className="text-xl font-bold" style={{ fontFamily: SERIF }}>
          {score.label}
        </span>
        <span className="text-sm tabular-nums" style={{ color: G.oilLight }}>
          {score.value} / 5
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: G.line }}>
        <motion.div className="h-full rounded-full" style={{ scaleX: fill, originX: 0, background: G.oil }} />
      </div>
      {score.note && (
        <p className="mt-1.5 text-sm" style={{ color: G.mistDim }}>
          {score.note}
        </p>
      )}
    </li>
  );
}
