/**
 * 먼작귀 통역 사전. 데이터만 둔다 — 고르는 규칙은 translate.ts.
 * 소리·말버릇은 원작(만화·애니)에 나온 말을 한글로 옮긴 것이다(녹음·이미지 없음).
 *   치이카와 「ワァ…」「イヤッ」「ヤダーッ」「フ…」, 우사기 「ウラ」「ヤハ」「ハァ?」「フゥン」「プルヤ」,
 *   밤만쥬 술 마신 뒤의 「ハーッ」, 하치와레 「なんとかなれーッ」「泣いちゃった」「〜ってコト!?」,
 *   모몽가 「み〜て〜」「ヤダヤダ」「慰めろ」「甘いものが食べたいんだよォー」, 랏코 「鍛えれば強くなれる」,
 *   시사 「でーす」「お師匠」「うれシーサー」「どうなるか…わかんないケド…がんばりまーす」.
 */
export type Character = "chiikawa" | "hachiware" | "usagi" | "momonga" | "kurimanju" | "rakko" | "shisa";
export type Mood = "joy" | "sad" | "scared" | "hungry" | "surprised" | "angry" | "question" | "plain";

/** 말을 못 하고 소리만 내는 친구들. 나머지는 말을 하되 말투가 다르다. */
export type Sounder = "chiikawa" | "usagi" | "kurimanju";
export type Talker = Exclude<Character, Sounder>;
export const SOUNDERS: Sounder[] = ["chiikawa", "usagi", "kurimanju"];
export const isSounder = (c: Character): c is Sounder => (SOUNDERS as Character[]).includes(c);

export const CHARACTERS: { id: Character; name: string; hint: string }[] = [
  { id: "chiikawa", name: "치이카와", hint: "말 대신 「와아…」 「이얏!」" },
  { id: "hachiware", name: "하치와레", hint: "말은 그대로, 「어떻게든 되라─!!」" },
  { id: "usagi", name: "우사기", hint: "우라! 야하! 하아?" },
  { id: "momonga", name: "모몽가", hint: "귀여운 척하면서 떼쓰기" },
  { id: "kurimanju", name: "밤만쥬", hint: "한 잔 들이켜고 「하아—앗」" },
  { id: "rakko", name: "랏코", hint: "차분하고 든든한 선배 말투" },
  { id: "shisa", name: "시사", hint: "꼬박꼬박 존댓말, 끝은 「~요—!」" },
];

/** 위에서부터 먼저 걸리는 감정. 키워드가 없으면 ? 로 question, 그 밖은 plain. */
export const MOOD_RULES: [Mood, RegExp][] = [
  ["sad", /ㅠ|ㅜ|슬퍼|슬프|울고|울어|눈물|속상|힘들|망했/u],
  ["scared", /무서|무섭|어떡|어떻게 해|겁나|떨려|살려/u],
  ["angry", /짜증|화나|화가|싫어|열받|빡/u],
  ["hungry", /배고|배가 고|먹|맛있|냠|밥|간식|떡볶이|라면|술|맥주/u],
  ["surprised", /헉|대박|깜짝|진짜\?|정말\?|세상에|헐/u],
  ["joy", /좋아|좋다|신나|최고|행복|ㅋ|ㅎㅎ|사랑|고마|감사|야호/u],
];

/**
 * 소리만 내는 친구들이 감정마다 내는 소리. 한 토막은 띄어쓰기 없이 쓴다(거꾸로 통역이 띄어쓰기로 자른다).
 * - 치이카와: 낱말 대신 한두 음절. 기쁘면 「와아…!」, 싫으면 「이얏!」 「야다—!」, 먹을 땐 「우물우물」.
 * - 우사기: 「우라」 「야하」가 기본, 의문은 「하아?」, 졸라 댈 땐 「후웅」.
 * - 밤만쥬: 거의 말이 없다. 술을 들이켠 뒤의 「하아—앗」이 전부라서 토막도 적다.
 */
export const SOUNDS: Record<Sounder, Record<Mood, string[]>> = {
  chiikawa: {
    joy: ["와아…!", "와…", "후…!", "응!", "와앗"],
    sad: ["와아………아…", "우…우…", "흐윽…", "으…"],
    scared: ["히잇…!", "아앗…!", "이얏!!", "와아아…!"],
    hungry: ["냠냠…", "우물우물", "와아…!", "냠…"],
    surprised: ["엣…!", "핫…!", "앗…", "에엣…"],
    angry: ["이얏!", "야다—!", "야—!!"],
    question: ["…?", "에…?", "응…?"],
    plain: ["응", "와…", "아…", "후…"],
  },
  usagi: {
    joy: ["야하!", "우라!", "푸루루루", "푸루야!", "야하—앗!", "루루루루"],
    sad: ["후웅…", "후우우…", "우라…"],
    scared: ["우깃!!", "하아?!", "이야—앗!"],
    hungry: ["우루우루우루", "야하!", "후웅!", "쿠부쿠부…"],
    surprised: ["하아?!", "하아—앗!", "호아?!"],
    angry: ["우라앗!!", "하아?!", "우깃!!", "우라라야하!!"],
    question: ["하아?", "후웅?", "호아?"],
    plain: ["우라", "야하", "후웅", "푸루루", "쓰쓰우라우라"],
  },
  kurimanju: {
    joy: ["하아—앗…!", "하—…", "후우…"],
    sad: ["하아…", "……"],
    scared: ["흐읍…", "읏…"],
    hungry: ["하아—앗!!", "꿀꺽꿀꺽", "쩝…"],
    surprised: ["읏?!", "하?"],
    angry: ["흐음…", "후웃"],
    question: ["음…?", "흠?"],
    plain: ["하—…", "음", "후우…"],
  },
};

/** 말하는 친구가 원문 앞뒤에 붙이는 말. 앞말은 반쯤, 뒷말은 늘 붙인다. */
export type Phrases = Record<Mood, { before: string[]; after: string[] }>;

export const TALK: Record<
  Talker,
  {
    /** 어미 바꾸기. 위에서부터 하나만 바꾼다. */
    endings: Ending[];
    /** 원문 끝에 기호가 없을 때 붙일 끝맺음. */
    end: string;
    /** 어미를 바꾼 뒤 이 끝말을 「—」로 늘인다. */
    stretch?: RegExp;
    phrases: Phrases;
  }
> = {
  // 가장 밝고 다정하다. 친구를 「괜찮아!」로 다독이고, 위기엔 「어떻게든 되라─!!」.
  hachiware: {
    endings: polite2casual(),
    end: "~",
    phrases: {
      joy: { before: ["와—이!", "헤헤"], after: ["최고잖아!!", "이것도 「맛」이지!", "그거 최고 아니야?"] },
      sad: { before: ["에잇…"], after: ["울어버렸다…!", "괜찮아 괜찮아…", "몇 번이든… 계속 응원할게!!"] },
      scared: { before: ["으앗"], after: ["어떻게든 되라─!!", "괜찮아! 늘 어떻게든 됐잖아!!"] },
      hungry: { before: ["꿀꺽…"], after: ["같이 먹자!!", "맛있겠다아~"] },
      surprised: { before: ["엣?!", "에엣—?!"], after: ["굉장해—!", "진짜로?!"] },
      angry: { before: ["으으"], after: ["진정 진정~", "지칠 땐 쉬어도 돼~"] },
      question: { before: ["음~", "저기저기"], after: ["…라는 거?!", "어때?"] },
      plain: { before: ["있잖아"], after: ["헤헤", "그치~"] },
    },
  },
  // 귀여운 척하다가 떼쓴다. 칭찬·위로·간식을 대놓고 요구한다.
  momonga: {
    endings: polite2casual(),
    end: "!",
    phrases: {
      joy: { before: ["봐~ 봐~", "후훗"], after: ["나 귀엽지?", "칭찬해 줘!", "더 예뻐해 줘!"] },
      sad: { before: ["야다야다!"], after: ["위로해!", "나 좀 달래 줘!"] },
      scared: { before: ["야다야다!"], after: ["지켜 줘!", "저리 가!!"] },
      hungry: { before: ["그거 내 거야!"], after: ["단 거 먹고 싶단 말이야—!", "나도 줘!"] },
      surprised: { before: ["뭐어?!"], after: ["흥, 별거 아니네!"] },
      angry: { before: ["흥!"], after: ["저리 가!!", "다 내 거야!"] },
      question: { before: ["왜? 왜?"], after: ["빨리 대답해!"] },
      plain: { before: ["흥~"], after: ["나 귀엽지?", "칭찬해 줘!"] },
    },
  },
  // 토벌 랭킹 1위. 말수가 적고 차분하다. 「단련하면 강해질 수 있어」.
  rakko: {
    endings: polite2casual(),
    end: ".",
    phrases: {
      joy: { before: ["훗."], after: ["…좋군.", "나쁘지 않아."] },
      sad: { before: ["그래…"], after: ["단련하면 강해질 수 있어.", "누구나 처음엔 그래."] },
      scared: { before: ["물러서."], after: ["내 뒤에 있어.", "침착하게."] },
      hungry: { before: ["흠."], after: ["디저트라도 먹으러 갈까.", "먹는 것도 단련이야."] },
      surprised: { before: ["…호오."], after: ["재밌군."] },
      angry: { before: ["진정해."], after: ["분노는 칼끝을 흐리게 해."] },
      question: { before: ["흠…"], after: ["너는 어떻게 생각해?"] },
      plain: { before: ["…그래."], after: ["…그렇군.", "강해지자."] },
    },
  },
  // 라멘집 「郎」 알바. 사장님을 「스승님」이라 부르고, 「~요」를 「~요—」로 늘인다.
  shisa: {
    endings: [
      [/(요|니다)$/u, "$1"], // 이미 존댓말이면 그대로
      [/싶다$/u, "싶어요"],
      [/좋다$/u, "좋아요"],
      // 갔다·했다·있다처럼 받침 ㅆ(또는 없다) 뒤의 「다」 → 「어요」. 그 밖의 「다」는 둔다.
      [/([가-힣])다$/u, (_, c: string) => (jong(c) === "ㅆ" || c === "없" ? `${c}어요` : `${c}다`)],
      [/이야$/u, "이에요"],
      [/야$/u, "예요"],
      [/([해봐와가줘워파어아지래게네까려져써돼서])$/u, "$1요"],
    ],
    end: "!",
    stretch: /(요|니다)$/u,
    phrases: {
      joy: { before: ["넵—!"], after: ["기쁘시사—!", "최고예요—!"] },
      sad: { before: ["흑…"], after: ["그래도… 열심히 할게요—!", "내일은 더 잘할 거예요—!"] },
      scared: { before: ["히엑—!"], after: ["어떻게 될지… 모르겠지만… 열심히 하겠습니다—!!"] },
      hungry: { before: ["어서 오세요—!"], after: ["라멘 한 그릇 어떠세요—?", "스승님 라멘은 최고예요—!"] },
      surprised: { before: ["에엑—?!"], after: ["굉장하시사—!"] },
      angry: { before: ["저기요—!"], after: ["그러면 안 돼요—!"] },
      question: { before: ["스승님—!"], after: ["어떠세요—?"] },
      plain: { before: ["넵—!"], after: ["열심히 하겠습니다—!", "잘 부탁드려요—!"] },
    },
  },
};

/** 어미 바꾸기 한 줄 — String.replace 에 그대로 넘긴다. */
export type Ending = [RegExp, string | ((match: string, ...groups: string[]) => string)];

const JONG = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
/** 한글 한 글자의 받침. */
const jong = (c: string) => JONG[(c.charCodeAt(0) - 0xac00) % 28];

/** 존댓말 어미 → 반말. */
function polite2casual(): Ending[] {
  return [
    [/합니다$/u, "해"],
    [/입니다$/u, "이야"],
    [/이에요$/u, "이야"],
    [/예요$/u, "야"],
    [/에요$/u, "야"],
    [/세요$/u, "셔"],
    [/요$/u, ""],
  ];
}

/** 거꾸로 통역 — 소리만 있을 때 감정마다 짐작해 내놓는 한글. */
export const MEANINGS: Record<Mood, string[]> = {
  joy: ["너무 좋아! 신난다!", "행복해~", "최고야!"],
  sad: ["너무 속상해…", "울고 싶어…", "힘들어…"],
  scared: ["무서워… 어떡해", "살려 줘…!", "떨려…"],
  hungry: ["배고파! 맛있는 거 먹고 싶어", "간식 먹을래", "밥 먹자!"],
  surprised: ["헉, 깜짝이야!", "진짜?!", "말도 안 돼!"],
  angry: ["으, 화나!", "싫어! 그만해!", "짜증 나!"],
  question: ["이게 뭐야?", "뭐라고?", "어떻게 된 거야?"],
  plain: ["응, 그렇구나", "음…", "알겠어"],
};
