import { C, CARD } from "./palette";
import { Motif, type MotifKind } from "./Wallpaper";

/**
 * 기능 카드. 흰 카드에 작은 수저 무늬 하나와 두 줄 — 앱처럼 조용하게 둔다.
 */
/** 카드마다의 무늬와 색. 글(copy 의 landing.features)과 순서로 짝짓는다. */
const LOOKS: { kind: MotifKind; color: string; soft: string }[] = [
  { kind: "bowl", color: C.mint, soft: C.mintSoft },
  { kind: "spoon", color: C.yolk, soft: C.yolkSoft },
  { kind: "fork", color: C.tomato, soft: C.tomatoSoft },
  { kind: "bowl", color: C.yolk, soft: C.yolkSoft },
  { kind: "star", color: C.tomato, soft: C.tomatoSoft },
  { kind: "spoon", color: C.mint, soft: C.mintSoft },
];

export default function Features({ items }: { items: { title: string; tail: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
      {items.map((item, i) => ({ ...item, ...LOOKS[i % LOOKS.length] })).map((f) => (
        <div key={f.title} className="rounded-[22px] bg-white p-4 sm:p-5" style={CARD}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: f.soft }}>
            <Motif kind={f.kind} size={f.kind === "bowl" || f.kind === "star" ? 13 : 20} color={f.color} />
          </span>
          <h3 className="mt-3 text-[16px] leading-[1.3]" style={{ color: C.ink }}>
            {f.title}
          </h3>
          <p className="mt-1 text-[14px] leading-[1.5] break-keep" style={{ color: C.sub }}>
            {f.tail}
          </p>
        </div>
      ))}
    </div>
  );
}
