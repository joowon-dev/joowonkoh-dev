import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JIGUMIA 개인정보처리방침",
  description:
    "모바일 앱 JIGUMIA(지구미아)가 수집하는 정보, 사용 목적, 보관 및 파기, 이용자의 권리에 대한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/jigumia/privacy",
  },
};

const UPDATED_AT = "2026년 6월 29일";
const CONTACT = "jigumia0226@gmail.com";

export default function JigumiaPrivacyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        JIGUMIA · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        JIGUMIA 개인정보처리방침
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            1. 개요
          </h2>
          <p>
            JIGUMIA(지구미아, 이하 &ldquo;본 앱&rdquo;)는 여러 브랜드의 세일 일정을
            캘린더 형태로 모아 보고, 관심 브랜드의 세일을 알림으로 받아볼 수 있는
            모바일 애플리케이션입니다. 본 앱은 JIGUMIA가 운영하며,
            본 방침은 본 앱이 수집하는 정보의 항목과 이용 목적, 보관 및 파기,
            이용자의 권리에 관한 사항을 설명합니다. 문의 사항은{" "}
            <a className="text-accent hover:underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>{" "}
            으로 연락 부탁드립니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            2. 수집하는 정보의 항목
          </h2>
          <p className="mb-3">본 앱은 다음 정보를 수집합니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">계정 정보</strong> — 로그인을 위한
              이메일 주소와 고유 식별자. Google 또는 Apple 계정으로 로그인할 때 해당
              제공자로부터 전달받으며, Apple 로그인 시 이용자가 동의한 경우 이름이
              포함될 수 있습니다.
            </li>
            <li>
              <strong className="text-text-primary">기기 푸시 토큰</strong> — 세일 알림
              발송을 위한 푸시 토큰과 기기 플랫폼(iOS/Android) 정보. 알림을 사용하는
              경우에만 저장됩니다.
            </li>
            <li>
              <strong className="text-text-primary">이용자 설정</strong> — 이용자가
              선택한 관심 브랜드와 브랜드별 알림 설정(세일 시작 전·종료 전 알림 등).
            </li>
            <li>
              <strong className="text-text-primary">문의 내역</strong> — 앱 내 문의하기
              기능을 이용한 경우 이메일 주소, 문의 제목 및 내용.
            </li>
            <li>
              <strong className="text-text-primary">광고 식별자 및 기기 정보</strong> —
              앱 내 광고 제공을 위해 Google AdMob이 광고 식별자(Google 광고 ID,
              iOS 광고 식별자(IDFA))와 기기 종류·운영체제·대략적 지역·IP 주소 등을
              수집할 수 있습니다.
            </li>
          </ul>
          <p className="mt-3">
            본 앱은 위치 정보, 연락처, 사진, 전화번호, 결제 정보 등 위에 명시되지
            않은 개인정보를 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            3. 정보의 이용 목적
          </h2>
          <p className="mb-3">수집된 정보는 다음 목적으로만 사용됩니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>회원 식별 및 로그인 인증</li>
            <li>관심 브랜드 및 알림 설정의 저장·조회·동기화</li>
            <li>이용자가 설정한 브랜드 세일에 대한 푸시 알림 발송</li>
            <li>문의 접수 및 답변 제공</li>
            <li>서비스 이용 통계 집계 및 품질 개선</li>
            <li>앱 내 광고 제공</li>
          </ul>
          <p className="mt-3">
            본 앱은 Google AdMob을 통해 앱 내에 광고를 게재합니다. 본 앱은 이용자
            맞춤형 광고를 위한 추적을 사용하지 않으며, 비맞춤형(non-personalized)
            광고만을 요청합니다. 다만 광고 제공 과정에서 Google AdMob이 광고
            식별자와 기기 정보를 수집할 수 있으며, 자세한 내용은 아래 4. 제3자
            서비스 항목을 참고해 주시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            4. 제3자 서비스 및 처리 위탁
          </h2>
          <p className="mb-3">
            본 앱은 서비스 운영을 위해 다음 제3자 서비스를 이용하며, 각 제공자는
            자체 정책에 따라 정보를 처리합니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">Supabase</strong> — 계정 인증 및
              데이터베이스 호스팅. 이용자의 계정 정보, 관심 브랜드·알림 설정, 푸시
              토큰, 문의 내역이 Supabase 인프라에 안전하게 저장됩니다.
            </li>
            <li>
              <strong className="text-text-primary">Google</strong> — 소셜 로그인을
              선택한 경우 본인 인증에 사용됩니다.
            </li>
            <li>
              <strong className="text-text-primary">Apple</strong> — 소셜 로그인을
              선택한 경우 본인 인증에 사용됩니다.
            </li>
            <li>
              <strong className="text-text-primary">Expo Notifications</strong> — 푸시
              알림 전송을 위해 사용되며, Apple(APNs) 및 Google(FCM)의 푸시 인프라를
              경유해 기기로 알림이 전달됩니다.
            </li>
            <li>
              <strong className="text-text-primary">Google AdMob</strong> — 앱 내 광고
              게재 및 광고 성과 측정에 사용됩니다. 광고 제공 과정에서 광고 식별자,
              기기 정보, IP 주소 등이 수집·처리될 수 있으며, 처리 방식은 Google의{" "}
              <a
                className="text-accent hover:underline"
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
              >
                파트너 사이트에서의 데이터 사용 방침
              </a>
              을 따릅니다.
            </li>
          </ul>
          <p className="mt-3">
            본 앱은 위 목적 외에 이용자의 개인정보를 제3자에게 판매하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            5. 정보의 보관 및 파기
          </h2>
          <p>
            이용자의 정보는 회원 자격이 유지되는 동안 보관됩니다. 이용자가 앱 내{" "}
            <strong className="text-text-primary">마이페이지 &gt; 회원 탈퇴</strong>{" "}
            메뉴를 통해 탈퇴하면 계정 정보, 관심 브랜드, 알림 설정, 푸시 토큰, 문의
            내역을 포함한 이용자의 모든 데이터가 즉시 영구적으로 삭제되며 복구할 수
            없습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            6. 이용자의 권리
          </h2>
          <p>
            이용자는 앱 내에서 언제든지 관심 브랜드와 알림 설정을 변경하거나 푸시
            알림 수신을 중단할 수 있으며, 회원 탈퇴를 통해 계정과 관련된 모든 정보의
            삭제를 직접 요청할 수 있습니다. 추가적인 권리 행사나 문의는 위 운영자
            이메일로 요청해 주시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            7. 아동의 개인정보
          </h2>
          <p>
            본 앱은 만 14세 미만 아동을 대상으로 하지 않으며, 아동의 개인정보를
            고의로 수집하지 않습니다. 아동의 정보가 수집된 사실이 확인될 경우 해당
            정보는 즉시 삭제됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            8. 방침의 변경
          </h2>
          <p>
            본 개인정보처리방침은 법령 및 서비스 변경 사항을 반영하기 위해 수정될 수
            있습니다. 변경 시에는 본 페이지의 &ldquo;최종 업데이트&rdquo; 일자가 함께
            갱신됩니다.
          </p>
        </section>
      </div>
    </div>
  );
}
