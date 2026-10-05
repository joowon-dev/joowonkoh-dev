import type { ReactNode } from "react";
import { LINKS, PLACE, SOURCES } from "./info";
import { G, SERIF } from "./palette";

const ROWS: [string, string][] = [
  ["주소", PLACE.address],
  ["영업", `${PLACE.hours}, ${PLACE.weekendHours}`],
  ["휴무", PLACE.closed],
  ["주차", PLACE.parking],
  ["웨이팅", `${PLACE.waiting}. ${PLACE.quietHours}`],
];

/** 마지막 장면: 찾아가는 데 필요한 것만 */
export default function InfoScene({ children }: { children?: ReactNode }) {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center px-5 pt-28 pb-20" style={{ background: G.forestDeep }}>
      <div className="w-full max-w-xl">
        <h2 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: SERIF, color: G.mist }}>
          {PLACE.name}
        </h2>
        <p className="mt-2 text-sm" style={{ color: G.oilLight }}>
          {PLACE.since}
        </p>

        <dl className="mt-8 divide-y" style={{ borderColor: G.moss }}>
          {ROWS.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[5rem_1fr] gap-3 py-3.5" style={{ borderColor: G.moss }}>
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
              className="rounded-full px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3CD72]"
              style={i === 0 ? { background: G.oil, color: G.gim } : { color: G.mist, boxShadow: `inset 0 0 0 1.5px ${G.moss}` }}
            >
              {label}
            </a>
          ))}
        </div>

        {children && (
          <div className="mt-10 [&_p]:max-w-none [&_p]:text-[15px] [&_p]:text-[#C9D6CD]">{children}</div>
        )}

        <p className="mt-10 text-xs leading-relaxed" style={{ color: G.mistDim }}>
          영업시간과 가격은 2026년 10월 기준으로 모은 정보예요. 바뀔 수 있으니 가기 전에 한 번 확인하세요. 정보 출처:{" "}
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
