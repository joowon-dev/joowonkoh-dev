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
  ["sad", /ㅠ|ㅜ|슬퍼|슬프|울고|울어|눈물|속상|힘들|망했/u],
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
    scared: ["히익…!", "으…", "히이이…"],
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
  hungry: { before: ["꿀꺽…"], after: ["같이 먹자~", "맛있겠다아"] },
  surprised: { before: ["엣?!", "우와"], after: ["굉장해~"] },
  angry: { before: ["으으"], after: ["진정 진정~"] },
  question: { before: ["음~"], after: ["어때?"] },
  plain: { before: ["저기 저기"], after: ["헤헤", "그치~"] },
};

/** 거꾸로 통역 — 소리만 있을 때 감정마다 짐작해 내놓는 한글. */
export const MEANINGS: Record<Mood, string[]> = {
  joy: ["너무 좋아! 신난다!", "행복해~", "최고야!"],
  sad: ["너무 속상해…", "울고 싶어…", "힘들어…"],
  scared: ["무서워… 어떡해", "살려 줘…!", "떨려…"],
  hungry: ["배고파! 맛있는 거 먹고 싶어", "간식 먹을래", "밥 먹자!"],
  surprised: ["헉, 깜짝이야!", "진짜?!", "말도 안 돼!"],
  angry: ["으, 화나!", "짜증 나!", "그만해!"],
  question: ["이게 뭐야?", "뭐라고?", "어떻게 된 거야?"],
  plain: ["응, 그렇구나", "음…", "알겠어"],
};
