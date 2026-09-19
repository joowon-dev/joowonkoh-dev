import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "미션용돈 개인정보처리방침",
  description:
    "iOS 앱 미션용돈이 처리하는 정보에 대한 안내입니다. 미션용돈은 개인정보를 수집하지 않으며, 입력한 내용은 기기 밖으로 나가지 않습니다.",
  alternates: {
    canonical: "https://joowonkoh.com/mission-money/privacy",
  },
};

const UPDATED_AT = "2026년 9월 19일";
const CONTACT = "contact@joowonkoh.com";

export default function MissionMoneyPrivacyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        미션용돈 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        미션용돈 개인정보처리방침
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] break-keep text-text-secondary">
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            1. 개요
          </h2>
          <p className="mb-3">
            미션용돈(이하 &ldquo;본 앱&rdquo;)은 여럿이 모인 자리에서 미션을 뽑고
            용돈 금액을 정하는 iOS 애플리케이션입니다. 본 방침은 본 앱이 어떤 정보를
            처리하는지 설명합니다.
          </p>
          <p className="mb-3">요약하면 다음과 같습니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">
                본 앱은 개인정보를 수집하지 않습니다.
              </strong>{" "}
              계정도, 이용자 데이터를 받는 서버도 없습니다.
            </li>
            <li>
              입력한 참가자 이름과 미션은{" "}
              <strong className="text-text-primary">기기 안에만</strong>{" "}
              저장됩니다.
            </li>
            <li>
              <strong className="text-text-primary">
                광고와 이용 통계 도구를 넣지 않았습니다.
              </strong>{" "}
              제3자에게 전달되는 정보가 없습니다.
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
            참가자 이름, 미션 문구, 금액 설정, 지난 판의 기록은 다음과 같이
            처리됩니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">
                이용자의 기기 내부 저장소에만 저장됩니다.
              </strong>{" "}
              전송되는 곳이 없으므로 개발자를 포함한 누구도 이 내용을 열람할 수
              없습니다.
            </li>
            <li>
              참가자 이름은 가족·친구를 부르는 호칭으로 쓰이며, 본 앱은 실명·생년월일
              등 신원을 확인하는 정보를 요구하지 않습니다.
            </li>
            <li>
              기기에 백업이 설정되어 있는 경우 앱 데이터가 Apple 의 iCloud 백업에
              포함될 수 있습니다. 이는 운영체제의 기본 동작이며 본 앱이 별도로
              요청하는 것이 아닙니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            3. 접근하지 않는 정보
          </h2>
          <p>
            본 앱은 위치 정보, 연락처, 사진, 마이크, 카메라, 전화번호, 결제 정보,
            건강 정보에 접근하지 않습니다. 해당 권한을 요청하지도 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            4. 네트워크 통신과 제3자 서비스
          </h2>
          <p>
            본 앱은 서버와 통신하지 않습니다. 광고 SDK, 이용 통계 도구, 크래시 수집
            도구를 포함하지 않았으므로 제3자에게 전달되는 정보가 없습니다. 수집하는
            정보가 없으므로 제3자에게 판매할 정보도 없습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            5. 금전 거래
          </h2>
          <p>
            본 앱에 표시되는 용돈 금액은 이용자들이 직접 현금을 주고받기 위한 안내
            숫자입니다. 본 앱에는 결제·송금·환전 기능이 없으며, 금융 정보를 다루지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            6. 정보의 보관 및 파기
          </h2>
          <p>
            저장된 내용은 앱 안에서 직접 지울 수 있습니다. 앱을 삭제하면 기기에
            저장된 모든 내용이 함께 삭제되며, 외부에 보관된 사본이 없습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            7. 아동의 개인정보
          </h2>
          <p>
            본 앱은 온 가족이 함께 이용하는 앱이며, 연령과 무관하게 어떤 개인정보도
            수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            8. 방침의 변경
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
