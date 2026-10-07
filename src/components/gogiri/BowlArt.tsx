import { useId } from "react";
import type { MenuKey } from "./info";
import { G } from "./palette";

/**
 * 위에서 내려다본 막국수 한 그릇.
 *
 * 고기리 들기름막국수는 은색 스테인리스 대접에 나온다. 메밀면 위를 고운
 * 김가루와 깨가루가 담요처럼 덮고, 가장자리로 면이 조금 비친다.
 *
 * 면·육수·들기름·김가루의 양을 0–1 로 받아 그린다. 장면마다 이 값만
 * 바꿔서 «그릇이 나온다», «먹는다», «육수를 붓는다» 를 보여 준다.
 */

/** 항상 같은 그림이 나오도록 씨앗을 고정한 난수 */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const rand = seeded(20121);

/** 면 가닥: 중심이 조금씩 어긋난 호를 겹쳐 엉킨 메밀면처럼 */
const STRANDS = Array.from({ length: 130 }, () => {
  const cx = 100 + (rand() - 0.5) * 16;
  const cy = 100 + (rand() - 0.5) * 16;
  const r = 30 + rand() * 30;
  const a0 = rand() * Math.PI * 2;
  const a1 = a0 + 0.5 + rand() * 1.3;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  return {
    d: `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`,
    shade: rand() > 0.55,
  };
});

/** 김가루 더미의 울퉁불퉁한 가장자리 */
const GIM_EDGE = (() => {
  const n = 28;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 50 + rand() * 6;
    return [100 + r * Math.cos(a), 100 + r * Math.sin(a)];
  });
  // 점 사이를 곡선으로 잇는다(중점을 지나는 2차 곡선)
  const mid = (p: number[], q: number[]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const start = mid(pts[n - 1], pts[0]);
  let d = `M${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    d += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + " Z";
})();

/** 위에서 흩날려 떨어지는 김가루(장면 연출용) */
export const FLAKES = Array.from({ length: 60 }, () => {
  const r = rand() * 42;
  const a = rand() * Math.PI * 2;
  return {
    x: 100 + r * Math.cos(a),
    y: 100 + r * Math.sin(a),
    w: 1.2 + rand() * 2.4,
    h: 1 + rand() * 1.6,
    rot: rand() * 180,
    sesame: rand() > 0.72,
  };
});

interface Props {
  kind?: MenuKey;
  /** 남은 면 0–1 */
  noodles?: number;
  /** 육수가 찬 정도 0–1 */
  broth?: number;
  /** 들기름 윤기 0–1 */
  oil?: number;
  /** 김가루가 내려앉은 정도 0–1 */
  gim?: number;
  className?: string;
  title?: string;
}

export default function BowlArt({
  kind = "deulgireum",
  noodles = 1,
  broth = 0,
  oil = 1,
  gim = 1,
  className,
  title,
}: Props) {
  // 한 화면에 그릇이 여럿 겹치므로 그라디언트·필터 id 가 겹치면 안 된다
  const uid = useId().replace(/:/g, "");
  if (kind === "suyuk") return <SuyukArt className={className} title={title} />;

  const mound = 0.25 + 0.75 * Math.max(0, Math.min(1, noodles));
  const brothLevel = kind === "mul" ? 1 : broth;
  const empty = noodles <= 0;
  const id = (name: string) => `${name}-${uid}`;

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title ?? "막국수 한 그릇"}>
      <defs>
        {/* 스테인리스: 테두리는 밝고, 안쪽 벽은 둥글게 어두워졌다 밝아진다 */}
        <radialGradient id={id("rim")} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#F1F3F4" />
          <stop offset="0.55" stopColor="#B9BFC4" />
          <stop offset="1" stopColor="#868D93" />
        </radialGradient>
        <radialGradient id={id("well")} cx="60%" cy="64%" r="70%">
          <stop offset="0" stopColor="#C9CED2" />
          <stop offset="0.6" stopColor="#9EA5AB" />
          <stop offset="1" stopColor="#6E767C" />
        </radialGradient>
        <radialGradient id={id("noodlebed")} cx="50%" cy="50%" r="50%">
          <stop offset="0.6" stopColor={G.noodleDark} />
          <stop offset="1" stopColor={G.noodleDark} stopOpacity="0" />
        </radialGradient>
        {/* 고운 김가루: 노이즈를 점으로 끊어 낸다 */}
        <filter id={id("gim")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.32  0 0 0 0 0.24  0 0 0 11 -5.6" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        {/* 깨가루 */}
        <filter id={id("sesame")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="21" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.88  0 0 0 0 0.8  0 0 0 0 0.62  0 0 0 16 -9.4" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {/* 나무 상 위의 그림자와 대접 */}
      <ellipse cx="106" cy="110" rx="94" ry="92" fill="#000" opacity="0.32" />
      <circle cx="100" cy="100" r="94" fill={`url(#${id("rim")})`} />
      <circle cx="100" cy="100" r="94" fill="none" stroke="#7B8288" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="80" fill={`url(#${id("well")})`} />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#E8EBED" strokeWidth="1.4" opacity="0.8" />
      {/* 금속 반사 */}
      <path d="M44 58 A70 70 0 0 1 86 26" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.55" />

      {/* 동치미 육수 */}
      {brothLevel > 0 && (
        <circle cx="100" cy="100" r={44 + 34 * brothLevel} fill={G.broth} opacity={0.3 + 0.45 * brothLevel} />
      )}

      {!empty && (
        <g transform={`translate(100 100) scale(${mound}) translate(-100 -100)`}>
          <circle cx="100" cy="100" r="62" fill={kind === "bibim" ? "#B9876B" : `url(#${id("noodlebed")})`} />
          {STRANDS.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill="none"
              stroke={kind === "bibim" ? (s.shade ? "#A5523A" : "#C7795A") : s.shade ? G.noodleDark : G.noodle}
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          ))}

          {kind === "deulgireum" && (
            <g>
              {/* 들기름이 배어 면이 윤기 나는 자리 */}
              <circle cx="100" cy="100" r="60" fill={G.oil} opacity={0.22 * oil} />
              {/* 김가루 담요 */}
              <g opacity={gim}>
                <path d={GIM_EDGE} fill="#18201A" />
                <path d={GIM_EDGE} fill="#000" filter={`url(#${id("gim")})`} />
                <path d={GIM_EDGE} fill="#000" filter={`url(#${id("sesame")})`} />
              </g>
            </g>
          )}

          {kind === "bibim" && <ellipse cx="96" cy="94" rx="22" ry="17" fill="#B3301F" />}
          {(kind === "mul" || kind === "bibim") && (
            <g>
              <ellipse cx="122" cy="84" rx="15" ry="13" fill="#FFFDF4" />
              <circle cx="122" cy="84" r="7" fill={G.oilLight} />
              <ellipse cx="78" cy="118" rx="9" ry="5" fill="#7FA35E" transform="rotate(-25 78 118)" />
              <ellipse cx="88" cy="128" rx="9" ry="5" fill="#93B872" transform="rotate(10 88 128)" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}

function SuyukArt({ className, title }: { className?: string; title?: string }) {
  const slices = Array.from({ length: 7 }, (_, i) => i);
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title ?? "수육 한 접시"}>
      <ellipse cx="106" cy="112" rx="94" ry="74" fill="#000" opacity="0.32" />
      <ellipse cx="100" cy="102" rx="94" ry="72" fill={G.bowl} />
      <ellipse cx="100" cy="102" rx="78" ry="58" fill="#EDEDE6" />
      {slices.map((i) => {
        const x = 46 + i * 17;
        return (
          <g key={i} transform={`rotate(${-14 + i * 2} ${x} 102)`}>
            <rect x={x - 9} y="70" width="18" height="64" rx="5" fill="#E9C7B5" />
            <rect x={x - 9} y="70" width="18" height="14" rx="5" fill="#F7EEE4" />
            <rect x={x - 9} y="120" width="18" height="14" rx="5" fill="#B98B73" />
          </g>
        );
      })}
      <ellipse cx="150" cy="140" rx="14" ry="9" fill="#C9D9A6" />
    </svg>
  );
}
