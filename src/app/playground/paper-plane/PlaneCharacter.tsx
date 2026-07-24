"use client";

const CREAM = "#fde7cf";
const CREAM_SHADE = "#f2d3ab";
const BLUSH = "#ffc2ce";
const INK = "#4a4038";
const PLANE = "#ffffff";
const PLANE_SHADE = "#dfe6ff";
const PLANE_LINE = "#b9c4f0";

export function PlaneCharacter({
  view,
  blowing = false,
}: {
  view: "front" | "back";
  blowing?: boolean;
}) {
  if (view === "front") {
    // 앞모습: 큰 동그란 머리 + 점 눈 + 발그레 볼 + 작은 입, 종이비행기에 앉음
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
        <path d="M18 84 L102 84 L60 104 Z" fill={PLANE} stroke={PLANE_LINE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M60 104 L60 84 L36 92 Z" fill={PLANE_SHADE} stroke={PLANE_LINE} strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="60" cy="74" rx="16" ry="12" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" />
        <path d="M40 40 L34 20 L52 34 Z" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M80 40 L86 20 L68 34 Z" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M41 34 L38 25 L47 32 Z" fill={BLUSH} />
        <path d="M79 34 L82 25 L73 32 Z" fill={BLUSH} />
        <circle cx="60" cy="52" r="26" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" />
        <circle cx="46" cy="58" r="5" fill={BLUSH} opacity="0.8" />
        <circle cx="74" cy="58" r="5" fill={BLUSH} opacity="0.8" />
        <circle cx="51" cy="50" r="3" fill={INK} />
        <circle cx="69" cy="50" r="3" fill={INK} />
        <circle cx="52" cy="49" r="1" fill="#ffffff" />
        <circle cx="70" cy="49" r="1" fill="#ffffff" />
        <path d="M56 58 Q60 62 64 58" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // 뒤모습: 종이비행기 뒤태(V자, 위로 멀어짐) + 고양이 뒤통수/귀. blowing은 잔털 opacity에 사용.
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
      <path d="M60 30 L20 96 L60 80 Z" fill={PLANE} stroke={PLANE_LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 30 L100 96 L60 80 Z" fill={PLANE_SHADE} stroke={PLANE_LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 30 L60 80" stroke={PLANE_LINE} strokeWidth="2" />
      <circle cx="60" cy="52" r="20" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" />
      <path d="M45 40 L40 24 L56 36 Z" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M75 40 L80 24 L64 36 Z" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M56 40 Q60 34 64 40" stroke={CREAM_SHADE} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={blowing ? 1 : 0.6} />
    </svg>
  );
}
