import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이게내연봉 개인정보처리방침",
  description:
    "iOS 앱 이게내연봉이 처리하는 정보, 광고와 이용 통계에 쓰이는 제3자 서비스, 이용자의 선택권에 대한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/moneytick/privacy",
  },
};

const UPDATED_AT = "2026년 7월 31일";
const CONTACT = "joowonkoh0505@gmail.com";

export default function MoneyTickPrivacyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        이게내연봉 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        이게내연봉 개인정보처리방침
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            1. 개요
          </h2>
          <p className="mb-3">
            이게내연봉(이하 &ldquo;본 앱&rdquo;)은 이용자가 입력한 급여를 바탕으로
            지금까지 쌓인 금액을 실시간으로 보여주는 iOS 애플리케이션입니다.
            본 방침은 본 앱이 처리하는 정보와 그 목적, 이용자의 선택권을 설명합니다.
          </p>
          <p className="mb-3">요약하면 다음과 같습니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">
                이용자가 입력한 급여와 설정은 기기 밖으로 나가지 않습니다.
              </strong>{" "}
              본 앱에는 계정도, 이용자 데이터를 받는 서버도 없습니다.
            </li>
            <li>
              다만 앱 내 <strong className="text-text-primary">광고 게재</strong>와{" "}
              <strong className="text-text-primary">이용 통계 집계</strong>를 위해
              Google 의 서비스를 이용하며, 이 과정에서 기기 정보 등이 Google 에 의해
              처리됩니다.
            </li>
            <li>
              본 앱은{" "}
              <strong className="text-text-primary">
                이용자를 추적하지 않습니다.
              </strong>{" "}
              광고 식별자(IDFA)에 접근하지 않으며 맞춤형 광고를 제공하지 않습니다.
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
            2. 이용자가 입력한 정보
          </h2>
          <p className="mb-3">
            급여 금액, 근무시간, 표시 설정, 직접 추가한 비교 대상 등 이용자가 앱에
            입력한 내용은 다음과 같이 처리됩니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">
                이용자의 기기 내부에만 저장됩니다.
              </strong>{" "}
              앱과 위젯, 다이나믹 아일랜드가 같은 값을 표시할 수 있도록 iOS 의
              App Group 저장소를 사용합니다.
            </li>
            <li>
              개발자를 포함한 누구도 이 정보를 열람할 수 없습니다. 전송되는 곳이
              없기 때문입니다. 이 정보는 광고나 통계에도 사용되지 않습니다.
            </li>
            <li>
              기기에 iCloud 백업이 설정되어 있는 경우 앱 데이터가 Apple 의 백업에
              포함될 수 있습니다. 이는 iOS 의 기본 동작이며 본 앱이 별도로 요청하는
              것이 아닙니다.
            </li>
          </ul>
          <p className="mt-3">
            본 앱은 위치 정보, 연락처, 사진, 전화번호, 결제 정보, 건강 정보에
            접근하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            3. 광고 (Google AdMob)
          </h2>
          <p className="mb-3">
            본 앱은 Google AdMob 을 통해 앱 내에 광고를 게재합니다. 금액 변경 횟수를
            충전하는 보상형 광고와, 비교 기능을 일정 횟수 사용했을 때 나타나는 전면
            광고 두 가지입니다.
          </p>
          <p className="mb-3">
            <strong className="text-text-primary">
              본 앱은 비맞춤형(non-personalized) 광고만 요청합니다.
            </strong>{" "}
            이용자의 관심사나 과거 행동에 기반한 맞춤형 광고를 제공하지 않으며, 이를
            위해 iOS 의 앱 추적 투명성(ATT) 동의를 요청하지 않고 광고 식별자(IDFA)에도
            접근하지 않습니다.
          </p>
          <p className="mb-3">
            비맞춤형 광고에서도 광고를 전달하고 부정 클릭을 방지하기 위해 Google 이
            다음과 같은 정보를 처리할 수 있습니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>IP 주소 및 이로부터 추정되는 대략적인 지역(국가·도시 수준)</li>
            <li>기기 종류, 운영체제 버전, 언어 설정 등 기기 정보</li>
            <li>광고 노출·클릭 여부 등 광고 상호작용 기록</li>
          </ul>
          <p className="mt-3">
            또한 본 앱은 Apple 의 SKAdNetwork 를 지원합니다. 개별 이용자를 식별하지
            않고 광고 성과를 측정하도록 Apple 이 제공하는 방식입니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            4. 이용 통계 (Google Analytics for Firebase)
          </h2>
          <p className="mb-3">
            어떤 기능이 실제로 쓰이는지 파악해 앱을 개선하기 위해 Google Analytics
            for Firebase 를 사용합니다. 처리되는 항목은 다음과 같습니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">앱 인스턴스 식별자</strong> —
              설치된 앱마다 Firebase 가 생성하는 임의의 값입니다. 이름·이메일 등
              이용자 개인과 연결되지 않으며, 앱을 삭제하면 사라집니다.
            </li>
            <li>
              <strong className="text-text-primary">기기 및 환경 정보</strong> — 기기
              종류, 운영체제 버전, 언어, 국가.
            </li>
            <li>
              <strong className="text-text-primary">앱 사용 이벤트</strong> — 화면
              조회, 급여 단위 변경, 비교 실행, 위젯·다이나믹 아일랜드 사용 여부 등
              기능 사용 기록.
            </li>
          </ul>
          <p className="mt-3">
            <strong className="text-text-primary">
              이용자가 입력한 급여 금액은 전송되지 않습니다.
            </strong>{" "}
            어떤 단위(연봉·월급·일급)를 선택했는지와 같은 설정의 종류만 기록되며,
            금액 자체는 대상이 아닙니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            5. 제3자 서비스
          </h2>
          <p className="mb-3">
            위 두 기능은 모두 Google 이 제공하며, 해당 정보는 Google 의 정책에 따라
            처리됩니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">Google AdMob</strong> — 광고 게재
              및 성과 측정
            </li>
            <li>
              <strong className="text-text-primary">
                Google Analytics for Firebase
              </strong>{" "}
              — 앱 이용 통계 집계
            </li>
          </ul>
          <p className="mt-3">
            자세한 처리 방식은 Google 의{" "}
            <a
              className="text-accent hover:underline"
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
            >
              파트너 사이트에서의 데이터 사용 방침
            </a>
            을 참고해 주시기 바랍니다. 본 앱은 이용자의 정보를 제3자에게 판매하지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            6. 정보의 보관 및 파기
          </h2>
          <p>
            이용자가 입력한 급여와 설정은 기기에만 있으므로 앱을 삭제하면 함께
            삭제되며, 외부에 보관된 사본이 없습니다. 광고 및 통계 목적으로 Google 이
            처리하는 정보의 보관 기간은 Google 의 정책을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            7. 이용자의 선택권
          </h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              iOS 의{" "}
              <strong className="text-text-primary">
                설정 &gt; 개인정보 보호 및 보안 &gt; Apple 광고
              </strong>{" "}
              에서 개인 맞춤형 광고를 제한할 수 있습니다.
            </li>
            <li>
              앱을 삭제하면 기기에 저장된 데이터와 앱 인스턴스 식별자가 함께
              사라집니다.
            </li>
            <li>그 밖의 문의나 요청은 위 이메일 주소로 연락해 주시기 바랍니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            8. 아동의 개인정보
          </h2>
          <p>
            본 앱은 만 14세 미만 아동을 대상으로 하지 않으며, 연령을 포함해 이용자를
            개인적으로 식별할 수 있는 정보를 수집하지 않습니다.
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
