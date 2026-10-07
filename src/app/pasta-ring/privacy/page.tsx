import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "파스타 한 줌 개인정보처리방침",
  description:
    "파스타 계량·타이머 앱 파스타 한 줌이 기기에 저장하는 정보와 광고(Google AdMob)를 위해 처리되는 정보, 이용자의 선택권에 대한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/pasta-ring/privacy",
  },
};

const UPDATED_AT = "2026년 10월 7일";
const CONTACT = "contact@joowonkoh.com";

const H2 = "mb-3 font-display text-xl font-semibold text-text-primary";
const STRONG = "text-text-primary";
const LINK = "text-accent hover:underline";

export default function PastaRingPrivacyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        파스타 한 줌 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        파스타 한 줌 개인정보처리방침
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] break-keep text-text-secondary">
        <section>
          <h2 className={H2}>1. 개요</h2>
          <p className="mb-3">
            파스타 한 줌(이하 &ldquo;본 앱&rdquo;)은 화면에 그린 원으로 마른 파스타의
            양을 재고, 면에 맞는 삶는 시간을 타이머로 알려 주는 iOS·Android
            애플리케이션입니다. 본 앱은 개발자 고주원이 개인으로 만들어 운영하며, 본
            방침은 본 앱이 처리하는 정보를 설명합니다.
          </p>
          <p className="mb-3">요약하면 다음과 같습니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className={STRONG}>
                본 앱에는 계정이 없고, 개발자가 운영하는 서버로 보내는 정보가 없습니다.
              </strong>{" "}
              고른 면, 즐겨찾기, 설정, 타이머는 기기 안에만 저장됩니다.
            </li>
            <li>
              본 앱은 무료로 제공되며 <strong className={STRONG}>Google AdMob 광고</strong>를
              보여 줍니다. 광고를 위해 Google 이 광고 식별자 등 기기 정보를 처리합니다(아래
              4번).
            </li>
            <li>
              iOS 에서는 앱 추적 허용 여부를 처음 면을 고를 때 한 번 묻습니다. 허용하지
              않아도 모든 기능을 그대로 쓸 수 있습니다.
            </li>
          </ul>
          <p className="mt-3">
            문의 사항은{" "}
            <a className={LINK} href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>{" "}
            으로 연락 부탁드립니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>2. 기기 안에만 저장하는 정보</h2>
          <p className="mb-3">다음 정보는 이용자의 기기 내부 저장소에만 저장되며 어디에도 전송되지 않습니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>마지막으로 고른 면, 즐겨찾기한 면 목록</li>
            <li>1인분 기준 무게 설정</li>
            <li>진행 중인 타이머(끝나는 시각, 고른 익힘 정도)</li>
            <li>면을 고른 횟수 — 전면 광고를 두 번에 한 번 보여 주기 위해 셉니다</li>
          </ul>
          <p className="mt-3">
            기기에 백업이 설정되어 있으면 운영체제의 기본 동작에 따라 iCloud 또는 Google
            백업에 앱 데이터가 포함될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>3. 화면 정보와 알림</h2>
          <p className="mb-3">
            원을 실제 크기로 그리기 위해 기기의 모델명과 화면 해상도·밀도를 읽습니다. 이
            정보는 기기 안에서 계산에만 쓰이고 저장하거나 전송하지 않습니다.
          </p>
          <p>
            삶기가 끝났음을 알리기 위해 알림 권한을 요청합니다. 알림은 기기 안에서
            예약되는 로컬 알림이며, 푸시 서버를 거치지 않습니다. 알림은 기기 설정에서
            언제든지 끌 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>4. 광고 (Google AdMob)</h2>
          <p className="mb-3">
            본 앱은 Google LLC 의 광고 서비스인 AdMob 으로 배너 광고와 전면 광고를
            보여 줍니다. 광고를 보여 주고, 광고 성과를 측정하고, 부정 클릭을 막기 위해
            Google 이 다음 정보를 수집·처리할 수 있습니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className={STRONG}>광고 식별자</strong> — iOS 의 IDFA(앱 추적을
              허용한 경우에만), Android 의 광고 ID
            </li>
            <li>IP 주소와 이를 바탕으로 추정한 대략적인 위치(국가·도시 수준)</li>
            <li>기기 종류, 운영체제 버전, 언어 등 기기 정보</li>
            <li>광고를 본 기록과 누른 기록, 앱의 오류·성능 진단 정보</li>
          </ul>
          <p className="mt-3">
            <strong className={STRONG}>iOS 에서 앱 추적을 허용하지 않으면</strong> 본 앱은
            맞춤형 광고를 요청하지 않고 비맞춤형 광고만 요청합니다. 허용 여부는
            iPhone 의 설정 › 개인정보 보호 및 보안 › 추적에서 언제든지 바꿀 수
            있습니다. Android 에서는 설정 › 개인정보 보호(또는 Google) › 광고에서 광고
            ID 를 재설정하거나 삭제할 수 있습니다.
          </p>
          <p className="mt-3">
            Google 이 정보를 처리하는 방식은{" "}
            <a
              className={LINK}
              href="https://policies.google.com/technologies/partner-sites?hl=ko"
              target="_blank"
              rel="noreferrer"
            >
              Google 파트너 사이트·앱에서의 데이터 사용
            </a>{" "}
            과{" "}
            <a className={LINK} href="https://policies.google.com/privacy?hl=ko" target="_blank" rel="noreferrer">
              Google 개인정보처리방침
            </a>
            에서 확인할 수 있습니다. 개발자는 Google 로부터 광고 노출·수익 통계만 받으며,
            이용자 개인을 알아볼 수 있는 정보는 받지 않습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>5. 접근하지 않는 정보</h2>
          <p>
            본 앱은 연락처, 사진, 카메라, 마이크, 정밀 위치, 전화번호, 결제 정보, 건강
            정보에 접근하지 않으며 해당 권한을 요청하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>6. 정보의 보관 및 파기</h2>
          <p>
            기기에 저장된 내용은 앱을 삭제하면 모두 함께 삭제되며, 개발자가 보관하는
            사본은 없습니다. Google 이 광고를 위해 처리한 정보의 보관 기간은 Google 의
            정책을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>7. 아동의 개인정보</h2>
          <p>
            본 앱은 만 14세 미만 아동을 주된 대상으로 하지 않으며, 개발자는 아동을
            포함한 어떤 이용자의 개인정보도 직접 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>8. 방침의 변경</h2>
          <p>
            본 방침은 법령이나 서비스 변경 사항을 반영하기 위해 수정될 수 있습니다.
            처리 항목에 변화가 생기는 경우 해당 기능이 포함된 버전이 배포되기 전에 본
            방침을 먼저 갱신하고 &ldquo;최종 업데이트&rdquo; 일자를 함께 수정합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
