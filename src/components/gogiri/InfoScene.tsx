import type { ReactNode } from "react";
import { LINKS, PLACE, SOURCES } from "./info";
import { G, SERIF } from "./palette";
import { Grain, Photo } from "./stage";

const ROWS: [string, string][] = [
  ["주소", PLACE.address],
  ["영업", `${PLACE.hours}, ${PLACE.weekendHours}`],
  ["휴무", PLACE.closed],
  ["주차", PLACE.parking],
  ["웨이팅", `${PLACE.waiting}. ${PLACE.quietHours}`],
];

/** 마지막 장면: 가게 정면을 배경으로, 찾아가는 데 필요한 것만 */
export default function InfoScene({ children }: { children?: ReactNode }) {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pt-28 pb-20" style={{ background: G.inkDeep }}>
      <div className="absolute inset-0" aria-hidden>
        <Photo name="facade" alt="" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(rgba(20,18,16,0.55), ${G.inkDeep} 75%)` }} />
      </div>
      <Grain />

      <div className="relative w-full max-w-xl">
        <h2 className="text-4xl font-bold sm:text-5xl" style={{ fontFamily: SERIF, color: G.mist }}>
          {PLACE.name}
        </h2>
        <p className="mt-2 text-sm" style={{ color: G.oilLight }}>
          {PLACE.since}
        </p>

        <dl className="mt-8">
          {ROWS.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[5rem_1fr] gap-3 border-b py-3.5" style={{ borderColor: "rgba(239,233,220,0.14)" }}>
              <dt className="text-sm" style={{ color: G.mistDim }}>
                {k}
              </dt>
              <dd className="text-[15px] leading-relaxed" style={{ color: G.mist }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap gap-2.5">
          {[
            ["네이버 지도에서 보기", LINKS.naverMap],
            ["카카오맵에서 보기", LINKS.kakaoMap],
            ["캐치테이블 줄서기", LINKS.catchtable],
          ].map(([label, href], i) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3CD72]"
              style={
                i === 0
                  ? { background: G.oil, color: G.gim }
                  : { color: G.mist, boxShadow: "inset 0 0 0 1.5px rgba(239,233,220,0.3)", background: "rgba(20,18,16,0.4)" }
              }
            >
              {label}
            </a>
          ))}
        </div>

        {children && <div className="mt-10 [&_p]:max-w-none [&_p]:text-[15px] [&_p]:text-[#D9CFBE]">{children}</div>}

        <p className="mt-10 text-xs leading-relaxed" style={{ color: G.mistDim }}>
          영업시간은 2026년 10월에 모은 정보라 바뀔 수 있으니 가기 전에 한 번 확인하세요. 정보 출처:{" "}
          {SOURCES.map((s, i) => (
            <span key={s.href}>
              {i > 0 && ", "}
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {s.label}
              </a>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
