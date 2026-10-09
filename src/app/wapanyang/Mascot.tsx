/**
 * 앱 마스코트 낙서 고양이 — 얼굴만 그리고, 표정이 보안 등급이다.
 *
 * 앱의 `src/core/mascotSvg.ts` 와 같은 좌표와 틀(viewBox 14 0 166 124)을 React SVG 로 옮겼다. 앱 그림을 고치면 여기도 고친다.
 */
import { C } from "./palette";

export type Mood = "neutral" | "happy" | "puzzled" | "shocked";

const LINE = {
  fill: "none",
  stroke: C.ink,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** 귀 옆에 얹는 낙서(물음표·땀)는 흰 테두리를 먼저 깔아 묻히지 않게 한다. */
function Halo({ d, width }: { d: string; width: number }) {
  return (
    <>
      <path d={d} {...LINE} stroke={C.card} strokeWidth={width + 6} />
      <path d={d} {...LINE} strokeWidth={width} />
    </>
  );
}

export default function Mascot({ mood = "happy", width = 200 }: { mood?: Mood; width?: number }) {
  return (
    <svg width={width} height={(width * 124) / 166} viewBox="14 0 166 124" aria-hidden>
      <path
        d="M43 47 Q40.5 36 41.4 26.8 Q42 21 48 22 L58.5 22 Q62.5 22.7 65.7 29.5 L73.3 38.9 Q89 33.5 105.7 34.3 Q110 36 113.8 46.2 L140.8 37 Q145.5 38 144.5 47 L141 59.7"
        {...LINE}
        strokeWidth={6.5}
      />
      <path
        d="M24.7 69.4 L49 71.3 M22 96.4 L50.4 85.6 M127.3 82.1 L144.9 92.4 M124 97.5 L136.8 112.6"
        {...LINE}
        strokeWidth={6}
      />

      {mood === "happy" ? (
        <path d="M67 77 Q73 67 79 77 M98 78 Q104 68 110 78" {...LINE} strokeWidth={5.5} />
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
        <path d="M53 100 Q60 113 76 114.5 L111 115.3" {...LINE} strokeWidth={6.5} />
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
