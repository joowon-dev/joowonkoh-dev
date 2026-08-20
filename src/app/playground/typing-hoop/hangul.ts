/**
 * 한글 자모 단위 유틸.
 *
 * 이 게임의 파워는 "얼마나 빨리 쳤는가"인데, 그 기준을 음절 수로 잡으면
 * 단어마다 불공평해진다 — "아이유"(6타)와 "닭갈비"(9타)를 같은 3음절로 세면
 * 앞 단어가 그냥 유리하다. 그래서 실제 두벌식 타수로 센다.
 *
 * 또 하나. 한글 IME는 조합 중간 상태를 그대로 input 값으로 흘린다.
 * "사과"를 치는 도중 값이 "ㅅ" → "사" → "사ㄱ" → "사고" → "사과"로 바뀐다.
 * 문자열 startsWith로 오타를 판정하면 이 중간 상태가 전부 오타로 잡힌다.
 * 자모로 풀어서 비교해야 조합 중간이 정상 입력으로 읽힌다.
 */

const BASE = 0xac00;
const LAST = 0xd7a3;
const JUNG_COUNT = 21;
const JONG_COUNT = 28;

/** 초성 19개. 두벌식에서 전부 한 타(쌍자음은 시프트라 여전히 한 타)다. */
const CHO = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

/** 중성 21개. ㅘ·ㅙ·ㅚ·ㅝ·ㅞ·ㅟ·ㅢ는 두 키를 눌러야 나온다. */
const JUNG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ",
  "ㅣ",
] as const;

/** 종성 28개. 0번은 받침 없음이라 빈 문자열이다. */
const JONG = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

/**
 * 두 키를 눌러야 나오는 자모 → 몇 타인지.
 *
 * 쌍자음(ㄲㄸㅃㅆㅉ)은 시프트를 같이 누르는 한 타라 여기 없다.
 * 겹받침과 이중모음만 두 타다.
 */
const TWO_STROKE = new Set<string>([
  "ㅘ", "ㅙ", "ㅚ", "ㅝ", "ㅞ", "ㅟ", "ㅢ",
  "ㄳ", "ㄵ", "ㄶ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅄ",
]);

/**
 * 조합 중간 상태에서 먼저 나타나는 조각.
 *
 * "과"를 치는 도중에는 "고"가 먼저 보인다(ㅘ의 첫 조각이 ㅗ이므로).
 * "밖"을 치는 도중에는 "박"이 먼저 보인다(ㄲ의 첫 조각이 ㄱ이므로).
 * 이 표가 없으면 그 중간 상태가 전부 오타로 잡힌다.
 */
const FIRST_PART: Record<string, string> = {
  ㅘ: "ㅗ", ㅙ: "ㅗ", ㅚ: "ㅗ", ㅝ: "ㅜ", ㅞ: "ㅜ", ㅟ: "ㅜ", ㅢ: "ㅡ",
  ㄳ: "ㄱ", ㄵ: "ㄴ", ㄶ: "ㄴ", ㄺ: "ㄹ", ㄻ: "ㄹ", ㄼ: "ㄹ",
  ㄽ: "ㄹ", ㄾ: "ㄹ", ㄿ: "ㄹ", ㅀ: "ㄹ", ㅄ: "ㅂ",
  ㄲ: "ㄱ", ㅆ: "ㅅ",
};

/** 완성형 음절인가 (가~힣) */
export function isSyllable(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return code >= BASE && code <= LAST;
}

/** 문자열 전체가 완성형 음절로만 되어 있는가. 단어 목록 검증에 쓴다. */
export function isHangulWord(s: string): boolean {
  return s.length > 0 && [...s].every(isSyllable);
}

/**
 * 음절 하나를 초·중·종성으로 쪼갠다. 완성형이 아니면 그 글자를 그대로 하나로 돌려준다
 * (조합 중간의 낱자 "ㅅ", "ㅏ"가 여기로 들어온다).
 */
export function decompose(ch: string): string[] {
  const code = ch.codePointAt(0) ?? 0;
  if (code < BASE || code > LAST) return [ch];
  const index = code - BASE;
  const jong = index % JONG_COUNT;
  const jung = Math.floor(index / JONG_COUNT) % JUNG_COUNT;
  const cho = Math.floor(index / (JONG_COUNT * JUNG_COUNT));
  const parts: string[] = [CHO[cho], JUNG[jung]];
  if (jong > 0) parts.push(JONG[jong]);
  return parts;
}

/** 문자열을 자모 배열로. 겹자모는 쪼개지 않고 한 덩어리로 둔다. */
export function toJamo(s: string): string[] {
  return [...s].flatMap(decompose);
}

/**
 * 두벌식으로 이 단어를 치는 데 필요한 타수.
 *
 * 파워 계산의 분자다. 단어가 바뀌어도 같은 손 속도면 같은 파워가 나오도록,
 * 음절 수가 아니라 이 값을 쓴다.
 */
export function keystrokesOf(word: string): number {
  return toJamo(word).reduce((sum, j) => sum + (TWO_STROKE.has(j) ? 2 : 1), 0);
}

/**
 * 지금까지 친 값이 목표 단어로 가는 길 위에 있는가.
 *
 * 마지막 자모만 "아직 덜 조합된 상태"를 허용한다. 그 앞은 정확히 같아야 한다.
 * 값이 목표보다 길면 무조건 틀린 것이다.
 */
export function isOnTrack(typed: string, word: string): boolean {
  if (typed === "") return true;
  const a = toJamo(typed);
  const b = toJamo(word);
  if (a.length > b.length) return false;
  for (let i = 0; i < a.length - 1; i++) {
    if (a[i] !== b[i]) return false;
  }
  const last = a[a.length - 1];
  const target = b[a.length - 1];
  return last === target || FIRST_PART[target] === last;
}
