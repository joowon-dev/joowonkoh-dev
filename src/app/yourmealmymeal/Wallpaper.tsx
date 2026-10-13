import type { ReactNode } from "react";

import { C } from "./palette";

/**
 * 수저·포크·그릇·반짝이. 선으로 그리지 않고 통째로 채운다.
 * 바탕에 흩뿌리지는 않고, 식판을 다 채웠을 때 튀어 오르는 반짝이로만 쓴다.
 */
export type MotifKind = "spoon" | "fork" | "bowl" | "star";

const VIEW_BOX: Record<MotifKind, [number, number]> = {
  spoon: [40, 100],
  fork: [40, 100],
  bowl: [60, 46],
  star: [40, 40],
};

export function Motif({
  kind,
  size,
  color,
  opacity = 1,
}: {
  kind: MotifKind;
  /** 높이(px). 너비는 비율로 정해진다. */
  size: number;
  color: string;
  opacity?: number;
}) {
  const [w, h] = VIEW_BOX[kind];
  return (
    <svg width={(size * w) / h} height={size} viewBox={`0 0 ${w} ${h}`} fill={color} fillOpacity={opacity} aria-hidden>
      {kind === "spoon" ? (
        <>
          <ellipse cx={20} cy={23} rx={16.5} ry={21.5} />
          <rect x={13.5} y={38} width={13} height={58} rx={6.5} />
        </>
      ) : kind === "fork" ? (
        <>
          <rect x={3.5} y={5} width={9.5} height={31} rx={4.75} />
          <rect x={15.25} y={5} width={9.5} height={31} rx={4.75} />
          <rect x={27} y={5} width={9.5} height={31} rx={4.75} />
          <rect x={5} y={27} width={30} height={19} rx={9.5} />
          <rect x={13.5} y={40} width={13} height={56} rx={6.5} />
        </>
      ) : kind === "bowl" ? (
        <>
          <path d="M3 15h54c0 14.9-12.1 27-27 27S3 29.9 3 15z" />
          <rect x={0} y={8} width={60} height={9} rx={4.5} />
        </>
      ) : (
        <path d="M20 0c1.9 12.6 5.5 16.2 18 18-12.5 1.8-16.1 5.4-18 18-1.9-12.6-5.5-16.2-18-18 12.5-1.8 16.1-5.4 18-18z" />
      )}
    </svg>
  );
}

/**
 * 밝은 회색 바탕. 앱의 배경과 같고, 네밥내밥 페이지 전체를 덮는다.
 * 위쪽에만 노른자·민트 빛이 아주 옅게 번진다 — 유리 머리막대 뒤로 색이 비쳐 보이게.
 */
export default function Wallpaper({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-clip" style={{ background: C.bg, color: C.ink }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden>
        <div
          className="absolute -left-24 -top-32 h-[380px] w-[380px] rounded-full"
          style={{ background: C.yolk, opacity: 0.18, filter: "blur(90px)" }}
        />
        <div
          className="absolute -right-24 -top-16 h-[340px] w-[340px] rounded-full"
          style={{ background: C.tray, opacity: 0.3, filter: "blur(90px)" }}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
