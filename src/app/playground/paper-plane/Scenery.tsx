import styles from "./effects.module.css";

const CLOUDS = [
  { leftPct: 30, delay: 0 },
  { leftPct: 62, delay: 1.1 },
  { leftPct: 44, delay: 2.0 },
  { leftPct: 72, delay: 2.8 },
  { leftPct: 22, delay: 3.4 },
];
const VANISH_TOP = "32%";

export function Scenery({ speed }: { speed: number }) {
  // speed 클수록 짧은 주기(빠르게 다가옴). 4.2s(정지)~1.6s(최대).
  const dur = 4.2 - Math.max(0, Math.min(1, speed)) * 2.6;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 하늘 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-sky-50" />
      {/* 지면 */}
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-emerald-100 to-emerald-200"
        style={{ top: VANISH_TOP }}
      />
      {/* 소실점으로 수렴하는 원근선 */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <line x1="50" y1="32" x2="-10" y2="100" stroke="#ffffff" strokeWidth="0.4" opacity="0.5" />
        <line x1="50" y1="32" x2="30" y2="100" stroke="#ffffff" strokeWidth="0.4" opacity="0.5" />
        <line x1="50" y1="32" x2="70" y2="100" stroke="#ffffff" strokeWidth="0.4" opacity="0.5" />
        <line x1="50" y1="32" x2="110" y2="100" stroke="#ffffff" strokeWidth="0.4" opacity="0.5" />
      </svg>
      {/* 다가오는 구름 (소실점 근처에서 생성 → 커지며 카메라로) */}
      {CLOUDS.map((c, i) => (
        <div
          key={`cloud-${i}`}
          className={`absolute ${styles.approach}`}
          style={{
            left: `${c.leftPct}%`,
            top: VANISH_TOP,
            animationDuration: `${dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <svg width="70" height="34" viewBox="0 0 70 34">
            <ellipse cx="26" cy="22" rx="22" ry="11" fill="#ffffff" opacity="0.92" />
            <ellipse cx="44" cy="18" rx="17" ry="11" fill="#ffffff" opacity="0.92" />
          </svg>
        </div>
      ))}
    </div>
  );
}
