/**
 * 빼빼로 게임 규칙과 링크 암호.
 *
 * 막대는 왼쪽 끝 0mm 부터 오른쪽 끝 STICK_MM 까지다.
 * - 먼저 하는 사람(왼쪽)은 왼쪽 끝부터 `a` mm 까지 먹는다.
 * - 받은 사람(오른쪽)은 오른쪽 끝부터 먹어서 `b` mm 자리(왼쪽에서 잰 자리)에서 멈춘다.
 * 남는 길이는 `b - a`. 0 이하면 입이 먼저 닿는다 — 누군가 입술을 깨문다.
 *
 * 서버도 DB 도 쓰지 않는다. 먼저 한 사람의 자리는 링크의 # 뒤에 섞어서 넣는다
 * (# 뒤는 서버로 가지 않는다). 숫자가 바로 보이지 않게 섞을 뿐, 암호는 아니다 —
 * 마음먹고 코드를 뜯어보면 풀 수 있다. 친구끼리 하는 장난이라 그 정도로 둔다.
 */

/** 막대 길이(mm). 실제 막대과자와 비슷하게. */
export const STICK_MM = 150;
/** 고를 수 있는 가장 앞·뒤 자리 — 끝을 아예 안 먹거나 통째로 먹는 건 막는다. */
export const MIN_MM = 1;
export const MAX_MM = STICK_MM - 1;
/** 둘이 먹는 빠르기(mm/초). 둘 다 같은 빠르기로 다가온다. */
export const SPEED = 42;

export const NAME_MAX = 8;

export const clampMm = (mm: number) => Math.min(MAX_MM, Math.max(MIN_MM, Math.round(mm)));

export const cm = (mm: number) => (mm / 10).toFixed(1);

export interface Challenge {
  /** 먼저 한 사람이 왼쪽 끝부터 먹은 mm */
  a: number;
  /** 먼저 한 사람 이름 */
  n: string;
}

export interface Answer extends Challenge {
  /** 받은 사람이 멈춘 자리(왼쪽에서 잰 mm) */
  b: number;
  /** 받은 사람 이름 */
  m: string;
}

/** 깨문 사람. left = 먼저 한 사람. 「둘이 동시에」는 없다 — 늘 한 사람이 깨문다. */
export type Biter = "right" | "left";

export type Outcome =
  | { kind: "ok"; leftMm: number; tier: Tier }
  | { kind: "bite"; biter: Biter; at: number; time: number };

export interface Tier {
  title: string;
  line: string;
}

/** 남은 길이별 칭호. 위에서부터 처음 맞는 것. */
const TIERS: [maxMm: number, tier: Tier][] = [
  [5, { title: "전설의 빼빼로", line: "숨도 못 쉬었겠다… 이건 기네스에 올려야 해" }],
  [15, { title: "찰떡 호흡", line: "말 안 해도 통하는 사이. 눈빛만 봐도 알지?" }],
  [30, { title: "조마조마", line: "조금만 더 용기 냈으면 전설이었는데!" }],
  [60, { title: "아직은 수줍", line: "서로 눈치만 보다가 끝났어요" }],
  [Infinity, { title: "낯가림 대폭발", line: "빼빼로가 아니라 거의 통째로 남았잖아…" }],
];

export const tierOf = (leftMm: number): Tier => TIERS.find(([max]) => leftMm <= max)![1];

/**
 * 둘이 같은 빠르기로 동시에 먹기 시작했을 때 언제 어디서 입이 닿는지.
 * b > a 면 닿지 않는다(null). 닿으면 그 순간 움직이고 있던 쪽이 깨문 사람이다.
 */
export function collision(a: number, b: number, speed = SPEED): { at: number; time: number; biter: Biter } | null {
  if (b > a) return null;
  const mid = STICK_MM / 2;
  // 둘 다 가운데를 넘어 먹으려 했다 — 가운데서 만나고, 더 욕심낸 쪽이 깨문다.
  // 똑같이 욕심냈으면 상대 자리를 넘어 들어온 나중 사람(오른쪽)이 깨문다.
  if (a >= mid && b <= mid) {
    return { at: mid, time: mid / speed, biter: a - mid > mid - b ? "left" : "right" };
  }
  // 왼쪽이 가운데 전에 멈췄다 — 오른쪽이 계속 와서 왼쪽 입술을 깨문다.
  if (a < mid) return { at: a, time: (STICK_MM - a) / speed, biter: "right" };
  // 오른쪽이 가운데 전에 멈췄다 — 왼쪽이 계속 가서 오른쪽 입술을 깨문다.
  return { at: b, time: b / speed, biter: "left" };
}

export function judge(a: number, b: number): Outcome {
  const hit = collision(a, b);
  if (hit) return { kind: "bite", ...hit };
  const leftMm = b - a;
  return { kind: "ok", leftMm, tier: tierOf(leftMm) };
}

/** t초가 지났을 때 두 입의 자리(왼쪽에서 잰 mm). 닿으면 거기서 멈춘다. */
export function mouthsAt(t: number, a: number, b: number, speed = SPEED): { left: number; right: number } {
  const hit = collision(a, b, speed);
  const tt = hit ? Math.min(t, hit.time) : t;
  return {
    left: Math.min(a, speed * tt),
    right: Math.max(b, STICK_MM - speed * tt),
  };
}

/** 둘 다 멈추거나 입이 닿기까지 걸리는 시간(초). */
export function duration(a: number, b: number, speed = SPEED): number {
  const hit = collision(a, b, speed);
  if (hit) return hit.time;
  return Math.max(a, STICK_MM - b) / speed;
}

/* ───────────── 링크 암호 ───────────── */

const KEY = [0x5a, 0x17, 0xc3, 0x8e, 0x21, 0x6b, 0xf4, 0x39, 0xa2, 0x4d, 0x90, 0x1f];

/** 소금(salt) 한 바이트로 섞는다 — 같은 자리를 골라도 링크가 매번 달라 보이게. */
function scramble(bytes: Uint8Array, salt: number): Uint8Array {
  return bytes.map((x, i) => x ^ KEY[(i + salt) % KEY.length] ^ ((i * 37 + salt * 101) & 0xff));
}

function toBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export const cleanName = (name: string, fallback: string) =>
  [...name.replace(/[\u0000-\u001f|]/g, "").trim()].slice(0, NAME_MAX).join("") || fallback;

const checksum = (bytes: Uint8Array) => bytes.reduce((sum, x, i) => (sum * 31 + x + i) & 0xff, 7);

/** 도전장(a, n) 또는 결과(a, n, b, m)를 링크에 넣을 글자로. */
export function encode(game: Challenge | Answer): string {
  const parts = [3, game.a, game.n];
  if ("b" in game) parts.push(game.b, game.m);
  const salt = Math.floor(Math.random() * 256);
  const text = new TextEncoder().encode(parts.join("|"));
  // 끝 한 바이트는 검산용 — 링크 끝이 잘리거나 손대면 알아챈다.
  const body = scramble(Uint8Array.of(...text, checksum(text)), salt);
  return toBase64Url(Uint8Array.of(salt, ...body));
}

/** 망가졌거나 손댄 링크면 null. */
export function decode(code: string): Challenge | Answer | null {
  try {
    const raw = fromBase64Url(code);
    if (raw.length < 3) return null;
    const plain = scramble(raw.subarray(1), raw[0]);
    const bytes = plain.subarray(0, -1);
    if (checksum(bytes) !== plain[plain.length - 1]) return null;
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const [v, a, n, b, m, ...rest] = text.split("|");
    if (v !== "3" || rest.length) return null;
    const okMm = (s: string | undefined) => s !== undefined && /^\d{1,3}$/.test(s) && clampMm(+s) === +s;
    if (!okMm(a) || !n) return null;
    const challenge: Challenge = { a: +a, n: cleanName(n, "도전자") };
    if (b === undefined) return challenge;
    if (!okMm(b) || !m) return null;
    return { ...challenge, b: +b, m: cleanName(m, "상대") };
  } catch {
    return null;
  }
}

/** 링크의 # 부분. 도전장은 #c=, 결과는 #r=. */
export function hashOf(game: Challenge | Answer): string {
  return `#${"b" in game ? "r" : "c"}=${encode(game)}`;
}

export type Route =
  | { kind: "make" }
  | { kind: "answer"; game: Challenge }
  | { kind: "replay"; game: Answer }
  | { kind: "broken" };

export function routeOf(hash: string): Route {
  const m = /^#([cr])=([A-Za-z0-9_-]+)$/.exec(hash);
  if (!m) return hash.length > 1 ? { kind: "broken" } : { kind: "make" };
  const game = decode(m[2]);
  if (!game) return { kind: "broken" };
  if (m[1] === "c" && !("b" in game)) return { kind: "answer", game };
  if (m[1] === "r" && "b" in game) return { kind: "replay", game };
  return { kind: "broken" };
}
