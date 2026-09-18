import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "네밥내밥 계정 삭제",
  description:
    "네밥내밥 계정과 올린 사진·끼니 기록을 지우는 방법입니다. 앱 안에서 바로 지울 수 있고, 앱이 없으면 메일로 요청할 수 있습니다.",
  alternates: {
    canonical: "https://joowonkoh.com/yourmealmymeal/delete-account",
  },
};

const UPDATED_AT = "2026년 9월 18일";
const CONTACT = "contact@joowonkoh.com";

export default function YourMealMyMealDeleteAccountPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        네밥내밥 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        네밥내밥 계정 삭제
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            앱에서 바로 지우기
          </h2>
          <p className="mb-3">
            가장 빠른 방법입니다. 요청을 기다릴 필요 없이 그 자리에서 지워집니다.
          </p>
          <ol className="ml-5 list-decimal space-y-1.5">
            <li>네밥내밥을 열고 화면 아래 <strong className="text-text-primary">내정보</strong> 탭을 누릅니다.</li>
            <li><strong className="text-text-primary">계정 삭제</strong>를 누릅니다.</li>
            <li>
              확인을 위해 <strong className="text-text-primary">삭제</strong>라고 입력하면 버튼이
              활성화됩니다.
            </li>
          </ol>
          <p className="mt-3">
            모임에 속해 있지 않아도 내정보 탭은 항상 보입니다. 앱을 처음 켜서 로그인만 한
            상태에서도 지울 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            앱이 없을 때
          </h2>
          <p className="mb-3">
            기기를 바꿨거나 앱을 이미 지우셨다면 메일로 요청해 주세요. 가입에 사용한
            이메일 주소로 보내주셔야 본인 확인이 됩니다.
          </p>
          <p className="mb-3">
            받는 곳:{" "}
            <a
              className="font-medium text-accent underline underline-offset-4"
              href={`mailto:${CONTACT}?subject=${encodeURIComponent("[네밥내밥] 계정 삭제 요청")}`}
            >
              {CONTACT}
            </a>
          </p>
          <p>영업일 기준 7일 안에 처리하고 결과를 회신드립니다.</p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            무엇이 지워지나
          </h2>
          <p className="mb-3">
            아래 항목이 <strong className="text-text-primary">즉시, 되돌릴 수 없게</strong>{" "}
            삭제됩니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>계정과 로그인 정보(이메일 주소, 계정 식별자)</li>
            <li>표시 이름</li>
            <li>올린 끼니 사진 파일 전부</li>
            <li>끼니 기록과 날짜</li>
            <li>다른 사람의 끼니에 남긴 반응</li>
            <li>모임 멤버십</li>
            <li>알림을 받기 위해 저장했던 기기 푸시 토큰</li>
          </ul>
          <p className="mt-3">
            내가 만든 모임은 사라지지 않습니다. 남아 있는 사람 중 가장 오래 있던 사람에게
            넘어가고, 아무도 남지 않았으면 모임도 함께 사라집니다. 남의 기록까지 같이
            지워지는 일은 없습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            얼마나 남나
          </h2>
          <p>
            보관 기간은 따로 없습니다. 삭제를 누른 시점에 지웁니다. 백업 매체에 남은
            사본은 백업 주기에 따라 최대 30일 안에 함께 사라집니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            함께 보기
          </h2>
          <p>
            어떤 정보를 왜 모으는지는{" "}
            <Link
              className="font-medium text-accent underline underline-offset-4"
              href="/yourmealmymeal/privacy"
            >
              개인정보처리방침
            </Link>
            에 적어 두었습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
