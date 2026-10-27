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
import type { Landing } from "./types";
import vi from "./vi";
import zhHans from "./zh-hans";
import zhHant from "./zh-hant";

/**
 * 언어별 문구.
 *
 * 데모(티커·레이스·카운터)는 클라이언트 컴포넌트라 함수가 든 문구를 서버에서 넘겨
 * 받을 수 없다. 그래서 언어 이름만 받고 여기서 직접 꺼낸다 — 12개 언어가 한 번에
 * 실리지만 글자뿐이라 몇 십 KB 다.
 */
export const LANDING: Record<Lang, Landing> = {
  ko,
  en,
  ja,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
  de,
  fr,
  es,
  pt,
  id,
  th,
  vi,
};
