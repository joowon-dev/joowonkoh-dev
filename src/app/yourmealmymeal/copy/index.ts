import type { Lang } from "../i18n";
import de from "./de";
import en from "./en";
import es from "./es";
import fr from "./fr";
import id from "./id";
import ja from "./ja";
import ko from "./ko";
import pt from "./pt";
import th from "./th";
import type { Copy } from "./types";
import vi from "./vi";
import zhHans from "./zh-hans";
import zhHant from "./zh-hant";

/**
 * 언어별 글. 서버 컴포넌트에서만 통째로 꺼낸다 — 클라이언트 컴포넌트(식판 인사·초대코드·질문 카드)에는
 * 그 페이지에 필요한 조각만 props 로 넘겨, 12개 언어의 개인정보처리방침이 브라우저로 실려 가지 않게 한다.
 */
export const COPY: Record<Lang, Copy> = {
  ko,
  en,
  ja,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
  es,
  fr,
  de,
  pt,
  id,
  vi,
  th,
};
