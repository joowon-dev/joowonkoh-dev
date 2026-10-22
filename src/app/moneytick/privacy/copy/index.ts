import type { Lang } from "../../i18n";
import de from "./de";
import en from "./en";
import es from "./es";
import fr from "./fr";
import id from "./id";
import ja from "./ja";
import ko from "./ko";
import pt from "./pt";
import th from "./th";
import type { Privacy } from "./types";
import vi from "./vi";
import zhHans from "./zh-hans";
import zhHant from "./zh-hant";

export const PRIVACY: Record<Lang, Privacy> = {
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
