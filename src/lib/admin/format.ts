/** 어드민 숫자·이름 표기. 화면 어디서든 같은 모양으로 보이게 한 곳에 둔다. */

const int = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 });

export const formatInt = (v: number) => int.format(v);

/** 10만 넘으면 "12.3만" — 그 아래는 자릿수를 다 보여 준다 */
export const formatCompact = (v: number) => (Math.abs(v) >= 100_000 ? compact.format(v) : int.format(v));

/** $1 미만은 센트까지 세 자리 — 앱 수익이 작은 날이 많다 */
export function formatUsd(v: number): string {
  const digits = Math.abs(v) < 1 && v !== 0 ? 3 : 2;
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export const formatPercent = (v: number) => `${(v * 100).toFixed(1)}%`;

/** 초 → "1분 23초" */
export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  if (s < 60) return `${s}초`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest ? `${m}분 ${rest}초` : `${m}분`;
}

/** 2026-09-30 → "9월 30일 (수)" */
export function formatDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const weekday = "일월화수목금토"[d.getUTCDay()];
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${weekday})`;
}

/** 2026-09-30 → "9.30" (축 눈금용) */
export function formatShortDay(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}.${Number(d)}`;
}

let regionNames: Intl.DisplayNames | null = null;

/** ISO 국가 코드 → 한국어 이름. 모르는 코드는 그대로. */
export function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return code === "(not set)" ? "알 수 없음" : code;
  try {
    regionNames ??= new Intl.DisplayNames(["ko"], { type: "region" });
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

const CHANNELS: Record<string, string> = {
  Direct: "직접 방문",
  "Organic Search": "검색",
  "Organic Social": "SNS",
  Referral: "다른 사이트",
  "Paid Search": "검색 광고",
  "Paid Social": "SNS 광고",
  Email: "이메일",
  Display: "디스플레이 광고",
  "Organic Video": "동영상",
  Unassigned: "분류 안 됨",
};

export const channelName = (value: string) => CHANNELS[value] ?? value;

const DEVICES: Record<string, string> = { mobile: "모바일", desktop: "PC", tablet: "태블릿", "smart tv": "TV" };
export const deviceName = (value: string) => DEVICES[value] ?? value;

const FORMATS: Record<string, string> = {
  BANNER: "배너",
  INTERSTITIAL: "전면",
  REWARDED: "보상형",
  REWARDED_INTERSTITIAL: "보상형 전면",
  NATIVE: "네이티브",
  APP_OPEN: "앱 오프닝",
};
export const adFormatName = (value: string) => FORMATS[value] ?? value;
