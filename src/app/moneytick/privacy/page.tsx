import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이게내연봉 개인정보처리방침",
  description:
    "iOS 앱 이게내연봉이 수집하는 정보, 데이터 보관 위치, 이용자의 권리에 대한 안내입니다. 본 앱은 어떠한 개인정보도 수집하지 않습니다.",
  alternates: {
    canonical: "https://joowonkoh.com/moneytick/privacy",
  },
};

const UPDATED_AT = "2026년 7월 30일";
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
          <p>
            이게내연봉(이하 &ldquo;본 앱&rdquo;)은 이용자가 입력한 급여를 바탕으로
            지금까지 쌓인 금액을 실시간으로 보여주는 iOS 애플리케이션입니다.
            <strong className="text-text-primary">
              {" "}
              본 앱은 어떠한 개인정보도 수집하지 않으며, 이용자의 기기 밖으로
              데이터를 전송하지 않습니다.
            </strong>{" "}
            본 방침은 그 사실과 근거, 이용자의 권리를 설명합니다. 문의 사항은{" "}
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
          <p className="mb-3">
            본 앱은 개인정보를 수집하지 않습니다. 구체적으로 다음에 해당합니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">계정이 없습니다</strong> —
              회원가입과 로그인 절차가 없으며, 이메일 주소나 이름 등 이용자를
              식별할 수 있는 정보를 요구하지 않습니다.
            </li>
            <li>
              <strong className="text-text-primary">서버가 없습니다</strong> —
              본 앱은 외부와 네트워크 통신을 하지 않습니다. 이용자가 입력한 급여와
              설정을 전송받는 서버가 존재하지 않습니다.
            </li>
            <li>
              <strong className="text-text-primary">추적하지 않습니다</strong> —
              광고 식별자(IDFA)를 사용하지 않으며, 이용자를 추적하거나 다른
              사업자의 데이터와 결합하지 않습니다.
            </li>
            <li>
              <strong className="text-text-primary">
                제3자 SDK가 없습니다
              </strong>{" "}
              — 광고, 분석, 오류 수집 등 이용자 정보를 외부로 보내는 소프트웨어
              개발 도구를 포함하지 않습니다.
            </li>
          </ul>
          <p className="mt-3">
            본 앱은 위치 정보, 연락처, 사진, 전화번호, 결제 정보, 건강 정보 등
            어떠한 종류의 개인정보에도 접근하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            3. 이용자가 입력한 정보의 보관
          </h2>
          <p className="mb-3">
            이용자가 입력한 급여 금액, 근무시간, 표시 설정, 직접 추가한 비교 대상
            등은 앱 기능에 반드시 필요한 정보이며 다음과 같이 처리됩니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              해당 정보는{" "}
              <strong className="text-text-primary">
                이용자의 기기 내부에만 저장
              </strong>
              됩니다. 앱과 위젯, 다이나믹 아일랜드가 같은 값을 표시할 수 있도록
              iOS의 App Group 저장소를 사용합니다.
            </li>
            <li>
              개발자를 포함한 누구도 이 정보를 열람할 수 없습니다. 전송되는 곳이
              없기 때문입니다.
            </li>
            <li>
              기기에 iCloud 백업이 설정되어 있는 경우, 앱 데이터가 Apple의 백업에
              포함될 수 있습니다. 이는 iOS의 기본 동작이며 본 앱이 별도로 요청하는
              것이 아닙니다. 백업의 처리 방식은 Apple의 정책을 따릅니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            4. 정보의 파기
          </h2>
          <p>
            앱을 삭제하면 기기에 저장된 모든 데이터가 함께 삭제됩니다. 외부에
            보관된 사본이 없으므로 별도의 삭제 요청 절차가 필요하지 않습니다.
            앱 내 설정에서 급여와 근무시간을 언제든지 변경하거나 지울 수도
            있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            5. 아동의 개인정보
          </h2>
          <p>
            본 앱은 만 14세 미만 아동을 대상으로 하지 않습니다. 다만 본 앱은
            연령을 포함한 어떠한 개인정보도 수집하지 않으므로, 아동의 정보가
            수집될 여지 자체가 없습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            6. 방침의 변경
          </h2>
          <p>
            향후 업데이트에서 광고나 통계 기능이 추가되는 등 수집 항목에 변화가
            생기면, 해당 기능이 포함된 버전이 배포되기 전에 본 방침을 먼저
            갱신하고 &ldquo;최종 업데이트&rdquo; 일자를 함께 수정합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
