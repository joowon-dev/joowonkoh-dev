"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import type { ReactNode } from "react";
import BowlArt, { FLAKES } from "./BowlArt";
import { PLACE } from "./info";
import { G, SERIF } from "./palette";
import { Caption, ScrollStage } from "./stage";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ───────────── 표지 ───────────── */

export function CoverScene({ title, date, children }: { title: string; date?: string; children?: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <section
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-16 text-center"
      style={{ background: G.forest }}
    >
      <div className="relative w-[min(72vw,380px)]">
        <motion.div
          initial={reduce ? false : { scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <BowlArt className="w-full" title="위에서 본 들기름막국수 한 그릇" />
        </motion.div>
        {/* 김가루가 한 번 내려앉는다 — 이 페이지의 첫 움직임 */}
        {!reduce && (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {FLAKES.slice(0, 18).map((f, i) => (
              <motion.span
                key={i}
                className="absolute block rounded-[1px]"
                style={{
                  left: `${(f.x / 200) * 100}%`,
                  top: `${(f.y / 200) * 100}%`,
                  width: f.w * 1.6,
                  height: f.h * 1.6,
                  background: G.gim,
                  rotate: f.rot,
                }}
                initial={{ y: -260 - i * 14, opacity: 0 }}
                animate={{ y: 0, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.4, delay: 0.5 + i * 0.05, ease: "easeIn" }}
              />
            ))}
          </div>
        )}
      </div>

      <h1
        className="mt-10 text-[clamp(2.4rem,8vw,4.6rem)] font-bold leading-[1.15] tracking-tight"
        style={{ fontFamily: SERIF, color: G.mist }}
      >
        {title}
      </h1>
      {date && (
        <p className="mt-3 text-sm" style={{ color: G.mistDim }}>
          {date.replace(/-/g, ".")}
        </p>
      )}
      {children && (
        <div className="mt-6 max-w-lg [&_p]:mx-auto [&_p]:text-base [&_p]:leading-[1.8] [&_p]:text-[#C9D6CD]">
          {children}
        </div>
      )}
      <motion.p
        className="absolute bottom-8 text-xs"
        style={{ color: G.mistDim }}
        animate={reduce ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        아래로 내려서 들어가기
      </motion.p>
    </section>
  );
}

/* ───────────── 가는 길 ───────────── */

export function RouteScene({ children }: { children?: ReactNode }) {
  return (
    <ScrollStage screens={3}>
      {(p) => <RouteArt p={p} caption={children} />}
    </ScrollStage>
  );
}

function RouteArt({ p, caption }: { p: MotionValue<number>; caption?: ReactNode }) {
  const scale = useTransform(p, [0.3, 0.85], [1, 2.5]);
  const path = useTransform(p, [0.02, 0.6], [0, 1]);
  const pinY = useTransform(p, [0.78, 0.9], [-60, 0]);
  const pinOpacity = useTransform(p, [0.78, 0.82], [0, 1]);
  const labelOpacity = useTransform(p, [0.86, 0.94], [0, 1]);
  const cityOpacity = useTransform(p, [0.45, 0.7], [1, 0]);

  return (
    <div className="relative flex h-full items-center justify-center">
      <motion.div
        className="w-[min(100vw,calc((100svh-5rem)*1.333))]"
        style={{ scale, transformOrigin: "51.25% 68.3%" }}
      >
        <svg viewBox="0 0 400 300" className="w-full" role="img" aria-label="서울에서 판교를 지나 고기리로 가는 그림 지도">
          <rect width="400" height="300" fill={G.forest} />
          {/* 산 */}
          {[
            [150, 262, 46],
            [196, 250, 40],
            [238, 262, 50],
            [120, 150, 30],
            [300, 230, 36],
            [330, 140, 28],
          ].map(([x, y, s], i) => (
            <path key={i} d={`M${x - s} ${y} L${x} ${y - s * 0.9} L${x + s} ${y} Z`} fill={G.moss} />
          ))}
          {/* 한강 */}
          <path
            d="M0 74 C60 62 110 98 170 84 S290 60 400 80"
            fill="none"
            stroke="#3C6B6A"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* 큰길 */}
          <path d="M200 60 L252 300" stroke={G.moss} strokeWidth="3" />
          <path d="M60 180 L400 150" stroke={G.moss} strokeWidth="3" />

          <motion.g style={{ opacity: cityOpacity }}>
            <circle cx="200" cy="52" r="5" fill={G.mist} />
            <text x="200" y="38" textAnchor="middle" fontSize="13" fill={G.mist} style={{ fontFamily: SERIF }}>
              서울
            </text>
            <circle cx="252" cy="168" r="4" fill={G.mistDim} />
            <text x="262" y="166" fontSize="10" fill={G.mistDim}>
              판교
            </text>
            <circle cx="150" cy="214" r="4" fill={G.mistDim} />
            <text x="118" y="230" fontSize="10" fill={G.mistDim}>
              수지
            </text>
          </motion.g>

          {/* 가는 길 */}
          <motion.path
            d="M200 56 C204 108 242 128 250 166 C254 186 226 192 205 205"
            fill="none"
            stroke={G.oil}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ pathLength: path }}
          />

          {/* 핀 */}
          <motion.g style={{ y: pinY, opacity: pinOpacity }}>
            <path d="M205 205 C199 196 197 192 197 188 a8 8 0 1 1 16 0 C213 192 211 196 205 205 Z" fill={G.oil} />
            <circle cx="205" cy="188" r="3" fill={G.forest} />
          </motion.g>
          <motion.text
            x="205"
            y="216"
            textAnchor="middle"
            fontSize="6.5"
            fill={G.mist}
            style={{ opacity: labelOpacity, fontFamily: SERIF }}
          >
            고기리막국수
          </motion.text>
        </svg>
      </motion.div>

      <p className="absolute top-24 right-5 text-[11px]" style={{ color: G.mistDim }}>
        그림 지도라 거리와 방향은 대략이에요
      </p>
      <Caption className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-auto">{caption}</Caption>
    </div>
  );
}

/* ───────────── 웨이팅 ───────────── */

export function WaitingScene({ from = 47, children }: { from?: number; children?: ReactNode }) {
  return (
    <ScrollStage screens={2.6} background={G.forestDeep}>
      {(p) => <WaitingArt p={p} from={from} caption={children} />}
    </ScrollStage>
  );
}

function WaitingArt({ p, from, caption }: { p: MotionValue<number>; from: number; caption?: ReactNode }) {
  const left = useTransform(p, [0.05, 0.8], [from, 0]);
  const shown = useTransform(left, (v) => String(Math.round(v)));
  const minute = useTransform(p, [0.05, 0.8], [0, 540]);
  const hour = useTransform(p, [0.05, 0.8], [0, 45]);
  const queueX = useTransform(p, [0.05, 0.8], ["0%", "-50%"]);
  const calledOpacity = useTransform(p, [0.78, 0.84], [0, 1]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-8 px-6 pt-20">
      <div className="flex items-center gap-8 sm:gap-14">
        {/* 벽시계 */}
        <svg viewBox="0 0 100 100" className="w-20 sm:w-28" aria-hidden>
          <circle cx="50" cy="50" r="46" fill={G.bowl} />
          <circle cx="50" cy="50" r="46" fill="none" stroke={G.moss} strokeWidth="4" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x="49" y="8" width="2" height="6" fill={G.moss} transform={`rotate(${i * 30} 50 50)`} />
          ))}
          <motion.rect x="48" y="26" width="4" height="26" rx="2" fill={G.gim} style={{ rotate: hour, originX: "50%", originY: "92%" }} />
          <motion.rect x="49" y="14" width="2" height="38" rx="1" fill={G.oil} style={{ rotate: minute, originX: "50%", originY: "95%" }} />
          <circle cx="50" cy="50" r="3" fill={G.gim} />
        </svg>

        {/* 대기 번호표 */}
        <div className="rounded-2xl px-7 py-5 text-center" style={{ background: G.bowl, color: G.gim }}>
          <p className="text-xs" style={{ color: G.moss }}>
            내 앞 대기
          </p>
          <p className="mt-1 text-6xl font-bold tabular-nums sm:text-7xl" style={{ fontFamily: SERIF }}>
            <motion.span>{shown}</motion.span>
            <span className="ml-1 text-xl">팀</span>
          </p>
          <motion.p className="mt-2 text-sm font-semibold" style={{ opacity: calledOpacity, color: G.oil }}>
            입장하세요
          </motion.p>
        </div>
      </div>

      {/* 줄 선 사람들 */}
      <div className="w-[min(90vw,560px)] overflow-hidden" aria-hidden>
        <motion.div className="flex w-[200%] gap-5" style={{ x: queueX }}>
          {Array.from({ length: 16 }, (_, i) => (
            <svg key={i} viewBox="0 0 20 34" className="h-12 w-7 shrink-0">
              <circle cx="10" cy="7" r="6" fill={i % 3 === 0 ? G.noodle : G.mistDim} />
              <rect x="2" y="15" width="16" height="19" rx="7" fill={i % 3 === 0 ? G.noodleDark : G.moss} />
            </svg>
          ))}
        </motion.div>
      </div>

      <p className="text-xs" style={{ color: G.mistDim }}>
        {PLACE.waiting} · {PLACE.quietHours}
      </p>

      <Caption className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-8">{caption}</Caption>
    </div>
  );
}

/* ───────────── 한 그릇이 나온다 ───────────── */

export function BowlScene({ children }: { children?: ReactNode }) {
  return (
    <ScrollStage screens={2.8}>
      {(p) => <BowlArrive p={p} caption={children} />}
    </ScrollStage>
  );
}

function BowlArrive({ p, caption }: { p: MotionValue<number>; caption?: ReactNode }) {
  const y = useTransform(p, [0, 0.28], ["70svh", "0svh"]);
  const rotate = useTransform(p, [0, 0.28], [-18, 0]);
  const stream = useTransform(p, [0.3, 0.38, 0.52, 0.6], [0, 1, 1, 0]);
  const oil = useTransform(p, [0.34, 0.6], [0, 1]);
  const fall = useTransform(p, [0.58, 0.88], ["-55svh", "0svh"]);
  const fallOpacity = useTransform(p, [0.58, 0.62, 0.84, 0.9], [0, 1, 1, 0]);
  const gim = useTransform(p, [0.8, 0.9], [0, 1]);

  const layer = "absolute inset-0 w-full";
  return (
    <div className="relative flex h-full items-center justify-center px-6">
      <motion.div className="relative w-[min(78vw,460px)] aspect-square" style={{ y, rotate }}>
        <BowlArt className={layer} oil={0} gim={0} title="갓 나온 들기름막국수" />
        <motion.div className={layer} style={{ opacity: oil }}>
          <BowlArt className="w-full" gim={0} title="" />
        </motion.div>
        <motion.div className={layer} style={{ opacity: gim }}>
          <BowlArt className="w-full" title="" />
        </motion.div>

        {/* 들기름 줄기 */}
        <motion.div
          className="absolute left-[46%] bottom-[50%] w-[6px] rounded-full"
          style={{
            height: "60svh",
            background: `linear-gradient(${G.oilLight}, ${G.oil})`,
            scaleY: stream,
            originY: 0,
          }}
          aria-hidden
        />

        {/* 떨어지는 김가루 */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ y: fall, opacity: fallOpacity }} aria-hidden>
          {FLAKES.map((f, i) => (
            <span
              key={i}
              className="absolute block rounded-[1px]"
              style={{
                left: `${(f.x / 200) * 100}%`,
                top: `${(f.y / 200) * 100 - (i % 5) * 4}%`,
                width: f.w * 2,
                height: f.h * 2,
                background: G.gim,
                transform: `rotate(${f.rot}deg)`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      <Caption className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-auto">{caption}</Caption>
    </div>
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
    <ScrollStage screens={2} background={G.forestDeep}>
      {(p) => (
        <div className="flex h-full flex-col items-center justify-center gap-10 px-6 pt-16">
          <ul className="w-[min(90vw,520px)] space-y-6">
            {scores.map((s, i) => (
              <ScoreBar key={s.label} p={p} score={s} index={i} count={scores.length} />
            ))}
          </ul>
          <Caption>{children}</Caption>
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
        <span className="text-lg font-bold" style={{ fontFamily: SERIF }}>
          {score.label}
        </span>
        <span className="text-sm tabular-nums" style={{ color: G.oilLight }}>
          {score.value} / 5
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full" style={{ background: G.moss }}>
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
