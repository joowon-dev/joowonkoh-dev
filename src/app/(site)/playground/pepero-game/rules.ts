/**
 * 빼빼로 게임의 규칙 — 화면과 따로, 두 사람이 「언제 누르고 언제 뗐나」만으로 판정한다.
 * 두 사람은 따로따로(링크로 차례를 주고받으며) 정하고, 결과는 둘을 같은 「냠!」에 겹쳐서 낸다.
 *
 * - 버튼을 꾹 누르고 있는 동안 막대를 먹는다. 손을 떼면 그 자리에서 멈추고, 그 판에서는 다시 못 먹는다.
 * - 먹는 속도는 시간이 갈수록 빨라진다(누른 순간이 아니라 「시작!」부터 잰 시간 기준이라 둘에게 같다).
 * - 두 입이 만나는 순간: 한쪽만 먹고 있었으면 그 사람이 상대 입술을 깨물고 진다.
 *   둘 다 먹고 있었으면 이마를 「쿵」 — 둘 다 진다.
 * - 둘 다 멈추면 더 많이 먹은 사람이 이긴다. 남은 길이가 짧을수록 둘의 호흡 등급이 높다.
 *
 * 같은 입력(누른 시각·뗀 시각)이면 어디서 다시 틀어도 똑같은 결과가 나온다 — 서버가 필요 없다.
 */

export const STICK_MM = 150;
/** 「3·2·1」 시간(초) */
export const COUNTDOWN = 3;
/** 시작하고 이 시간(초) 안에 한 번도 안 누르면 그 판은 0cm 로 끝 */
export const PRESS_WINDOW = 4;
export const NAME_MAX = 8;

export type SideKey = "left" | "right";
export const other = (s: SideKey): SideKey => (s === "left" ? "right" : "left");

/** 한 사람의 입력. 시각은 모두 「시작!」부터 잰 초. */
export interface Input {
  press: number | null;
  release: number | null;
  /** 이 시각까지의 입력은 다 안다(그 뒤로 누르거나 뗐을 수 있다) */
  until: number;
}

export const freshInput = (): Input => ({ press: null, release: null, until: 0 });

/** 시작부터 t 초 동안 쉬지 않고 먹었을 때 먹은 길이(mm). 속도 = 12 + 4t mm/s. */
export const dist = (t: number) => (t <= 0 ? 0 : 12 * t + 2 * t * t);

/** t 초에 이 사람이 먹은 길이(mm). 아직 안 뗐으면 지금도 먹고 있다고 본다. */
export function eatenAt(i: Input, t: number): number {
  if (i.press === null || t <= i.press) return 0;
  const end = i.release === null ? t : Math.min(t, i.release);
  return Math.max(0, dist(end) - dist(i.press));
}

/** t 초에 먹고(움직이고) 있나 */
export function movingAt(i: Input, t: number): boolean {
  return i.press !== null && i.press < t && (i.release === null || i.release >= t);
}

/** 이 사람은 이번 판 입력이 끝났나(뗐거나, 끝까지 안 눌렀거나) */
export function isDone(i: Input): boolean {
  return i.release !== null || (i.press === null && i.until >= PRESS_WINDOW);
}

/** t 초까지 두 입이 만났으면 만난 시각, 아니면 null */
export function meetAt(l: Input, r: Input, t: number): number | null {
  if (eatenAt(l, t) + eatenAt(r, t) < STICK_MM) return null;
  let lo = 0;
  let hi = t;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (eatenAt(l, mid) + eatenAt(r, mid) >= STICK_MM) hi = mid;
    else lo = mid;
  }
  return hi;
}

export interface Tier {
  max: number;
  title: string;
  line: string;
}

/** 남은 길이(mm) → 둘의 호흡 등급 */
export const TIERS: Tier[] = [
  { max: 5, title: "전설의 빼빼로", line: "이 정도면 텔레파시. 둘이 무슨 사이예요?" },
  { max: 15, title: "찰떡 호흡", line: "한 입만 더 갔으면… 조마조마했다!" },
  { max: 30, title: "조마조마", line: "꽤 가까웠어요. 다음 판엔 조금만 더 용기를." },
  { max: 60, title: "아직은 수줍", line: "서로 눈치만 봤네요. 막대가 아까워요." },
  { max: Infinity, title: "겁쟁이 대잔치", line: "막대과자가 거의 그대로… 둘 다 겁쟁이!" },
];
export const tierOf = (restMm: number) => TIERS.find((t) => restMm <= t.max) ?? TIERS[TIERS.length - 1];

export type Outcome =
  | { kind: "ok"; left: number; right: number; rest: number; winner: SideKey | "tie"; tier: Tier }
  | { kind: "bite"; at: number; left: number; right: number; biter: SideKey }
  | { kind: "bonk"; at: number; left: number; right: number };

/** 이긴 사람(없으면 null) */
export function winnerOf(o: Outcome): SideKey | null {
  if (o.kind === "bite") return other(o.biter);
  if (o.kind === "ok" && o.winner !== "tie") return o.winner;
  return null;
}

export interface View {
  /** 화면에 보여 줄 시각 — 아직 확인 안 된 만남이면 그 순간에 멈춰 있다 */
  t: number;
  left: number;
  right: number;
  outcome: Outcome | null;
  /** 만난 것 같지만 상대 입력이 아직 안 와서 확인 중 */
  pending: boolean;
}

/** 지금(now) 화면에 그릴 모습과, 판정이 끝났으면 결과 */
export function viewAt(l: Input, r: Input, now: number): View {
  const horizon = Math.max(now, l.release ?? 0, r.release ?? 0);
  const tc = meetAt(l, r, horizon);
  if (tc !== null) {
    const left = eatenAt(l, tc);
    const right = STICK_MM - left; // 만난 자리 — 반올림 오차 없이 막대 길이에 맞춘다
    if (Math.min(l.until, r.until) < tc) return { t: tc, left, right, outcome: null, pending: true };
    const ml = movingAt(l, tc);
    const mr = movingAt(r, tc);
    const outcome: Outcome =
      ml && mr
        ? { kind: "bonk", at: left, left, right }
        : { kind: "bite", at: left, left, right, biter: ml ? "left" : "right" };
    return { t: tc, left, right, outcome, pending: false };
  }

  const left = eatenAt(l, now);
  const right = eatenAt(r, now);
  if (isDone(l) && isDone(r)) {
    const fl = eatenAt(l, horizon);
    const fr = eatenAt(r, horizon);
    const rest = STICK_MM - fl - fr;
    const winner: SideKey | "tie" = Math.abs(fl - fr) < 0.5 ? "tie" : fl > fr ? "left" : "right";
    return {
      t: now,
      left: fl,
      right: fr,
      outcome: { kind: "ok", left: fl, right: fr, rest, winner, tier: tierOf(rest) },
      pending: false,
    };
  }
  return { t: now, left, right, outcome: null, pending: false };
}

/** press 초에 누르기 시작해 mm 만큼 먹으려면 언제 떼야 하나 */
export function timeToEat(press: number, mm: number) {
  let lo = press;
  let hi = press + 30;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (dist(mid) - dist(press) >= mm) hi = mid;
    else lo = mid;
  }
  return hi;
}

/** 혼자 하는 차례에서 이만큼 먹으면 상대 입술 바로 앞이라 저절로 멈춘다(mm) */
export const AUTO_STOP = STICK_MM - 2;

/* ───────────── 차례(한 사람이 정한 것) 와 링크 ───────────── */

/** 한 사람의 차례 — 이름과 「냠!」부터 잰 누른·뗀 시각(초). 안 눌렀으면 둘 다 null. */
export interface Turn {
  name: string;
  press: number | null;
  release: number | null;
}

export const toInput = (t: Turn): Input => ({
  press: t.press,
  release: t.press === null ? null : (t.release ?? t.press),
  until: Infinity,
});

export const eatenOf = (t: Turn) => (t.press === null ? 0 : eatenAt(toInput(t), Infinity));

/** 링크 속 내용은 받는 사람이 주소만 보고 상대 기록을 알아채지 못하게 살짝 뒤섞는다(보안용 아님). */
const KEY = [0x50, 0x65, 0x70, 0x65, 0x72, 0x6f, 0x21, 0x37, 0x11];

function pack(obj: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = "";
  bytes.forEach((b, i) => {
    bin += String.fromCharCode(b ^ KEY[i % KEY.length] ^ (i * 31) % 256);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unpack(code: string): unknown {
  try {
    const bin = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, (c, i) => c.charCodeAt(0) ^ KEY[i % KEY.length] ^ (i * 31) % 256);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

type TurnRow = [string, number, number];
const row = (t: Turn): TurnRow => [
  t.name,
  t.press === null ? -1 : Math.round(t.press * 1000),
  t.press === null ? -1 : Math.round((t.release ?? t.press) * 1000),
];

function fromRow(x: unknown, fallback: string): Turn | null {
  if (!Array.isArray(x) || x.length !== 3) return null;
  const [n, p, r] = x;
  if (typeof n !== "string" || typeof p !== "number" || typeof r !== "number") return null;
  const name = cleanName(n, fallback);
  if (p === -1) return { name, press: null, release: null };
  if (!Number.isFinite(p) || !Number.isFinite(r) || p < 0 || p > PRESS_WINDOW * 1000 || r < p || r > 30000) return null;
  return { name, press: p / 1000, release: r / 1000 };
}

/** 도전장 링크 속 코드 */
export const encodeChallenge = (t: Turn) => pack({ v: 1, a: row(t) });
export function decodeChallenge(code: string): Turn | null {
  const o = unpack(code) as { v?: number; a?: unknown } | null;
  return o && o.v === 1 ? fromRow(o.a, "도전자") : null;
}

/** 결과(둘 다 정한 것) 링크 속 코드 */
export const encodeResult = (l: Turn, r: Turn) => pack({ v: 1, a: row(l), b: row(r) });
export function decodeResult(code: string): { left: Turn; right: Turn } | null {
  const o = unpack(code) as { v?: number; a?: unknown; b?: unknown } | null;
  if (!o || o.v !== 1) return null;
  const left = fromRow(o.a, "도전자");
  const right = fromRow(o.b, "친구");
  return left && right ? { left, right } : null;
}

/** 두 차례로 낸 최종 결과 */
export const judge = (l: Turn, r: Turn): Outcome => viewAt(toInput(l), toInput(r), 60).outcome!;

/** mm → "3.4" (cm, 소수 한 자리) */
export const cm = (mm: number) => (Math.max(0, mm) / 10).toFixed(1);

export function cleanName(raw: string, fallback: string) {
  const s = [...raw.replace(/\s+/g, " ").trim()].slice(0, NAME_MAX).join("");
  return s || fallback;
}
