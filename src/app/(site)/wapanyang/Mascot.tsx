/**
 * 앱 마스코트 낙서 고양이 — 표정이 보안 등급, 머리 위 와이파이 막대가 속도다.
 *
 * 앱의 `src/core/mascotSvg.ts` 와 같은 좌표와 틀(viewBox 14 -22 166 146)을 React SVG 로 옮겼다. 앱 그림을 고치면 여기도 고친다.
 * 2026-10-13 앱 1.1.1 그림: 거친 마커(선마다 불규칙 점선을 한 겹 더), 물결 수염, 짧은 턱.
 */
import { Fragment } from "react";

import { C } from "./palette";

export type Mood = "neutral" | "happy" | "puzzled" | "shocked";
/** 0 못 잼 · 1 느림 · 2 유튜브 HD · 3 넷플릭스 4K */
export type Bars = 0 | 1 | 2 | 3;

const LINE = {
  fill: "none",
  stroke: C.ink,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** 앱 mascotSvg.ts 의 ROUGH 와 같다. */
const ROUGH = { extra: 0.9, dash: "0.3 0.5 0.15 0.8 0.45 0.35 0.2 1 0.6 0.4 0.1 0.7" };

/** 마커 선 하나 = 매끈한 선 + 까끌한 테두리. */
function Ink({ d, width }: { d: string; width: number }) {
  return (
    <>
      <path d={d} {...LINE} strokeWidth={width} />
      <path d={d} stroke={C.ink} strokeLinejoin="round" fill="none" strokeWidth={width + ROUGH.extra} strokeDasharray={ROUGH.dash} />
    </>
  );
}

/** 귀 옆에 얹는 낙서(물음표·땀)는 흰 테두리를 먼저 깔아 묻히지 않게 한다. */
function Halo({ d, width }: { d: string; width: number }) {
  return (
    <>
      <path d={d} {...LINE} stroke={C.card} strokeWidth={width + 6} />
      <Ink d={d} width={width} />
    </>
  );
}

/** 정수리 위 (92, 27)를 중심으로 반지름 15·28·41, 좌우 44도 부채꼴. 켜진 막대는 실선, 꺼진 막대는 흐린 점선. */
function Signal({ bars }: { bars: Bars }) {
  const cx = 92;
  const cy = 27;
  const a = (44 * Math.PI) / 180;
  return (
    <>
      <circle cx={cx} cy={cy - 2} r={4.5} fill={C.ink} />
      {[15, 28, 41].map((r, i) => {
        const dx = +(r * Math.sin(a)).toFixed(1);
        const y = +(cy - r * Math.cos(a)).toFixed(1);
        const d = `M${(cx - dx).toFixed(1)} ${y} A${r} ${r} 0 0 1 ${(cx + dx).toFixed(1)} ${y}`;
        return (
          <Fragment key={r}>
            {i < bars ? <Ink d={d} width={6} /> : <path d={d} {...LINE} strokeWidth={6} strokeDasharray="1 9" opacity={0.45} />}
          </Fragment>
        );
      })}
    </>
  );
}

export default function Mascot({ mood = "happy", bars = 3, width = 200 }: { mood?: Mood; bars?: Bars; width?: number }) {
  return (
    <svg width={width} height={(width * 146) / 166} viewBox="14 -22 166 146" aria-hidden>
      <Signal bars={bars} />
      <Ink
        d="M43 47 Q40.5 36 41.4 26.8 Q42 21 48 22 L58.5 22 Q62.5 22.7 65.7 29.5 L73.3 38.9 Q89 33.5 105.7 34.3 Q110 36 113.8 46.2 L140.8 37 Q145.5 38 144.5 47 L141 59.7"
        width={6.5}
      />
      <Ink
        d="M24.7 67.4 Q37 66 49 71.3 M22 98.4 Q34 88 50.4 85.6 M127.3 82.1 Q138 84 144.9 92.4 M124 97.5 Q133 101 136.8 112.6"
        width={6}
      />

      {mood === "happy" ? (
        <Ink d="M67 77 Q73 67 79 77 M98 78 Q104 68 110 78" width={5.5} />
      ) : mood === "shocked" ? (
        <>
          <circle cx={73.3} cy={73.2} r={8} fill={C.card} stroke={C.ink} strokeWidth={4} />
          <circle cx={104.4} cy={74.8} r={8} fill={C.card} stroke={C.ink} strokeWidth={4} />
          <circle cx={73.3} cy={74} r={2.8} fill={C.ink} />
          <circle cx={104.4} cy={75.6} r={2.8} fill={C.ink} />
        </>
      ) : (
        <>
          <circle cx={73.3} cy={73.2} r={6} fill={C.ink} />
          <circle cx={104.4} cy={74.8} r={6} fill={C.ink} />
        </>
      )}

      {mood === "shocked" ? (
        <ellipse cx={86} cy={108} rx={4.5} ry={5.5} fill={C.card} stroke={C.ink} strokeWidth={4} />
      ) : (
        <Ink d="M64 106 Q68 113 79 113.5 L96 113.6" width={6.5} />
      )}

      {mood === "puzzled" && (
        <>
          <Halo d="M154 16 Q157 6 165 9 Q171 13 164 20 Q161 22 161 27" width={4.5} />
          <circle cx={161} cy={35} r={2.8} fill={C.ink} />
        </>
      )}
      {mood === "shocked" && <Halo d="M152 22 L159 16 M155 31 L164 28" width={4} />}
    </svg>
  );
}
