import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "네밥내밥 개인정보처리방침",
  description:
    "iOS·안드로이드 앱 네밥내밥이 처리하는 정보, 사진과 끼니 기록을 누가 볼 수 있는지, 계정을 지우는 방법에 대한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/yourmealmymeal/privacy",
  },
};

const UPDATED_AT = "2026년 9월 25일";
const CONTACT = "contact@joowonkoh.com";

export default function YourMealMyMealPrivacyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        네밥내밥 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        네밥내밥 개인정보처리방침
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            1. 개요
          </h2>
          <p className="mb-3">
            네밥내밥(이하 &ldquo;본 앱&rdquo;)은 오늘 먹은 끼니를 사진으로 기록하고
            같은 모임 사람들과 나누는 iOS·안드로이드 애플리케이션입니다. 본 방침은 본 앱이
            처리하는 정보와 그 목적, 이용자의 선택권을 설명합니다.
          </p>
          <p className="mb-3">요약하면 다음과 같습니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              사진과 끼니 기록은{" "}
              <strong className="text-text-primary">
                나와 같은 모임에 있는 사람에게만
              </strong>{" "}
              보입니다.
            </li>
            <li>
              본 앱은 화면 아래에{" "}
              <strong className="text-text-primary">Google AdMob 배너 광고</strong>를
              싣고, 이용 통계를 위해 Google Analytics for Firebase를 씁니다. 이름·이메일·
              사진·끼니 기록은 이 서비스들에 넘기지 않습니다.
            </li>
            <li>
              iOS에서는 광고 추적을{" "}
              <strong className="text-text-primary">허용할지 먼저 묻고</strong>,
              거절해도 앱의 모든 기능을 그대로 쓸 수 있습니다.
            </li>
            <li>
              계정은{" "}
              <strong className="text-text-primary">앱 안에서 직접</strong> 지울 수
              있고, 지우면 사진과 기록이 함께 사라집니다.
            </li>
          </ul>
          <p className="mt-3">
            문의 사항은{" "}
            <a className="text-accent hover:underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>{" "}
            으로 연락 부탁드립니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            2. 수집하는 정보
          </h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">이메일 주소</strong> — Apple 또는
              Google 로그인을 통해 전달받습니다. 로그인한 사람이 누구인지 가리는 데만
              쓰입니다.
            </li>
            <li>
              <strong className="text-text-primary">표시 이름</strong> — 모임 사람들에게
              보이는 이름입니다. 이용자가 직접 정하고 언제든 고칠 수 있습니다.
            </li>
            <li>
              <strong className="text-text-primary">끼니 사진</strong> — 이용자가 직접
              찍거나 앨범에서 고른 사진입니다. 앱의 목적 그 자체입니다.
            </li>
            <li>
              <strong className="text-text-primary">끼니 날짜와 시간대</strong> — 어느
              날의 어느 끼니인지 가리기 위해 필요합니다.
            </li>
            <li>
              <strong className="text-text-primary">기기 푸시 토큰</strong> — 알림을
              보낼 곳을 알기 위해 저장합니다.
            </li>
            <li>
              <strong className="text-text-primary">댓글</strong> — 같은 모임 사람의
              끼니에 남긴 글입니다. 그 모임 사람에게만 보입니다.
            </li>
            <li>
              <strong className="text-text-primary">프로필 사진</strong> — 이용자가
              직접 올리는 사진입니다. 나와 같은 모임 사람에게만 보입니다.
            </li>
            <li>
              <strong className="text-text-primary">신고·차단 기록</strong> — 누가
              무엇을 왜 신고했는지, 누구를 차단했는지입니다. 부적절한 내용을 처리하는
              데만 씁니다.
            </li>
            <li>
              <strong className="text-text-primary">계정 식별자</strong> — 가입할 때
              자동으로 만들어지는 임의의 문자열입니다. 사진과 기록이 누구의 것인지
              잇는 데만 쓰이고, 이름이나 이메일과 달리 화면에 드러나지 않습니다.
            </li>
          </ul>
          <p className="mt-3">광고와 이용 통계를 위해 다음 정보가 처리됩니다.</p>
          <ul className="ml-5 mt-3 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">앱 이용 정보</strong> — 본 화면과
              누른 기능, 앱 인스턴스 ID, 기기 종류와 OS, 대략적인 지역. 어떤 기능이
              쓰이는지 알고 앱을 고치는 데 쓰이며 Google Analytics for Firebase가
              처리합니다.
            </li>
            <li>
              <strong className="text-text-primary">광고 식별자와 광고 정보</strong> —
              iOS의 IDFA 또는 안드로이드 광고 ID, 광고 노출·클릭 정보. 광고를 보여주고
              성과를 재는 데 쓰이며 Google AdMob이 처리합니다. iOS에서는 &ldquo;앱 추적
              허용&rdquo;을 거절하면 IDFA가 쓰이지 않고 맞춤형이 아닌 광고가 나갑니다.
            </li>
          </ul>
          <p className="mt-3">
            본 앱은 정확한 위치 정보, 연락처, 통화 기록, 건강 정보, 결제 정보에
            접근하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            3. 누가 볼 수 있나
          </h2>
          <p className="mb-3">
            사진과 끼니 기록은 같은 모임에 속한 사람에게만 보입니다. 이 제한은 앱
            화면이 아니라{" "}
            <strong className="text-text-primary">데이터베이스 자체에 걸려 있어</strong>
            (Row Level Security), 앱을 고치거나 통신을 직접 흉내 내도 남의 끼니를
            가져올 수 없습니다.
          </p>
          <p className="mb-3">
            사진 보관함은 비공개이며, 사진을 보기 위한 링크는 짧은 시간만 유효합니다.
          </p>
          <p>
            푸시 토큰은 본인만 읽을 수 있는 별도의 표에 둡니다. 같은 모임 사람에게도
            보이지 않습니다. 토큰을 알면 그 기기로 임의의 알림을 보낼 수 있기
            때문입니다.
          </p>
          <p className="mt-3">
            댓글과 반응은{" "}
            <strong className="text-text-primary">남긴 모임 안에서만</strong> 보입니다.
            같은 사진이라도 다른 모임 사람에게는 보이지 않습니다. 신고하거나 차단한
            내용은 그 순간부터 신고·차단한 사람에게 보이지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            4. 제3자 서비스
          </h2>
          <p className="mb-3">
            본 앱은 개인정보를 판매하지 않습니다. 이름·이메일·사진·끼니 기록은 광고나
            분석 목적으로 제3자에게 제공하지 않습니다. 앱이 이용하는 서비스는 다음과
            같습니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">Supabase</strong> — 로그인, 데이터
              보관, 사진 저장. 서버는 대한민국(서울)에 있습니다.
            </li>
            <li>
              <strong className="text-text-primary">Expo</strong> — 알림 전달. iOS는
              Apple APNs, Android는 Google FCM 을 거칩니다. 알림 문구와 기기 토큰이
              전달됩니다.
            </li>
            <li>
              <strong className="text-text-primary">Apple / Google</strong> — 로그인.
              이메일 주소를 전달받습니다.
            </li>
            <li>
              <strong className="text-text-primary">Google AdMob</strong> — 배너 광고.
              광고 식별자, 광고 노출·클릭 정보, 기기 정보가 전달됩니다.
            </li>
            <li>
              <strong className="text-text-primary">Google Analytics for Firebase</strong>{" "}
              — 이용 통계. 앱 이용 정보, 앱 인스턴스 ID, 기기 정보가 전달됩니다.
            </li>
          </ul>
          <p className="mt-3">
            Google이 이 정보를 처리하는 방식은{" "}
            <a
              className="text-accent hover:underline"
              href="https://policies.google.com/technologies/partner-sites"
            >
              Google 파트너 사이트·앱의 데이터 사용 안내
            </a>
            에서 볼 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            5. 보관 기간
          </h2>
          <p>
            계정이 유지되는 동안 보관하며, 계정을 지우면 함께 지웁니다. 별도로
            보관하는 사본은 없습니다. 이용 통계는 계정에 묶여 있지 않으며 Google
            Analytics 기본 설정에 따라 2개월이 지나면 지워집니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            6. 계정 삭제
          </h2>
          <p className="mb-3">
            앱 안에서 바로 지울 수 있습니다:{" "}
            <strong className="text-text-primary">설정 &gt; 계정 삭제</strong>.
          </p>
          <p className="mb-3">
            지우면 프로필과 표시 이름, 프로필 사진, 올린 사진 파일, 끼니 기록, 댓글,
            반응, 신고·차단 기록, 모임 멤버십, 푸시 토큰이 모두 삭제되며 되돌릴 수
            없습니다.
          </p>
          <p>
            내가 만든 모임은 남아 있는 사람 중 가장 오래 있던 사람에게 넘어갑니다.
            남은 사람이 없으면 모임도 함께 사라집니다. 한 사람이 나간다고 해서 다른
            사람들의 모임이 없어지지는 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            7. 이용자의 권리
          </h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>표시 이름은 앱에서 언제든 고칠 수 있습니다.</li>
            <li>
              계정과 모든 기록은 위 6번 방법으로 즉시 지울 수 있습니다. 앱을 이미
              지우셨다면{" "}
              <Link
                className="font-medium text-accent underline underline-offset-4"
                href="/yourmealmymeal/delete-account"
              >
                계정 삭제 안내
              </Link>
              를 보아주세요.
            </li>
            <li>
              차단은 &lsquo;나&rsquo; 탭 &gt; 차단한 사람에서 언제든 풀 수 있습니다.
            </li>
            <li>알림은 기기 설정에서 언제든 끌 수 있습니다.</li>
            <li>
              광고 추적은 iOS 설정 &gt; 개인정보 보호 및 보안 &gt; 추적에서, 안드로이드는
              설정 &gt; Google &gt; 광고에서 언제든 끄거나 광고 ID를 지울 수 있습니다.
            </li>
            <li>
              그 밖의 열람·정정·삭제 요청은 위 이메일 주소로 연락해 주시기 바랍니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            8. 아동의 개인정보
          </h2>
          <p>
            본 앱은 만 14세 미만 아동을 대상으로 하지 않으며, 해당 연령의 이용자로부터
            의도적으로 정보를 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            9. 방침의 변경
          </h2>
          <p>
            본 방침은 법령이나 서비스 변경 사항을 반영하기 위해 수정될 수 있습니다.
            처리 항목에 변화가 생기는 경우 해당 기능이 포함된 버전이 배포되기 전에
            본 방침을 먼저 갱신하고 &ldquo;최종 업데이트&rdquo; 일자를 함께
            수정합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
