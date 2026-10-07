"use client";

import { motion, type MotionValue } from "motion/react";
import { useId } from "react";
import { H, SERIF } from "./palette";

/**
 * 고기리막국수 가게의 한옥 배경.
 *
 * 실제 가게: 짙은 기와지붕, 흰 회벽에 짙은 나무 기둥, 창살 문 너머 불빛,
 * 입구 위 나무 간판, 앞쪽 돌망태 돌담. 그 인상만 납작한 그림으로 옮긴다.
 */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const rand = seeded(157);

/** 돌담 속 돌멩이 */
const STONES = Array.from({ length: 70 }, () => ({
  x: rand() * 800,
  y: 470 + rand() * 120,
  rx: 9 + rand() * 12,
  ry: 6 + rand() * 7,
  light: rand() > 0.55,
}));

/** 나무 결 */
const GRAIN = Array.from({ length: 40 }, () => ({
  y: rand() * 600,
  amp: 2 + rand() * 6,
  phase: rand() * 400,
  dark: rand() > 0.5,
}));

/**
 * 한옥 외관, 정면.
 * glow 는 창살 문 불빛 0–1. 숫자나 스크롤 값 그대로 받는다.
 */
export function HanokFacade({
  glow = 1,
  className = "",
}: {
  glow?: number | MotionValue<number>;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const id = (n: string) => `${n}-${uid}`;

  // 칸(기둥 사이) 다섯 개. 가운데 셋이 창살 문, 양 끝은 회벽에 작은 창
  const posts = [150, 254, 358, 442, 546, 650];

  return (
    <svg
      viewBox="0 0 800 620"
      preserveAspectRatio="xMidYMax slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={H.sky} />
          <stop offset="1" stopColor={H.skyLow} />
        </linearGradient>
        <radialGradient id={id("spill")} cx="50%" cy="0%" r="70%">
          <stop offset="0" stopColor={H.hanji} stopOpacity="0.45" />
          <stop offset="1" stopColor={H.hanji} stopOpacity="0" />
        </radialGradient>
        <pattern id={id("lattice")} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 0H16M0 0V16" stroke={H.woodDark} strokeWidth="2.4" />
        </pattern>
        <clipPath id={id("roof")}>
          <path d="M40 236 Q80 238 112 214 L400 132 L688 214 Q720 238 760 236 L712 262 L88 262 Z" />
        </clipPath>
      </defs>

      <rect width="800" height="620" fill={`url(#${id("sky")})`} />
      {/* 뒷산 */}
      <path d="M0 250 Q120 170 230 210 T470 190 T800 220 V320 H0 Z" fill="#232B31" />

      {/* 몸채: 회벽과 기둥 */}
      <rect x="140" y="262" width="520" height="180" fill={H.wall} />
      <motion.g style={{ opacity: glow }}>
        <rect x="254" y="300" width="292" height="142" fill={H.hanji} />
      </motion.g>
      <rect x="254" y="300" width="292" height="142" fill={`url(#${id("lattice")})`} />
      {/* 양 끝 칸의 작은 창 */}
      {[176, 572].map((x) => (
        <g key={x}>
          <motion.rect x={x} y="320" width="52" height="40" fill={H.hanji} style={{ opacity: glow }} />
          <rect x={x} y="320" width="52" height="40" fill={`url(#${id("lattice")})`} />
          <rect x={x} y="320" width="52" height="40" fill="none" stroke={H.woodDark} strokeWidth="3" />
        </g>
      ))}
      {posts.map((x) => (
        <rect key={x} x={x - 7} y="262" width="14" height="180" fill={H.wood} />
      ))}
      <rect x="132" y="262" width="536" height="16" fill={H.wood} />
      <rect x="140" y="292" width="520" height="8" fill={H.wood} />
      {/* 기단 */}
      <rect x="120" y="442" width="560" height="22" fill={H.stoneLight} />

      {/* 기와지붕 */}
      <path d="M40 236 Q80 238 112 214 L400 132 L688 214 Q720 238 760 236 L712 262 L88 262 Z" fill={H.giwa} />
      <g clipPath={`url(#${id("roof")})`}>
        {Array.from({ length: 48 }, (_, i) => (
          <path key={i} d={`M${40 + i * 15} 120 L${40 + i * 15} 270`} stroke={H.giwaLine} strokeWidth="3" />
        ))}
      </g>
      {/* 처마 끝 기왓골 */}
      <path d="M88 262 L712 262" stroke={H.giwaDark} strokeWidth="8" />
      {/* 용마루: 양끝이 살짝 들린다 */}
      <path d="M300 160 Q330 150 400 148 Q470 150 500 160 L508 150 L400 136 L292 150 Z" fill={H.giwaDark} />
      {/* 서까래 */}
      <rect x="112" y="262" width="576" height="10" fill={H.woodDark} />

      {/* 간판: 처마 밑, 가운데 문 위 */}
      <rect x="316" y="274" width="168" height="40" rx="10" fill={H.woodLight} stroke={H.woodDark} strokeWidth="3" />
      <text x="400" y="301" textAnchor="middle" fontSize="21" fontWeight="700" fill={H.woodDark} style={{ fontFamily: SERIF }}>
        고기리막국수
      </text>

      {/* 문 앞으로 번지는 불빛 */}
      <motion.ellipse cx="400" cy="470" rx="260" ry="60" fill={`url(#${id("spill")})`} style={{ opacity: glow }} />

      {/* 앞마당과 돌망태 담 */}
      <rect x="0" y="464" width="800" height="156" fill="#1E1D1C" />
      <rect x="0" y="470" width="250" height="120" fill={H.stone} />
      <rect x="550" y="470" width="250" height="120" fill={H.stone} />
      {STONES.filter((s) => s.x < 250 || s.x > 550).map((s, i) => (
        <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill={s.light ? H.stoneLight : "#3B3D3F"} />
      ))}
      {/* 철망 */}
      {[0, 550].map((x0) => (
        <g key={x0} stroke="#2A2C2E" strokeWidth="2" opacity="0.8">
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M${x0} ${470 + i * 24} h250`} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <path key={i} d={`M${x0 + i * 25} 470 v120`} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/**
 * 위에서 본 나무 상. 옆 창살 문으로 들어온 빛이 격자 그림자로 비스듬히 드리운다.
 * 위에서 내려다본 그릇과 시점이 같다.
 */
export function WoodTable({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const id = (n: string) => `${n}-${uid}`;

  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={id("wood")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={H.tableLight} />
          <stop offset="1" stopColor={H.table} />
        </linearGradient>
        <radialGradient id={id("vignette")} cx="50%" cy="50%" r="75%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <filter id={id("soft")}>
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width="800" height="600" fill={`url(#${id("wood")})`} />
      {/* 판재 이음새 */}
      {[150, 300, 450].map((y) => (
        <path key={y} d={`M0 ${y} H800`} stroke={H.woodDark} strokeWidth="3" opacity="0.55" />
      ))}
      {/* 나무 결 */}
      {GRAIN.map((g, i) => (
        <path
          key={i}
          d={`M0 ${g.y} C${200 + g.phase / 4} ${g.y - g.amp} ${500 - g.phase / 4} ${g.y + g.amp} 800 ${g.y}`}
          fill="none"
          stroke={g.dark ? H.woodDark : H.woodLight}
          strokeWidth="1.4"
          opacity="0.35"
        />
      ))}

      {/* 창살 빛: 따뜻한 칸이 격자로 비스듬히 */}
      <g transform="translate(-60 -40) skewX(-18)" filter={`url(#${id("soft")})`} opacity="0.22">
        {Array.from({ length: 7 }, (_, r) =>
          Array.from({ length: 6 }, (_, c) => (
            <rect key={`${r}-${c}`} x={40 + c * 46} y={20 + r * 46} width="38" height="38" fill={H.hanji} />
          )),
        )}
      </g>

      <rect width="800" height="600" fill={`url(#${id("vignette")})`} />
    </svg>
  );
}
