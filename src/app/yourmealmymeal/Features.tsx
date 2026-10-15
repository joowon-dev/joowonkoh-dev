import { C, CARD } from "./palette";
import { Motif, type MotifKind } from "./Wallpaper";

/**
 * 기능 카드. 흰 카드에 작은 수저 무늬 하나와 두 줄 — 앱처럼 조용하게 둔다.
 */
const FEATURES: { title: string; tail: string; kind: MotifKind; color: string; soft: string }[] = [
  { title: "식판 한 칸씩", tail: "찍거나 앨범에서 골라 칸에 쏙", kind: "bowl", color: C.mint, soft: C.mintSoft },
  { title: "담을 자리는 직접", tail: "밀고 키워서 밥이 안 잘리게", kind: "spoon", color: C.yolk, soft: C.yolkSoft },
  { title: "빈 칸엔 콕", tail: "아직 안 먹었으면 살짝 찔러요", kind: "fork", color: C.tomato, soft: C.tomatoSoft },
  { title: "식판은 하나", tail: "한 번 올리면 모든 모임에", kind: "bowl", color: C.yolk, soft: C.yolkSoft },
  { title: "반응 · 댓글", tail: "맛있겠다 한마디면 충분", kind: "star", color: C.tomato, soft: C.tomatoSoft },
  { title: "하루를 한 장으로", tail: "그날 식판을 사진첩에 저장", kind: "spoon", color: C.mint, soft: C.mintSoft },
];

export default function Features() {
  return (
    <div className="grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
      {FEATURES.map((f) => (
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
