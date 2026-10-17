import styles from "./roadster.module.css";

/**
 * 로드스터 자리에 들어간 택배 상자. 옆에서 본 골판지 상자이고, 바닥에
 * 분사구가 달려 있다. 위 덮개 두 장이 양쪽 경첩으로 젖혀지면 열린다.
 */
export default function Box() {
  return (
    <svg viewBox="0 0 100 84" className="block w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id="rb-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff8d8" />
          <stop offset="0.5" stopColor="#ffd36b" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffb13b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rb-beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 열린 상자에서 새는 빛 */}
      <g className={styles.glow}>
        <path d="M6 18 L94 18 L150 -150 L-50 -150 Z" fill="url(#rb-beam)" />
        <ellipse cx="50" cy="18" rx="50" ry="8" fill="url(#rb-glow)" />
      </g>

      {/* 분사구 — 로드스터의 냉가스 추진기 흉내 */}
      <rect x="14" y="78" width="12" height="5" rx="1.5" fill="#3a3f4b" />
      <rect x="74" y="78" width="12" height="5" rx="1.5" fill="#3a3f4b" />

      {/* 몸통 */}
      <rect x="2" y="16" width="96" height="64" rx="3" fill="#c98f4c" />
      <rect x="2" y="16" width="96" height="10" fill="#b37a3b" />
      <rect x="44" y="16" width="12" height="64" fill="#e2c08a" opacity="0.9" />

      {/* 운송장 */}
      <g transform="rotate(-4 26 52)">
        <rect x="9" y="40" width="32" height="22" rx="1.5" fill="#f6f1e4" />
        <rect x="12" y="44" width="16" height="3" fill="#2b2b2b" />
        <rect x="12" y="50" width="24" height="2" fill="#9a9a9a" />
        <rect x="12" y="55" width="20" height="2" fill="#9a9a9a" />
      </g>
      {/* 이쪽이 위 */}
      <path d="M72 58 L72 46 M68 50 L72 45 L76 50 M82 58 L82 46 M78 50 L82 45 L86 50" stroke="#5c3a17" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="77" y="69" textAnchor="middle" fontSize="7" fontWeight="700" fill="#5c3a17" fontFamily="system-ui, sans-serif">
        취급주의
      </text>

      {/* 덮개 두 장. 바깥쪽 끝이 경첩이다 */}
      <rect className={styles.flapL} x="2" y="12" width="48" height="6" rx="1.5" fill="#d9a35e" />
      <rect className={styles.flapR} x="50" y="12" width="48" height="6" rx="1.5" fill="#d29a55" />
    </svg>
  );
}

/** 상자가 뛰어넘는 차 다섯 대. 맨 끝은 세미 트럭이다 — 로드스터도 세미를 넘었다 */
export function Cars() {
  const sedan = (x: number, color: string) => (
    <g key={x} transform={`translate(${x} 0)`}>
      <path d="M2 34 L2 26 Q3 22 10 21 L16 14 Q18 12 24 12 L38 12 Q42 12 46 16 L52 21 Q58 22 58 27 L58 34 Z" fill={color} />
      <path d="M18 15 L24 14 L36 14 L42 20 L14 20 Z" fill="#1d2440" opacity="0.8" />
      <circle cx="14" cy="34" r="6" fill="#121218" />
      <circle cx="46" cy="34" r="6" fill="#121218" />
    </g>
  );
  return (
    <svg viewBox="0 0 330 40" className="block w-full" aria-hidden>
      {sedan(0, "#e7e7ee")}
      {sedan(62, "#2b2f3d")}
      {sedan(124, "#8d96a8")}
      {sedan(186, "#e7e7ee")}
      {/* 세미 */}
      <g transform="translate(250 0)">
        <rect x="0" y="4" width="54" height="30" rx="3" fill="#c7cbd6" />
        <path d="M56 34 L56 12 Q57 6 64 6 L72 6 Q78 8 80 18 L80 34 Z" fill="#e7e7ee" />
        <path d="M64 9 L72 9 L76 18 L62 18 Z" fill="#1d2440" opacity="0.8" />
        <circle cx="12" cy="34" r="6" fill="#121218" />
        <circle cx="40" cy="34" r="6" fill="#121218" />
        <circle cx="70" cy="34" r="6" fill="#121218" />
      </g>
    </svg>
  );
}
