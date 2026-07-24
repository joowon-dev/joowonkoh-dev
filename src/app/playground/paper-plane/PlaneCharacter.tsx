"use client";

export function PlaneCharacter({
  rotation,
  blowing,
}: {
  rotation: number;
  blowing: boolean;
}) {
  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className="spring-transition"
      aria-hidden
    >
      <svg width="88" height="72" viewBox="0 0 88 72" fill="none">
        {/* 종이비행기 */}
        <path d="M2 36 L86 6 L50 40 Z" fill="#ffffff" stroke="#c7d2fe" strokeWidth="2" strokeLinejoin="round" />
        <path d="M50 40 L86 6 L58 66 Z" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 36 L50 40 L34 52 Z" fill="#e0e7ff" stroke="#c7d2fe" strokeWidth="2" strokeLinejoin="round" />
        {/* 고양이 */}
        <g transform="translate(40 20)">
          <path d="M-8 -6 L-4 -14 L0 -6 Z" fill="#f8b3c5" /> {/* 왼귀 */}
          <path d="M8 -6 L4 -14 L0 -6 Z" fill="#f8b3c5" /> {/* 오른귀 */}
          <circle cx="0" cy="0" r="10" fill="#fcd9b8" />
          <circle cx="-4" cy="-1" r="1.6" fill="#3b3b3b" />
          <circle cx="4" cy="-1" r="1.6" fill="#3b3b3b" />
          <circle cx="-6" cy="3" r="2" fill="#f8b3c5" opacity="0.7" />
          <circle cx="6" cy="3" r="2" fill="#f8b3c5" opacity="0.7" />
          <path
            d={blowing ? "M-3 4 Q0 8 3 4" : "M-3 5 Q0 6 3 5"}
            stroke="#a86a4a"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>
      {blowing && (
        <div className="pointer-events-none absolute -left-6 top-8 animate-fade-in-up text-lg select-none">
          🌬️
        </div>
      )}
    </div>
  );
}
