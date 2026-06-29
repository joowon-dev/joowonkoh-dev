import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JIGUMIA 계정 및 데이터 삭제",
  description:
    "모바일 앱 JIGUMIA(지구미아)에서 계정과 관련 데이터를 삭제하는 방법, 삭제되는 데이터 항목 및 보관 기간에 대한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/jigumia/delete-account",
  },
};

const UPDATED_AT = "2026년 6월 29일";
const CONTACT = "jigumia0226@gmail.com";

export default function JigumiaDeleteAccountPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        JIGUMIA · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        JIGUMIA 계정 및 데이터 삭제
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            1. 개요
          </h2>
          <p>
            본 페이지는 모바일 앱 <strong className="text-text-primary">JIGUMIA(지구미아)</strong>의
            이용자가 계정과 관련된 모든 데이터의 삭제를 요청하는 방법을 안내합니다.
            JIGUMIA는 개발자 고주원이 운영하며, 계정 삭제 관련 문의는{" "}
            <a className="text-accent hover:underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>{" "}
            으로 연락 주시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            2. 앱에서 직접 삭제하기 (권장)
          </h2>
          <p className="mb-3">
            JIGUMIA 앱에 로그인한 상태에서 아래 단계를 따르면 계정과 모든 데이터가 즉시
            영구적으로 삭제됩니다.
          </p>
          <ol className="ml-5 list-decimal space-y-1.5">
            <li>JIGUMIA 앱을 실행하고 로그인합니다.</li>
            <li>
              하단 탭에서 <strong className="text-text-primary">마이페이지</strong>로
              이동합니다.
            </li>
            <li>
              <strong className="text-text-primary">회원 탈퇴</strong> 메뉴를 선택합니다.
            </li>
            <li>안내에 따라 탈퇴를 확인하면 계정과 데이터가 즉시 삭제됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            3. 이메일로 삭제 요청하기
          </h2>
          <p>
            앱에 접근할 수 없는 경우, 가입에 사용한 이메일 주소로{" "}
            <a className="text-accent hover:underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>
            에 계정 삭제를 요청해 주세요. 본인 확인 후 영업일 기준 7일 이내에 계정과 관련
            데이터를 삭제하고 처리 결과를 회신드립니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            4. 삭제되는 데이터
          </h2>
          <p className="mb-3">
            계정 삭제 시 다음의 모든 데이터가 즉시 영구적으로 삭제되며 복구할 수 없습니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>계정 정보(이메일 주소, 고유 식별자, 이름)</li>
            <li>관심 브랜드 및 브랜드별 알림 설정</li>
            <li>기기 푸시 토큰</li>
            <li>앱 내 문의 내역</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            5. 보관되는 데이터 및 기간
          </h2>
          <p>
            JIGUMIA는 계정 삭제 후 별도로 보관하는 개인정보가 없으며, 위 데이터는 즉시
            삭제됩니다. 다만 관련 법령에서 일정 기간 보존을 요구하는 경우에는 해당 법령이
            정한 기간 동안만 보관 후 파기합니다. 자세한 내용은{" "}
            <a className="text-accent hover:underline" href="https://joowonkoh.com/jigumia/privacy">
              개인정보처리방침
            </a>
            을 참고해 주시기 바랍니다.
          </p>
        </section>
      </div>
    </div>
  );
}
