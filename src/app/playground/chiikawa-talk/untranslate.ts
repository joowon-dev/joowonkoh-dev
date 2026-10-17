import { MEANINGS, MOOD_RULES, SOUNDERS, SOUNDS, TALK, type Character, type Mood, type Talker } from "./lexicon";
import { hash, pick, rng } from "./translate";

/**
 * 거꾸로 통역(먼작귀 → 한글). 앞으로 통역이 원문을 버리므로 이쪽은 **짐작**이다 —
 * 소리마다 사전에서 감정과 말한 친구를 찾고, 감정마다 정해 둔 한글로 바꾼다.
 * 말하는 친구(하치와레·모몽가·랏코·시사)의 말은 원래 한글이라 말버릇만 걷어 내고 남은 말을 그대로 돌려준다.
 */
export type Part = { source: string; mood: Mood; meaning: string };
export type Reading = { who: Character | null; parts: Part[] };

/** 감정이 둘 이상 걸릴 때 먼저 고르는 차례. */
const ORDER: Mood[] = [...MOOD_RULES.map(([m]) => m), "question", "plain"];
const END_PUNCT = /[!?…~.]+$/u;
const bare = (t: string) => t.replace(END_PUNCT, "");

type Hit = { who: Set<Character>; moods: Set<Mood> };

/** 소리(끝 기호 뗀 것) → 누가, 어떤 감정으로 내는 소리인지. */
const SOUND_INDEX = (() => {
  const index = new Map<string, Hit>();
  for (const who of SOUNDERS) {
    for (const [mood, pool] of Object.entries(SOUNDS[who]) as [Mood, string[]][]) {
      for (const sound of pool) {
        const key = bare(sound);
        if (!key) continue;
        const hit = index.get(key) ?? { who: new Set(), moods: new Set() };
        hit.who.add(who);
        hit.moods.add(mood);
        index.set(key, hit);
      }
    }
  }
  return index;
})();

/** 말하는 친구들의 말버릇 — 긴 것부터 걷어 내야 「괜찮아 괜찮아…」가 반쪽만 남지 않는다. */
const PHRASES = (Object.entries(TALK) as [Talker, (typeof TALK)[Talker]][])
  .flatMap(([who, { phrases }]) =>
    (Object.entries(phrases) as [Mood, { before: string[]; after: string[] }][]).flatMap(([mood, { before, after }]) =>
      [...before, ...after].map((phrase) => ({ phrase, mood, who })),
    ),
  )
  .sort((a, b) => b.phrase.length - a.phrase.length);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function untranslate(text: string): Reading {
  const votes = new Map<Character, number>();
  const vote = (who: Character) => votes.set(who, (votes.get(who) ?? 0) + 1);
  const parts: Part[] = [];

  for (const line of text.split("\n")) {
    // 1) 말하는 친구들의 말버릇을 걷어 낸다.
    let rest = ` ${line} `;
    let talkMood: Mood | null = null;
    for (const { phrase, mood, who } of PHRASES) {
      const re = new RegExp(`(?<=\\s)${escape(phrase)}(?=\\s)`, "gu");
      if (re.test(rest)) {
        rest = rest.replace(re, " ");
        talkMood ??= mood;
        vote(who);
      }
    }

    // 2) 토막마다 소리인지 낱말인지 보고, 감정이 이어지는 동안 한 조각으로 묶는다.
    type Run = { tokens: string[]; moods: Set<Mood> | null };
    const runs: Run[] = [];
    for (const token of rest.split(/\s+/u).filter(Boolean)) {
      const hit = SOUND_INDEX.get(bare(token));
      if (hit) hit.who.forEach(vote);
      const last = runs.at(-1);
      if (!hit) {
        if (last && last.moods === null) last.tokens.push(token);
        else runs.push({ tokens: [token], moods: null });
        continue;
      }
      const shared = last?.moods ? new Set([...last.moods].filter((m) => hit.moods.has(m))) : null;
      if (last && shared && shared.size > 0) {
        last.tokens.push(token);
        last.moods = shared;
      } else {
        runs.push({ tokens: [token], moods: new Set(hit.moods) });
      }
    }

    // 3) 조각마다 한글로.
    for (const run of runs) {
      const source = run.tokens.join(" ");
      if (run.moods === null && talkMood !== null) {
        // 말하는 친구가 한 말 — 원래 한글이다. 늘인 「~」 「—」만 뗀다.
        parts.push({ source, mood: talkMood, meaning: source.replace(/[~—]+/gu, "") });
        continue;
      }
      const mood = run.moods ? ORDER.find((m) => run.moods!.has(m))! : byPunct(source);
      parts.push({ source, mood, meaning: pick(MEANINGS[mood], rng(hash(source))) });
    }
  }

  let who: Character | null = null;
  for (const [c, n] of votes) if (!who || n > votes.get(who)!) who = c;
  return { who, parts };
}

function byPunct(source: string): Mood {
  if (source.includes("?")) return "question";
  if (source.includes("!")) return "joy";
  return "plain";
}
