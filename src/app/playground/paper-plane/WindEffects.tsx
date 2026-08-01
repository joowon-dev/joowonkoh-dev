"use client";

import styles from "./effects.module.css";

const STREAKS = [12, 26, 40, 54, 68, 82, 20, 60, 34, 76];
const PARTICLES = [42, 50, 58, 46, 54];

export function WindEffects({ wind, active }: { wind: number; active: boolean }) {
  if (!active) return null;
  const w = Math.max(0, Math.min(1, wind));
  const streakDur = 0.9 - w * 0.5; // 셀수록 빠르게
  const streakCount = Math.round(2 + w * (STREAKS.length - 2));
  const breathDur = 1.4 - w * 0.6;
  const breathCount = w > 0.05 ? Math.round(1 + w * (PARTICLES.length - 1)) : 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* 속도선 */}
      {STREAKS.slice(0, streakCount).map((leftPct, i) => (
        <span
          key={`s-${i}`}
          className={`absolute ${styles.streak}`}
          style={{
            left: `${leftPct}%`,
            bottom: "-8%",
            width: "2px",
            height: "18%",
            background:
              "linear-gradient(to top, rgba(255,255,255,0), rgba(255,255,255,0.85))",
            borderRadius: "2px",
            animationDuration: `${streakDur}s`,
            animationDelay: `${(i % 5) * 0.12}s`,
            opacity: 0.3 + w * 0.6,
          }}
        />
      ))}
      {/* 입김 파티클 (하단 중앙 = 내 입 쪽) */}
      {PARTICLES.slice(0, breathCount).map((leftPct, i) => (
        <span
          key={`b-${i}`}
          className={`absolute ${styles.breath}`}
          style={{
            left: `${leftPct}%`,
            bottom: "2%",
            width: "22px",
            height: "22px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.85), rgba(255,255,255,0))",
            borderRadius: "9999px",
            animationDuration: `${breathDur}s`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      {/* 마이크 세기 게이지 (하단) */}
      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-1">
        <div className="h-2 w-40 overflow-hidden rounded-full bg-white/40">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-75"
            style={{ width: `${Math.round(w * 100)}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold text-white drop-shadow">
          {w > 0.05 ? "🌬️ 부는 중!" : "마이크에 훅~ 불어보세요"}
        </span>
      </div>
    </div>
  );
}
