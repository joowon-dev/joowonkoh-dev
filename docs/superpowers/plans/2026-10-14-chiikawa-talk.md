# 먼작귀 통역기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 한글 문장을 치이카와·하치와레·우사기 말로 바꿔 귀여운 말풍선에 보여 주는 `/playground/chiikawa-talk` 페이지.

**Architecture:** 통역은 `translate.ts` 의 순수 함수(문장 나누기 → 감정 읽기 → 시드 RNG 로 사전에서 고르기). 사전은 `lexicon.ts` 에 데이터로만. 화면은 client 컴포넌트 하나(`Translator.tsx`)가 엔진을 부르고, 친구 그림은 `desktop-chiikawa/sprites.ts` 의 `loadSprites()` 를 재사용한다.

**Tech Stack:** Next 16 app router, React, Tailwind v4 + 페이지 전용 CSS(`ct-` 접두사), vitest.

**Spec:** `docs/superpowers/specs/2026-10-14-chiikawa-talk-design.md`

## Global Constraints

- 글자만 — 음성 없음. 결과는 문장별 `tokens: string[]`.
- 같은 입력·같은 캐릭터 → 같은 결과(시드 = 문장 원문 해시).
- 캐릭터: `chiikawa | hachiware | usagi`. 치이카와·우사기는 소리로, 하치와레는 뜻 유지 + 말투만.
- 그림은 저장소에 넣지 않는다 — `loadSprites()` (비공개 버킷, `CHII-SITE`). 못 받으면 이름표.
- 공식 사이트 이미지·모양을 베끼지 않는다. 하단에 팬 메이드·비공식 문구.
- 정적 페이지다 — 서버 코드 없음. 다른 playground 페이지처럼 `runtime` 선언 없이 둔다
  (edge 필수는 동적 라우트 규칙). `npx @cloudflare/next-on-pages` 로 확인.
- desktop-chiikawa 와 같이 목록에서 감추고(`hidden: true`) noindex, 사이트맵 제외.
- repo eslint: effect 안에서 동기 setState 금지, 렌더 중 ref 읽기 금지.

## Review Focus

1. 이모지·영어·숫자만 있는 입력 → 빈 결과가 아니라 plain 소리라도 나와야 한다(글자가 하나라도 있으면). → Task 1 테스트 `non-hangul`.
2. 아주 긴 입력(500자+) → 문장마다 토막 최대 6개, 화면이 끝없이 늘지 않는다. → Task 1 테스트 `caps tokens`.
3. `ㅠㅠ` 만 있는 문장 → sad 로 읽혀야 한다(기호 문장도 버리지 않는다). → Task 1 테스트 `only ㅠㅠ`.
4. 하치와레 존댓말 어미(`~예요`, `~합니다`) → 어색한 반쪽 어미가 남지 않는다. → Task 1 테스트 `hachiware endings`.
5. 통역 중 탭을 바꾸면 타자 효과가 처음부터 다시 — 이전 토막이 섞이지 않는다. → Task 2 에서 말풍선에 `key` 로 다시 마운트.

---

### Task 1: 통역 엔진 + 사전

**Files:**
- Create: `src/app/playground/chiikawa-talk/lexicon.ts`
- Create: `src/app/playground/chiikawa-talk/translate.ts`
- Test: `src/app/playground/chiikawa-talk/translate.test.ts`

**Interfaces:**
- Produces:
  - `type Character = "chiikawa" | "hachiware" | "usagi"`
  - `type Mood = "joy" | "sad" | "scared" | "hungry" | "surprised" | "angry" | "question" | "plain"`
  - `type Sentence = { source: string; mood: Mood; tokens: string[] }`
  - `translate(text: string, who: Character): Sentence[]`
  - `toText(sentences: Sentence[]): string`
  - `detectMood(sentence: string): Mood`
  - `lexicon.ts`: `MOOD_RULES`, `SOUNDS`, `HACHIWARE`, `CHARACTERS`

- [ ] **Step 1: 실패하는 테스트 작성** — `translate.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { HACHIWARE, SOUNDS } from "./lexicon";
import { detectMood, toText, translate } from "./translate";

describe("detectMood", () => {
  it.each([
    ["오늘 너무 슬퍼ㅠㅠ", "sad"],
    ["ㅠㅠ", "sad"],
    ["무서워 어떡해", "scared"],
    ["배고파요", "hungry"],
    ["완전 신나ㅋㅋ", "joy"],
    ["헉 대박", "surprised"],
    ["진짜 짜증나", "angry"],
    ["어디 갈래?", "question"],
    ["학교에 간다", "plain"],
  ])("%s → %s", (s, mood) => expect(detectMood(s)).toBe(mood));
});

describe("translate", () => {
  it("같은 입력은 같은 결과", () => {
    const a = translate("오늘 너무 배고파요 ㅠㅠ 맛있는 거 먹고 싶다!", "usagi");
    const b = translate("오늘 너무 배고파요 ㅠㅠ 맛있는 거 먹고 싶다!", "usagi");
    expect(a).toEqual(b);
  });

  it("빈 입력·공백·기호만이면 빈 결과", () => {
    expect(translate("", "chiikawa")).toEqual([]);
    expect(translate("   \n ", "usagi")).toEqual([]);
    expect(translate("...!!??", "hachiware")).toEqual([]);
  });

  it("non-hangul — 영어·숫자만 있어도 소리가 나온다", () => {
    expect(translate("hello 123", "chiikawa")[0].tokens.length).toBeGreaterThan(0);
  });

  it("문장을 나눈다", () => {
    expect(translate("안녕! 뭐 해? 졸려…", "chiikawa").map((s) => s.source)).toEqual([
      "안녕!",
      "뭐 해?",
      "졸려…",
    ]);
  });

  it("치이카와·우사기 토막은 각자 사전 안의 소리다(끝 문장부호 빼고)", () => {
    for (const who of ["chiikawa", "usagi"] as const) {
      const all = new Set(Object.values(SOUNDS[who]).flat().map(bare));
      for (const s of translate("배고파! 무서워ㅠ 좋아 ㅋㅋ 왜?", who)) {
        for (const t of s.tokens) expect(all.has(bare(t))).toBe(true);
      }
    }
  });

  it("caps tokens — 긴 문장도 토막은 6개까지", () => {
    const long = "가".repeat(600);
    expect(translate(long, "usagi")[0].tokens.length).toBeLessThanOrEqual(6);
  });

  it("원문 끝의 ! ? 를 살린다", () => {
    expect(toText(translate("뭐야?", "usagi")).endsWith("?")).toBe(true);
    expect(toText(translate("좋아!!", "chiikawa")).endsWith("!!")).toBe(true);
  });

  it("하치와레는 원문 낱말이 남는다", () => {
    const text = toText(translate("오늘 떡볶이 먹으러 가자", "hachiware"));
    expect(text).toContain("떡볶이");
  });

  it("hachiware endings — 존댓말이 반말로 깔끔하게", () => {
    const body = (s: string) => translate(s, "hachiware")[0].tokens.find((t) => t.includes(s.slice(0, 2)))!;
    expect(body("이건 사과예요")).toContain("사과야");
    expect(body("정말 감사합니다")).toContain("감사해");
    expect(body("배고파요")).toContain("배고파");
    expect(body("배고파요")).not.toContain("요");
  });

  it("하치와레 감탄사는 사전 안에 있다", () => {
    const pool = new Set(
      Object.values(HACHIWARE).flatMap((m) => [...m.before, ...m.after]),
    );
    const [s] = translate("완전 신나!", "hachiware");
    const extras = s.tokens.filter((t) => !t.includes("신나"));
    for (const t of extras) expect(pool.has(t)).toBe(true);
  });
});

function bare(t: string) {
  return t.replace(/[!?…~.]+$/u, "");
}
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/app/playground/chiikawa-talk`
Expected: FAIL — `Cannot find module './lexicon'`

- [ ] **Step 3: `lexicon.ts`**

```ts
/**
 * 먼작귀 통역 사전. 데이터만 둔다 — 고르는 규칙은 translate.ts.
 * 소리는 원작 말투를 흉내 낸 한글 표기다(녹음·이미지 없음).
 */
export type Character = "chiikawa" | "hachiware" | "usagi";
export type Mood = "joy" | "sad" | "scared" | "hungry" | "surprised" | "angry" | "question" | "plain";

export const CHARACTERS: { id: Character; name: string; hint: string }[] = [
  { id: "chiikawa", name: "치이카와", hint: "작고 떨리는 소리로" },
  { id: "hachiware", name: "하치와레", hint: "말은 그대로, 말투만 귀엽게" },
  { id: "usagi", name: "우사기", hint: "우라! 야하!" },
];

/** 위에서부터 먼저 걸리는 감정. 키워드가 없으면 ? 로 question, 그 밖은 plain. */
export const MOOD_RULES: [Mood, RegExp][] = [
  ["sad", /ㅠ|ㅜ|슬퍼|슬프|울고|울어|눈물|속상|힘들/u],
  ["scared", /무서|무섭|어떡|어떻게 해|겁나|떨려|살려/u],
  ["angry", /짜증|화나|화가|싫어|열받|빡/u],
  ["hungry", /배고|배가 고|먹|맛있|냠|밥|간식|떡볶이|라면/u],
  ["surprised", /헉|대박|깜짝|진짜\?|정말\?|세상에|헐/u],
  ["joy", /좋아|좋다|신나|최고|행복|ㅋ|ㅎㅎ|사랑|고마|감사|야호/u],
];

/** 치이카와·우사기가 감정마다 내는 소리. */
export const SOUNDS: Record<"chiikawa" | "usagi", Record<Mood, string[]>> = {
  chiikawa: {
    joy: ["와아!", "야다…!", "헤헤…", "후훗…"],
    sad: ["와…", "흐에에…", "아…", "우…"],
    scared: ["히익…!", "으…", "와앗…"],
    hungry: ["냠…", "꼬르륵…", "와아…"],
    surprised: ["앗…!", "와앗!", "엣…"],
    angry: ["으으…!", "뭇…!"],
    question: ["…?", "에…?", "으응…?"],
    plain: ["아…", "응…", "와…", "으…"],
  },
  usagi: {
    joy: ["야하!", "우라!", "푸루루루", "야하하!"],
    sad: ["후웅…", "우라…"],
    scared: ["하아아앗!", "우라앗?!"],
    hungry: ["우라!", "하아—앙", "냠냠!"],
    surprised: ["하아?!", "이야앗!"],
    angry: ["우라아앗!!", "하아?!", "이야하!!"],
    question: ["하아?", "후웅?"],
    plain: ["우라", "야하", "후웅", "푸루루"],
  },
};

/** 하치와레 — 원문 앞뒤에 붙이는 말. 앞말은 반쯤, 뒷말은 늘 붙인다. */
export const HACHIWARE: Record<Mood, { before: string[]; after: string[] }> = {
  joy: { before: ["와아~", "헤헤"], after: ["최고야~", "헤헤"] },
  sad: { before: ["에잇…"], after: ["괜찮아 괜찮아…", "울어도 돼…"] },
  scared: { before: ["으앗"], after: ["어떻게든 되라─!", "괜찮을 거야!"] },
  hungry: { before: ["냠…"], after: ["같이 먹자~", "맛있겠다아"] },
  surprised: { before: ["엣?!", "우와"], after: ["굉장해~"] },
  angry: { before: ["으으"], after: ["진정 진정~"] },
  question: { before: ["음~"], after: ["어때?"] },
  plain: { before: ["저기 저기"], after: ["헤헤", "그치~"] },
};
```

- [ ] **Step 4: `translate.ts`**

```ts
import { HACHIWARE, MOOD_RULES, SOUNDS, type Character, type Mood } from "./lexicon";

export type { Character, Mood };
export type Sentence = { source: string; mood: Mood; tokens: string[] };

const MAX_TOKENS = 6;
/** 글자 몇 개마다 소리 하나. */
const CHARS_PER_TOKEN = 4;
const END_PUNCT = /[!?…~.]+$/u;

/** 문장 끝 기호까지 붙여서 나눈다. 글자·숫자가 하나도 없는 조각은 버린다(ㅠ 는 글자로 친다). */
export function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?…~\n]+[.!?…~]*/gu) ?? [];
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
  const end = source.match(END_PUNCT)?.[0] ?? "";
  let body = source.slice(0, source.length - end.length).trim();
  for (const [re, to] of ENDINGS) {
    if (re.test(body)) {
      body = body.replace(re, to);
      break;
    }
  }
  const tail = end.replace(/\./g, "") || "~";
  const { before, after } = HACHIWARE[mood];
  const tokens: string[] = [];
  if (rand() < 0.5) tokens.push(pick(before, rand));
  tokens.push(body + tail);
  tokens.push(pick(after, rand));
  return tokens;
}

function pick<T>(pool: T[], rand: () => number): T {
  return pool[Math.floor(rand() * pool.length)];
}

/** FNV-1a 32bit. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32. */
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run src/app/playground/chiikawa-talk`
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add src/app/playground/chiikawa-talk/{lexicon,translate,translate.test}.ts
git commit -m "feat(chiikawa-talk): 규칙 기반 먼작귀 통역 엔진"
```

### Task 2: 페이지와 말풍선 UI

**Files:**
- Create: `src/app/playground/chiikawa-talk/page.tsx`
- Create: `src/app/playground/chiikawa-talk/Translator.tsx`
- Create: `src/app/playground/chiikawa-talk/talk.css`

**Interfaces:**
- Consumes: `translate`, `toText`, `Sentence` (Task 1), `CHARACTERS`, `Character` (lexicon), `loadSprites(): Promise<{ kinds: string[]; urls: Map<string, string> }>` (`../desktop-chiikawa/sprites`).
- Produces: `/playground/chiikawa-talk` 라우트.

- [ ] **Step 1: `talk.css`** — `ct-` 접두사. 파스텔 배경(하늘→분홍 그라데이션 + 풀밭 언덕), Jua 제목 글꼴, 두꺼운 둥근 말풍선(`border: 3px solid #4b3a35; border-radius: 28px` + 꼬리), 탭 버튼 말랑 누름(`:active { transform: scale(.94) }`), 토막 등장 애니메이션 `ct-pop`(scale .4→1.08→1), 친구 그림 둥실 `ct-bob`, 반짝이 장식. `prefers-reduced-motion` 에서 애니메이션 끔.

- [ ] **Step 2: `Translator.tsx`** (client)
  - 상태: `draft`(입력), `said`(통역한 원문), `who`, `copied`, `urls`(그림).
  - 그림: `useEffect(() => { let alive = true; loadSprites().then(r => alive && setUrls(r.urls)); return () => { alive = false } }, [])` — 비동기 콜백 안 setState 라 린트 규칙 통과.
  - `const result = useMemo(() => translate(said, who), [said, who])`.
  - 말풍선은 `<Bubble key={`${who}:${said}`} … />` 로 다시 마운트 → 타자 효과가 처음부터.
  - `Bubble`: 토막 평탄화 후 `shown` 을 `setInterval` 콜백에서 1씩 올림(120ms). 원문은 밑에 작게.
  - 입력창에서 Enter(⇧ 없이) = 통역. 「복사」는 `navigator.clipboard.writeText(toText(result))`, 1.5초 「복사했어!」.
  - 그림 없으면 동그란 이름표.

- [ ] **Step 3: `page.tsx`** — desktop-chiikawa 처럼 metadata + `robots: { index: false, follow: false }`, Jua 링크, 제목 「먼작귀 통역기」, `<Translator />`, 하단 비공식 문구.

- [ ] **Step 4: 눈으로 확인** — `npm run dev` 후 브라우저로 세 탭·복사·빈 입력·긴 입력 확인, 폰 폭(390px)에서 가로 스크롤 없음.

- [ ] **Step 5: 린트** — `npx eslint src/app/playground/chiikawa-talk`

- [ ] **Step 6: 커밋**

### Task 3: 목록·사이트맵·배포 빌드

**Files:**
- Modify: `src/lib/projects.ts` (아이콘 `bubble` 추가, 항목 `hidden: true`)
- Modify: `src/components/AppIcon.tsx` (`Bubble` 그림 + ICONS 맵)
- Modify: `next-sitemap.config.js` (exclude 에 `/playground/chiikawa-talk`)

- [ ] **Step 1:** 위 세 파일 수정.
- [ ] **Step 2:** `npx tsc --noEmit -p .` 와 `npx vitest run src/app/playground/chiikawa-talk`.
- [ ] **Step 3:** `npm_config_legacy_peer_deps=true npx @cloudflare/next-on-pages` — 성공해야 한다.
- [ ] **Step 4:** 커밋 → push → PR(머지는 주원이 말할 때만).
