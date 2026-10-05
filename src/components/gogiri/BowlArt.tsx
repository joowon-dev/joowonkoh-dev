import type { MenuKey } from "./info";
import { G } from "./palette";

/**
 * 위에서 내려다본 막국수 한 그릇.
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
const STRANDS = Array.from({ length: 84 }, () => {
  const cx = 100 + (rand() - 0.5) * 22;
  const cy = 100 + (rand() - 0.5) * 22;
  const r = 6 + rand() * 40;
  const a0 = rand() * Math.PI * 2;
  const a1 = a0 + 0.6 + rand() * 1.4;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  return {
    d: `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`,
    shade: rand() > 0.55,
  };
});

/** 김가루 조각: 면 더미 위에 흩어진다 */
export const FLAKES = Array.from({ length: 34 }, () => {
  const r = rand() * 40;
  const a = rand() * Math.PI * 2;
  return {
    x: 100 + r * Math.cos(a),
    y: 100 + r * Math.sin(a),
    w: 3 + rand() * 5,
    h: 1.6 + rand() * 2.4,
    rot: rand() * 180,
  };
});

const SESAME = Array.from({ length: 22 }, () => {
  const r = rand() * 38;
  const a = rand() * Math.PI * 2;
  return { x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a), rot: rand() * 180 };
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
  if (kind === "suyuk") return <SuyukArt className={className} title={title} />;

  const mound = 0.25 + 0.75 * Math.max(0, Math.min(1, noodles));
  const brothLevel = kind === "mul" ? 1 : broth;
  const flakeCount = kind === "deulgireum" ? Math.round(FLAKES.length * gim) : 0;
  const empty = noodles <= 0;

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={title ?? "막국수 한 그릇"}>
      {/* 그림자와 그릇 */}
      <ellipse cx="104" cy="108" rx="92" ry="90" fill={G.forestDeep} opacity="0.45" />
      <circle cx="100" cy="100" r="92" fill={G.bowl} />
      <circle cx="100" cy="100" r="92" fill="none" stroke={G.bowlShade} strokeWidth="3" />
      <circle cx="100" cy="100" r="76" fill="#EDEDE6" />
      <circle cx="100" cy="100" r="76" fill="none" stroke={G.bowlShade} strokeWidth="1.5" />

      {/* 동치미 육수 */}
      {brothLevel > 0 && (
        <circle cx="100" cy="100" r={40 + 35 * brothLevel} fill={G.broth} opacity={0.35 + 0.5 * brothLevel} />
      )}

      {/* 면 더미 */}
      {!empty && (
        <g transform={`translate(100 100) scale(${mound}) translate(-100 -100)`}>
          <circle cx="100" cy="100" r="50" fill={kind === "bibim" ? "#B9876B" : G.noodleDark} />
          {STRANDS.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill="none"
              stroke={kind === "bibim" ? (s.shade ? "#A5523A" : "#C7795A") : s.shade ? G.noodleDark : G.noodle}
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          ))}
          {kind === "bibim" && <ellipse cx="96" cy="94" rx="22" ry="17" fill="#B3301F" />}
          {(kind === "mul" || kind === "bibim") && (
            <g>
              <ellipse cx="122" cy="84" rx="15" ry="13" fill="#FFFDF4" />
              <circle cx="122" cy="84" r="7" fill={G.oilLight} />
              <ellipse cx="78" cy="118" rx="9" ry="5" fill="#7FA35E" transform="rotate(-25 78 118)" />
              <ellipse cx="88" cy="128" rx="9" ry="5" fill="#93B872" transform="rotate(10 88 128)" />
            </g>
          )}
          {kind === "deulgireum" && (
            <g>
              {/* 들기름 윤기 */}
              <ellipse cx="92" cy="90" rx="34" ry="26" fill={G.oil} opacity={0.32 * oil} />
              <ellipse cx="84" cy="82" rx="12" ry="6" fill={G.oilLight} opacity={0.7 * oil} transform="rotate(-30 84 82)" />
              {SESAME.slice(0, Math.round(SESAME.length * gim)).map((s, i) => (
                <ellipse key={i} cx={s.x} cy={s.y} rx="1.6" ry="0.9" fill="#F3E6C4" transform={`rotate(${s.rot} ${s.x} ${s.y})`} />
              ))}
              {FLAKES.slice(0, flakeCount).map((f, i) => (
                <rect
                  key={i}
                  x={f.x - f.w / 2}
                  y={f.y - f.h / 2}
                  width={f.w}
                  height={f.h}
                  rx="0.6"
                  fill={G.gim}
                  transform={`rotate(${f.rot} ${f.x} ${f.y})`}
                />
              ))}
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
      <ellipse cx="104" cy="110" rx="94" ry="74" fill={G.forestDeep} opacity="0.45" />
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
