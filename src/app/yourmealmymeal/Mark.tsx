import { useId } from "react";

/**
 * 네밥내밥 식판 — 흰 식판 하나에 회색 칸 넷. 앱의 src/components/AppMark.tsx와 같은 그림이니 고치면 둘 다 고친다.
 * backdrop="square"면 앱 아이콘 그대로(노른자 둥근 네모), "none"이면 식판만 꽉 차게 키운다.
 * lunch를 끄면 네 칸 모두 비어 있는 빈 식판이다.
 */
const WELLS: [number, number][] = [
  [204, 204],
  [530, 204],
  [204, 530],
  [530, 530],
];
const LUNCH = 1; // 오른쪽 위 칸

export default function TrayMark({
  size,
  className,
  title,
  backdrop = "none",
  lunch = true,
}: {
  size: number;
  className?: string;
  /** 있으면 그림으로 읽히고, 없으면 꾸밈으로 숨긴다. */
  title?: string;
  backdrop?: "none" | "square";
  lunch?: boolean;
}) {
  const shade = `tray-shade-${useId().replace(/:/g, "")}`;
  const bare = backdrop === "none";
  return (
    <svg
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={shade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000000" stopOpacity={0.1} />
          <stop offset="0.25" stopColor="#000000" stopOpacity={0} />
        </linearGradient>
      </defs>
      {bare ? null : <rect width={1024} height={1024} rx={230} fill="#FFC531" />}
      <g transform={bare ? "translate(-150 -150) scale(1.293)" : undefined}>
        <rect x={160} y={174} width={704} height={704} rx={114} fill="#000000" fillOpacity={0.1} />
        <rect x={160} y={160} width={704} height={704} rx={114} fill="#FFFFFF" />
        {WELLS.map(([x, y], i) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={290} height={290} rx={70} fill={lunch && i === LUNCH ? "#E8452F" : "#ECECEC"} />
            <rect x={x} y={y} width={290} height={290} rx={70} fill={`url(#${shade})`} />
          </g>
        ))}
      </g>
    </svg>
  );
}
