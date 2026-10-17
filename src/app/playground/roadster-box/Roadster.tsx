import styles from "./roadster.module.css";

/**
 * 옆에서 본 빨간 로드스터. 이 차가 곧 상자다 — 지붕(lid)이 뒤쪽 경첩을 축으로
 * 젖혀지면 차 속이 상자 속이 된다. 오른쪽이 앞이다.
 */
export default function Roadster({ flame = false }: { flame?: boolean }) {
  return (
    <svg viewBox="0 0 320 126" className="block w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="rb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff3b3b" />
          <stop offset="0.55" stopColor="#d3121c" />
          <stop offset="1" stopColor="#8e0a12" />
        </linearGradient>
        <linearGradient id="rb-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a5f8f" />
          <stop offset="1" stopColor="#141b33" />
        </linearGradient>
        <radialGradient id="rb-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff8d8" />
          <stop offset="0.5" stopColor="#ffd36b" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffb13b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rb-beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rb-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.35" stopColor="#ffc94a" />
          <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 역분사 불꽃 — 내려오는 동안만 */}
      {flame && (
        <g className={styles.flame}>
          <path d="M138 104 Q162 190 186 104 Z" fill="url(#rb-flame)" />
          <path d="M152 104 Q162 150 172 104 Z" fill="#fffbe6" />
        </g>
      )}

      {/* 바퀴 자리의 그늘 */}
      <circle cx="78" cy="104" r="21" fill="#0b0b14" />
      <circle cx="246" cy="104" r="21" fill="#0b0b14" />

      {/* 아래 몸통 = 상자 */}
      <path
        d="M20 102 L17 84 Q19 72 46 68 L62 66 L262 66 Q300 70 307 86 L305 102 Q290 106 268 104 A22 22 0 0 0 224 104 L100 104 A22 22 0 0 0 56 104 Q34 106 20 102 Z"
        fill="url(#rb-body)"
      />
      <path d="M44 76 L286 74" stroke="#ff8a8a" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="297" cy="82" rx="7" ry="3.5" fill="#fff7cf" />
      <rect x="17" y="79" width="7" height="6" rx="2" fill="#ff4a4a" />

      {/* 문짝에 붙은 운송장 */}
      <g transform="rotate(-3 160 86)">
        <rect x="128" y="78" width="64" height="18" rx="2.5" fill="#f6f1e4" />
        <rect x="128" y="78" width="10" height="18" rx="2" fill="#2b2b2b" />
        <text
          x="166"
          y="91"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fill="#2b2b2b"
          fontFamily="system-ui, sans-serif"
        >
          화성 직송
        </text>
      </g>

      {/* 열린 상자에서 새는 빛 */}
      <g className={styles.glow}>
        <path d="M70 66 L254 66 L330 -170 L-6 -170 Z" fill="url(#rb-beam)" />
        <ellipse cx="162" cy="66" rx="104" ry="13" fill="url(#rb-glow)" />
      </g>

      {/* 바퀴 */}
      {[78, 246].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="104" r="17" fill="#141418" />
          <circle cx={cx} cy="104" r="9" fill="#a9b0bd" />
          <circle cx={cx} cy="104" r="3" fill="#3b3f48" />
        </g>
      ))}

      {/* 지붕 = 상자 뚜껑. 뒤쪽 끝(62,66)이 경첩이다 */}
      <g className={styles.lid}>
        <path d="M62 66 L98 47 Q140 26 196 29 Q234 33 262 66 Z" fill="#b5101a" />
        <path d="M106 52 Q144 33 192 35 Q220 38 240 60 L104 61 Z" fill="url(#rb-glass)" />
        <path d="M118 50 Q146 38 170 37" stroke="#9fb4e6" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M150 36 L148 61" stroke="#b5101a" strokeWidth="4" />
      </g>
    </svg>
  );
}
