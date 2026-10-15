/**
 * 네밥내밥의 빈 민트 급식판. 앱 아이콘(icon.svg)에서 흰 바탕만 뺀 그림이다 —
 * 앱의 src/components/AppMark.tsx와 같은 그림이니 고치면 둘 다 고친다.
 * 아이콘 바탕 없이 쓸 때는 판이 꽉 차 보이게 translate·scale 로 키운다.
 */
const WELLS: [number, number][] = [
  [230, 230],
  [530, 230],
  [230, 530],
  [530, 530],
];

export default function TrayMark({
  size,
  className,
  title,
}: {
  size: number;
  className?: string;
  /** 있으면 그림으로 읽히고, 없으면 꾸밈으로 숨긴다. */
  title?: string;
}) {
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
      <g transform="translate(-110 -110) scale(1.2148)">
        <rect x={150} y={452} width={60} height={120} rx={24} fill="#49B796" />
        <rect x={814} y={452} width={60} height={120} rx={24} fill="#49B796" />
        <rect x={182} y={182} width={660} height={660} rx={150} fill="#5CC8A8" />
        {WELLS.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={264} height={264} rx={64} fill="#000000" fillOpacity={0.14} />
            <rect x={x} y={y + 14} width={264} height={250} rx={62} fill="#FFFFFF" />
          </g>
        ))}
      </g>
    </svg>
  );
}
