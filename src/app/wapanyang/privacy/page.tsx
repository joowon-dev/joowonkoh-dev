import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "와파냥 개인정보처리방침",
  description:
    "와이파이 진단 앱 와파냥이 기기에 저장하는 정보, 진단을 위해 접속하는 서버, 광고(Google AdMob)를 위해 처리되는 정보와 이용자의 선택권에 대한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/wapanyang/privacy",
  },
};

const UPDATED_AT = "2026년 10월 9일";
const CONTACT = "contact@joowonkoh.com";

const H2 = "mb-3 font-display text-xl font-semibold text-text-primary";
const STRONG = "text-text-primary";
const LINK = "text-accent hover:underline";

export default function WapanyangPrivacyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        와파냥 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        와파냥 개인정보처리방침
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] break-keep text-text-secondary">
        <section>
          <h2 className={H2}>1. 개요</h2>
          <p className="mb-3">
            와파냥(이하 &ldquo;본 앱&rdquo;)은 지금 연결된 와이파이의 속도와 보안 수준을
            진단하는 iOS·Android 애플리케이션입니다. 본 앱은 개발자 고주원이 개인으로
            만들어 운영하며, 본 방침은 본 앱이 처리하는 정보를 설명합니다.
          </p>
          <p className="mb-3">요약하면 다음과 같습니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className={STRONG}>
                본 앱에는 계정이 없고, 개발자가 운영하는 서버로 보내는 정보가 없습니다.
              </strong>{" "}
              진단 기록과 설정은 기기 안에만 저장됩니다.
            </li>
            <li>
              진단을 위해 공개 측정 서버(Cloudflare, Google 등)에 접속합니다. 이 서버들은
              접속한 기기의 IP 주소를 볼 수 있습니다(아래 3번).
            </li>
            <li>
              본 앱은 무료로 제공되며 <strong className={STRONG}>Google AdMob 광고</strong>를
              보여 줍니다. 광고를 위해 Google 이 광고 식별자 등 기기 정보를 처리합니다(아래
              5번).
            </li>
            <li>
              와이파이 이름을 읽으려고 위치 권한을 요청하지만,{" "}
              <strong className={STRONG}>위치 좌표는 읽거나 저장하거나 보내지 않습니다.</strong>
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
          <p className="mb-3">다음 정보는 이용자의 기기 내부 저장소에만 저장되며 개발자에게 전송되지 않습니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              진단 기록 — 진단 시각, 와이파이 이름(SSID), 보안 점검 결과와 점수, 다운로드·업로드
              속도, 핑·지터·패킷 손실, 공인 IP 주소, 통신사 이름, IPv6 지원 여부
            </li>
            <li>설정 값과 진단 횟수 — 전면 광고를 두 번에 한 번 보여 주기 위해 셉니다</li>
            <li>
              홈 화면 위젯에 보여 줄 마지막 진단 요약(와이파이 이름, 속도, 보안 등급) — 앱과
              위젯이 함께 쓰는 기기 내부 저장소에 둡니다
            </li>
          </ul>
          <p className="mt-3">
            기록은 기록 화면에서 하나씩, 설정 화면에서 한꺼번에 지울 수 있고, 앱을 삭제하면 모두 함께 삭제됩니다.
            기기에 백업이 설정되어 있으면 운영체제의 기본 동작에 따라 iCloud 또는 Google
            백업에 앱 데이터가 포함될 수 있습니다. 결과를 공유 카드로 내보낼 때는 공인 IP
            주소를 넣지 않으며, 공유는 이용자가 직접 고른 앱으로만 이루어집니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>3. 진단을 위해 접속하는 서버</h2>
          <p className="mb-3">
            진단은 실제로 인터넷에 접속해 보는 방식으로 이루어집니다. 본 앱은 다음 공개
            서버에 접속하며, 각 서버는 일반적인 인터넷 접속과 마찬가지로 기기의 IP 주소를 볼
            수 있습니다. 본 앱은 이 서버들에 와이파이 이름이나 진단 결과를 보내지 않습니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className={STRONG}>Cloudflare 속도 측정 서버</strong>(speed.cloudflare.com)
              — 다운로드·업로드·핑 측정, 공인 IP 와 통신사 이름 확인
            </li>
            <li>
              <strong className={STRONG}>로그인 페이지 확인 주소</strong>(cp.cloudflare.com,
              connectivitycheck.gstatic.com) — 공용 와이파이 로그인 페이지가 끼어드는지 확인
            </li>
            <li>
              <strong className={STRONG}>잘 알려진 HTTPS 사이트와 DNS 서버 주소</strong>(www.google.com, www.apple.com, www.cloudflare.com, www.microsoft.com, one.one.one.one, dns.google) — 인증서가
              바꿔치기되거나 주소가 엉뚱하게 풀리는지 확인
            </li>
            <li>
              <strong className={STRONG}>ipify</strong>(api6.ipify.org) — IPv6 로 접속되는지 확인
            </li>
          </ul>
          <p className="mt-3">
            모바일 데이터와 비교 기능을 쓰면 같은 Cloudflare 서버에 모바일 데이터로 한 번 더
            접속하며, 이때 요금제에 따라 데이터 요금이 들 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>4. 권한</h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className={STRONG}>위치(앱 사용 중)</strong> — iOS 와 Android 는 와이파이
              이름과 암호 방식을 읽을 때 위치 권한을 요구합니다. 본 앱은 위치 좌표를 읽지
              않으며, 허용하지 않아도 속도와 나머지 보안 항목은 진단합니다.
            </li>
            <li>
              <strong className={STRONG}>로컬 네트워크(iOS)</strong> — 같은 와이파이에 연결된 기기
              수를 세기 위해 같은 네트워크의 주소에 잠깐 접속해 봅니다. 기기 수만 세며,
              기기의 이름이나 주소는 저장하지 않습니다.
            </li>
            <li>
              <strong className={STRONG}>앱 추적(iOS)</strong> — 맞춤형 광고를 위한 허용 여부를 첫
              진단을 마친 뒤 한 번 묻습니다. 허용하지 않아도 모든 기능을 그대로 쓸 수
              있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className={H2}>5. 광고 (Google AdMob)</h2>
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
            ID 를 재설정하거나 삭제할 수 있습니다. 측정 결과가 흐트러지지 않도록 진단하는
            동안에는 광고를 불러오지 않습니다.
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
          <h2 className={H2}>6. 접근하지 않는 정보</h2>
          <p>
            본 앱은 연락처, 사진, 카메라, 마이크, 정밀 위치 좌표, 전화번호, 결제 정보, 건강
            정보에 접근하지 않습니다. 와이파이 비밀번호를 읽거나 저장하지 않으며, 다른
            기기의 통신 내용을 들여다보지 않습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>7. 정보의 보관 및 파기</h2>
          <p>
            기기에 저장된 내용은 기록 화면에서 지우거나 앱을 삭제하면 함께 삭제되며,
            개발자가 보관하는 사본은 없습니다. Google 이 광고를 위해 처리한 정보의 보관
            기간은 Google 의 정책을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>8. 아동의 개인정보</h2>
          <p>
            본 앱은 만 14세 미만 아동을 주된 대상으로 하지 않으며, 개발자는 아동을
            포함한 어떤 이용자의 개인정보도 직접 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>9. 방침의 변경</h2>
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
