import { COPY } from "../copy";
import type { Lang } from "../i18n";
import RedirectScript from "../RedirectScript";
import InviteCode from "./InviteCode";

/**
 * 앱이 보낸 초대 링크(…/join?code=AB2K9M)가 닿는 곳.
 *
 * 카톡에서 앱 주소(yourmealmymeal://)는 눌리지 않아서 웹 주소를 보내고,
 * 여기서 코드를 보여 준 뒤 "앱에서 열기"로 앱의 참여 화면에 코드를 넘긴다.
 * 코드는 서버에서 읽지 않는다 — searchParams를 받으면 라우트가 동적이 된다(SectionList 주석 참고).
 * 이 페이지만 셸(벽지·머리·꼬리)을 두르지 않는다(Shell.tsx). 바탕과 꼬리는 InviteCode가 직접 그린다.
 *
 * 앱은 언어와 상관없이 한국어 주소(`/yourmealmymeal/join?code=…`)를 보낸다. 받은 사람의 브라우저가
 * 다른 말을 쓰면 RedirectScript 가 코드를 단 채로 그 언어 주소로 옮긴다.
 */
export default function Join({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  return (
    <>
      <RedirectScript lang={lang} sub="/join" />
      <InviteCode
        lang={lang}
        t={copy.join}
        download={copy.store.download}
        appName={copy.appName}
        languageLabel={copy.shell.language}
      />
    </>
  );
}
