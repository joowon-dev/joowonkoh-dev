import { redirectScript, type Lang, type Sub } from "./i18n";

/**
 * 페이지 맨 앞의 언어 갈림길(i18n.ts 의 redirectScript). 서버 컴포넌트에서 그려야 HTML 에 그대로 실려
 * React 가 붙기 전에 돈다.
 */
export default function RedirectScript({ lang, sub }: { lang: Lang; sub: Sub }) {
  return <script dangerouslySetInnerHTML={{ __html: redirectScript(lang, sub) }} />;
}
