import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meal Mate 개인정보처리방침",
  description:
    "모바일 앱 Meal Mate가 수집하는 정보, 사용 목적, 보관 및 파기, 이용자의 권리에 대한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/meal-mate/privacy",
  },
};

const UPDATED_AT = "2026년 5월 21일";
const CONTACT = "hello@joowonkoh.com";

export default function MealMatePrivacyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Meal Mate · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        Meal Mate 개인정보처리방침
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            1. 개요
          </h2>
          <p>
            Meal Mate(이하 &ldquo;본 앱&rdquo;)는 이용자가 다녀온 음식점을 좋음(O)
            또는 별로(X)로 기록하고 음식 카테고리와 한 줄 메모로 관리하는 모바일
            애플리케이션입니다. 본 앱은 개발자 고주원이 개인적으로 운영하며, 본
            방침은 본 앱이 수집하는 정보의 항목과 이용 목적, 보관 및 파기, 이용자의
            권리에 관한 사항을 설명합니다. 문의 사항은{" "}
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
              <strong className="text-text-primary">계정 정보</strong> — 회원가입 및
              로그인을 위한 이메일 주소. Google 또는 Apple 계정으로 로그인하는 경우
              해당 제공자로부터 이메일 주소와 고유 식별자를 전달받습니다.
            </li>
            <li>
              <strong className="text-text-primary">이용자가 입력한 콘텐츠</strong> —
              음식점 이름, 배달·지도 링크, 음식 카테고리, 평가(좋음/별로), 한 줄
              메모 등 이용자가 직접 등록한 기록.
            </li>
            <li>
              <strong className="text-text-primary">접속 기록</strong> — 서비스 이용
              통계(일간·월간 활성 이용자 집계)를 위한 로그인 일시.
            </li>
          </ul>
          <p className="mt-3">
            본 앱은 이름, 전화번호, 위치 정보, 연락처, 사진 등 위에 명시되지 않은
            개인정보를 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            3. 정보의 이용 목적
          </h2>
          <p className="mb-3">수집된 정보는 다음 목적으로만 사용됩니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>회원 식별 및 로그인 인증</li>
            <li>이용자가 등록한 음식점 기록의 저장·조회·수정·삭제 기능 제공</li>
            <li>서비스 이용 통계 집계 및 품질 개선</li>
          </ul>
          <p className="mt-3">
            본 앱은 수집한 정보를 광고 목적으로 사용하지 않으며, 이용자 추적을 위한
            제3자 광고 식별자를 사용하지 않습니다.
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
              데이터베이스 호스팅. 이용자의 계정 정보와 등록한 콘텐츠가 Supabase
              인프라에 안전하게 저장됩니다.
            </li>
            <li>
              <strong className="text-text-primary">Google</strong> — 소셜 로그인을
              선택한 경우 본인 인증에 사용됩니다.
            </li>
            <li>
              <strong className="text-text-primary">Apple</strong> — 소셜 로그인을
              선택한 경우 본인 인증에 사용됩니다.
            </li>
          </ul>
          <p className="mt-3">
            본 앱은 위 목적 외에 이용자의 개인정보를 제3자에게 판매하거나 별도로
            제공하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            5. 정보의 보관 및 파기
          </h2>
          <p>
            이용자의 정보는 회원 자격이 유지되는 동안 보관됩니다. 이용자가 앱 내{" "}
            <strong className="text-text-primary">내 정보 &gt; 회원탈퇴</strong>{" "}
            메뉴를 통해 탈퇴하면 계정 정보, 등록한 모든 음식점 기록, 접속 기록을
            포함한 이용자의 모든 데이터가 즉시 영구적으로 삭제되며 복구할 수
            없습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            6. 이용자의 권리
          </h2>
          <p>
            이용자는 앱 내에서 언제든지 본인이 등록한 음식점 기록을 조회·수정·삭제할
            수 있으며, 회원탈퇴를 통해 계정과 관련된 모든 정보의 삭제를 직접 요청할
            수 있습니다. 추가적인 권리 행사나 문의는 위 운영자 이메일로 요청해 주시기
            바랍니다.
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
