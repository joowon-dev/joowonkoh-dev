import { HACHIWARE, MOOD_RULES, SOUNDS, type Character, type Mood } from "./lexicon";

export type { Character, Mood };
export type Sentence = { source: string; mood: Mood; tokens: string[] };

const MAX_TOKENS = 6;
/** 글자 몇 개마다 소리 하나. */
const CHARS_PER_TOKEN = 4;
const END_PUNCT = /[!?…~.]+$/u;

/** 문장 끝의 ㅠㅠ·ㅋㅋ — 이것도 문장을 끊는다. */
const JAMO_RUN = /[ㅠㅜㅋㅎ]{2,}/gu;

/** 문장 끝 기호(ㅠㅠ·ㅋㅋ 포함)까지 붙여서 나눈다. 글자·숫자가 하나도 없는 조각은 버린다(ㅠ 는 글자로 친다). */
export function splitSentences(text: string): string[] {
  const parts = text.replace(JAMO_RUN, "$&\n").match(/[^.!?…~\n]+[.!?…~]*/gu) ?? [];
  return parts.map((p) => p.trim()).filter((p) => /[\p{L}\p{N}]/u.test(p));
}

export function detectMood(sentence: string): Mood {
  for (const [mood, re] of MOOD_RULES) if (re.test(sentence)) return mood;
  return sentence.includes("?") ? "question" : "plain";
}

export function translate(text: string, who: Character): Sentence[] {
  return splitSentences(text).map((source) => {
    const mood = detectMood(source);
    const rand = rng(hash(`${who}:${source}`));
    const tokens = who === "hachiware" ? hachiware(source, mood, rand) : sounds(source, mood, who, rand);
    return { source, mood, tokens };
  });
}

export function toText(sentences: Sentence[]): string {
  return sentences.map((s) => s.tokens.join(" ")).join(" ");
}

function sounds(source: string, mood: Mood, who: "chiikawa" | "usagi", rand: () => number): string[] {
  const letters = source.replace(/[^\p{L}\p{N}]/gu, "").length;
  const count = Math.min(MAX_TOKENS, Math.max(1, Math.ceil(letters / CHARS_PER_TOKEN)));
  const pool = SOUNDS[who][mood];
  const tokens = Array.from({ length: count }, () => pick(pool, rand));
  return withEnding(tokens, source);
}

/** 원문 끝이 ! ? … ~ 면 마지막 토막 끝을 그것으로 갈아 끼운다. 마침표는 무시. */
function withEnding(tokens: string[], source: string): string[] {
  const end = source.match(END_PUNCT)?.[0].replace(/\./g, "");
  if (!end) return tokens;
  const last = tokens.length - 1;
  return tokens.map((t, i) => (i === last ? t.replace(END_PUNCT, "") + end : t));
}

/** 존댓말 어미 → 하치와레 반말. 위에서부터 하나만 바꾼다. */
const ENDINGS: [RegExp, string][] = [
  [/합니다$/u, "해"],
  [/입니다$/u, "이야"],
  [/이에요$/u, "이야"],
  [/예요$/u, "야"],
  [/에요$/u, "야"],
  [/세요$/u, "셔"],
  [/요$/u, ""],
];

function hachiware(source: string, mood: Mood, rand: () => number): string[] {
  // 끝의 기호와 ㅠㅠ 를 떼어 두고 어미를 바꾼 뒤 다시 붙인다.
  const end = source.match(/[\sㅠㅜㅋㅎ!?…~.]*$/u)?.[0] ?? "";
  const jamo = end.replace(/[^ㅠㅜㅋㅎ]/gu, "");
  let body = source.slice(0, source.length - end.length).trim();
  for (const [re, to] of ENDINGS) {
    if (re.test(body)) {
      body = body.replace(re, to);
      break;
    }
  }
  const punct = end.replace(/[^!?…~]/gu, "") || (jamo ? "" : "~");
  const said = [body + punct, jamo].filter(Boolean).join(" ");
  const { before, after } = HACHIWARE[mood];
  const tokens: string[] = [];
  if (rand() < 0.5) tokens.push(pick(before, rand));
  tokens.push(said);
  tokens.push(pick(after, rand));
  return tokens;
}

export function pick<T>(pool: T[], rand: () => number): T {
  return pool[Math.floor(rand() * pool.length)];
}

/** FNV-1a 32bit. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32. */
export function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
