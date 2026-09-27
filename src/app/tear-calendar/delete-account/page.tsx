import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "뜯어쓰는 달력 계정 및 데이터 삭제",
  description:
    "커플 일력 앱 뜯어쓰는 달력에서 계정과 관련 데이터를 삭제하는 방법, 삭제되는 데이터 항목과 처리 기간에 대한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/tear-calendar/delete-account",
  },
};

const UPDATED_AT = "2026년 9월 27일";
const CONTACT = "contact@joowonkoh.com";

const H2 = "mb-3 font-display text-xl font-semibold text-text-primary";

export default function TearCalendarDeleteAccountPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        뜯어쓰는 달력 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        뜯어쓰는 달력 계정 및 데이터 삭제
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        <section>
          <h2 className={H2}>1. 개요</h2>
          <p>
            본 페이지는 iOS 앱{" "}
            <strong className="text-text-primary">뜯어쓰는 달력</strong>의 이용자가
            계정과 관련된 데이터의 삭제를 요청하는 방법을 안내합니다. 뜯어쓰는
            달력은 개발자 고주원이 운영하며, 삭제 관련 문의는{" "}
            <a className="text-accent hover:underline" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>{" "}
            으로 연락 주시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>2. 이메일로 삭제 요청하기</h2>
          <p className="mb-3">
            현재는 앱 안에서 바로 탈퇴하는 기능 대신 이메일로 요청을 받고 있습니다.
          </p>
          <ol className="ml-5 list-decimal space-y-1.5">
            <li>
              <a className="text-accent hover:underline" href={`mailto:${CONTACT}`}>
                {CONTACT}
              </a>{" "}
              으로 &ldquo;뜯어쓰는 달력 계정 삭제 요청&rdquo;이라는 제목의 메일을
              보냅니다.
            </li>
            <li>
              본문에 로그인에 사용한 방식(Apple 또는 Google)과 그 계정의 이메일
              주소를 적어 주세요. Apple 의 &ldquo;나의 이메일 가리기&rdquo;를
              쓰셨다면 가려진 주소를 적어 주시면 됩니다.
            </li>
            <li>
              본인 확인 후 <strong className="text-text-primary">7일 이내</strong>에
              계정과 관련 데이터를 삭제하고 처리 결과를 회신드립니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className={H2}>3. 삭제되는 데이터</h2>
          <p className="mb-3">
            계정 삭제 시 다음 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>계정 정보(계정 식별자, 이메일 주소)</li>
            <li>이용자가 꾸민 모든 페이지</li>
            <li>이용자가 페이지를 뜯은 기록</li>
            <li>커플 연결 정보와 초대 코드</li>
            <li>기기 푸시 토큰</li>
          </ul>
          <p className="mt-3">
            상대가 꾸민 페이지는 상대가 만든 내용이므로 상대의 계정에 남습니다.
            계정이 삭제되면 두 사람의 연결은 끊어집니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>4. 로그인하지 않고 쓴 경우</h2>
          <p>
            로그인하지 않고 혼자 쓴 내용은 기기 안에만 저장되어 있고 서버에는 아무
            것도 없습니다. 앱을 삭제하면 기기에 저장된 페이지와 설정이 함께
            삭제됩니다. 페이지에 붙인 사진도 현재 기기 안에만 저장됩니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>5. 보관되는 데이터 및 기간</h2>
          <p>
            뜯어쓰는 달력은 계정 삭제 후 별도로 보관하는 개인정보가 없습니다. 다만
            관련 법령에서 일정 기간 보존을 요구하는 경우에는 해당 법령이 정한 기간
            동안만 보관 후 파기합니다. 자세한 내용은{" "}
            <Link className="text-accent hover:underline" href="/tear-calendar/privacy">
              개인정보처리방침
            </Link>
            을 참고해 주시기 바랍니다.
          </p>
        </section>
      </div>
    </div>
  );
}
