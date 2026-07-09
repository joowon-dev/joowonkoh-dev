"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "motion/react";

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

/** Lime tint per contribution level. */
const LEVEL_BG = [
  "rgba(255,255,255,0.05)",
  "rgba(198,242,78,0.22)",
  "rgba(198,242,78,0.42)",
  "rgba(198,242,78,0.68)",
  "rgba(198,242,78,1)",
];

export default function GithubContributions({
  username,
  displayTotal,
}: {
  username: string;
  displayTotal?: number;
}) {
  const [days, setDays] = useState<Day[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    let alive = true;
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((d) => {
        if (!alive) return;
        setDays(d.contributions ?? []);
        setTotal(d.total?.lastYear ?? null);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [username]);

  // Pad the start so the first column aligns to the correct weekday (Sun = 0).
  const cells = useMemo(() => {
    if (!days || days.length === 0) return [];
    const lead = new Date(days[0].date + "T00:00:00").getDay();
    return [...Array.from({ length: lead }, () => null), ...days];
  }, [days]);

  return (
    <div
      ref={ref}
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] md:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-white">
            멈추지 않은 1년
          </h3>
          <p className="mt-1 text-[13px] text-white/50">
            매일 조금씩, 퇴근 후에도 커밋을 쌓았습니다.
          </p>
        </div>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-medium text-white/50 transition-colors hover:text-[#C6F24E]"
        >
          {(displayTotal ?? total) !== null ? (
            <>
              <span className="font-semibold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
                {(displayTotal ?? total)!.toLocaleString("en-US")}
              </span>{" "}
              contributions · @{username} ↗
            </>
          ) : (
            <>@{username} ↗</>
          )}
        </a>
      </div>

      {/* Grass */}
      <div className="mt-6 overflow-x-auto pb-1">
        {failed ? (
          // Fallback: static tinted chart image if the API is unreachable.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://ghchart.rshah.org/C6F24E/${username}`}
            alt={`${username} GitHub 기여 그래프`}
            loading="lazy"
            className="min-w-[680px] opacity-90"
          />
        ) : (
          <div
            className="grid grid-flow-col grid-rows-7 gap-[3px]"
            style={{ width: "max-content" }}
          >
            {cells.map((day, i) => {
              const col = Math.floor(i / 7);
              const level = day?.level ?? 0;
              return (
                <div
                  key={i}
                  title={day ? `${day.date} · ${day.count} commits` : undefined}
                  className="h-[11px] w-[11px] rounded-[2px] md:h-[13px] md:w-[13px]"
                  style={{
                    backgroundColor: day ? LEVEL_BG[level] : "transparent",
                    opacity: inView && days ? 1 : 0,
                    transform: inView && days ? "scale(1)" : "scale(0.4)",
                    transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)",
                    transitionDelay: `${col * 14}ms`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-white/40">
        <span>Less</span>
        {LEVEL_BG.map((bg, i) => (
          <span
            key={i}
            className="h-[11px] w-[11px] rounded-[2px]"
            style={{ backgroundColor: bg }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
