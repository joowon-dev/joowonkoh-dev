import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "뜯어쓰는 달력 개인정보처리방침",
  description:
    "커플 일력 앱 뜯어쓰는 달력이 처리하는 정보, 이용 목적, 보관 및 파기, 이용자의 권리에 대한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/tear-calendar/privacy",
  },
};

const UPDATED_AT = "2026년 9월 27일";
const CONTACT = "contact@joowonkoh.com";

const H2 = "mb-3 font-display text-xl font-semibold text-text-primary";
const STRONG = "text-text-primary";

export default function TearCalendarPrivacyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        뜯어쓰는 달력 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        뜯어쓰는 달력 개인정보처리방침
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        <section>
          <h2 className={H2}>1. 개요</h2>
          <p className="mb-3">
            뜯어쓰는 달력(이하 &ldquo;본 앱&rdquo;)은 두 사람이 서로를 위해 하루치
            페이지를 꾸미고, 상대가 꾸민 페이지를 일력처럼 뜯어서 보는 iOS
            애플리케이션입니다. 본 앱은 개발자 고주원이 개인으로 만들어 운영하며,
            본 방침은 본 앱이 처리하는 정보의 항목과 목적, 보관 및 파기, 이용자의
            권리를 설명합니다.
          </p>
          <p className="mb-3">요약하면 다음과 같습니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className={STRONG}>
                로그인하지 않고 쓰면 모든 내용이 기기 안에만 저장되고, 개발자에게
                전송되지 않습니다.
              </strong>
            </li>
            <li>
              상대와 연결하려고 Apple 또는 Google 로 로그인하면, 두 사람이 주고받는
              페이지와 연결 정보가 Supabase 에 보관됩니다. 연결된 두 사람 말고는 볼
              수 없도록 접근 규칙을 걸어 두었습니다.
            </li>
            <li>
              본 앱에는 광고와 이용 통계(분석) 도구가 없으며, 이용자의 정보를 판매하지
              않습니다.
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
          <h2 className={H2}>2. 처리하는 정보의 항목</h2>
          <p className="mb-3">
            상대와 연결하기 위해 로그인한 경우에 한해 다음 정보를 처리합니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className={STRONG}>계정 정보</strong> — Apple 또는 Google 로
              로그인할 때 해당 제공자로부터 받는 계정 식별자와 이메일 주소. Apple 의
              &ldquo;나의 이메일 가리기&rdquo;를 쓰시면 가려진 주소를 받습니다.
            </li>
            <li>
              <strong className={STRONG}>두 사람이 만든 내용</strong> — 꾸민
              페이지(글, 스티커, 사진을 붙인 위치 등 페이지 구성), 페이지를 뜯은
              날짜와 시각, 사귀기 시작한 날, 직접 등록한 기념일.
            </li>
            <li>
              <strong className={STRONG}>연결 정보</strong> — 누구와 커플로 이어져
              있는지, 연결에 쓰는 초대 코드.
            </li>
            <li>
              <strong className={STRONG}>기기 푸시 토큰</strong> — 상대에게 알림을
              보내기 위한 토큰. 알림을 허용한 경우에만 저장됩니다.
            </li>
          </ul>
          <p className="mt-3">
            <strong className={STRONG}>사진 파일은 현재 기기 안에만 저장됩니다.</strong>{" "}
            페이지에 붙인 사진은 서버로 올라가지 않습니다. 사진을 서버에 올려 상대
            기기에서도 보이게 하는 기능이 추가되면, 그 기능이 담긴 버전을 배포하기
            전에 본 방침을 먼저 갱신합니다.
          </p>
          <p className="mt-3">
            사진 보관함은 이용자가 페이지에 사진을 붙이려고 고를 때에만 접근하며,
            알림 권한은 알림을 받기 위해서만 요청합니다. 본 앱은 위치 정보, 연락처,
            전화번호, 결제 정보, 건강 정보에 접근하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>3. 로그인하지 않고 쓰는 경우</h2>
          <p>
            본 앱은 로그인 없이도 꾸미기, 뜯기, 지난 날 보기 등 모든 기능을 혼자
            써 볼 수 있습니다. 이때 만든 페이지와 설정은 이용자의 기기 안에만
            저장되며 어디에도 전송되지 않습니다. 로그인 전에 혼자 꾸민 페이지는
            로그인하더라도 서버로 옮겨지지 않습니다. 기기에 백업이 설정되어 있으면
            Apple 의 iCloud 백업에 앱 데이터가 포함될 수 있으며, 이는 운영체제의
            기본 동작입니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>4. 정보의 이용 목적</h2>
          <p className="mb-3">처리하는 정보는 다음 목적으로만 사용합니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>이용자 식별 및 로그인 인증</li>
            <li>초대 코드를 통한 두 사람의 연결</li>
            <li>두 사람이 꾸민 페이지를 서로에게 보여 주는 것</li>
            <li>
              상대가 페이지를 뜯거나 꾸몄을 때 알림을 보내는 것 (같은 종류는 6시간에
              한 번까지, 밤 10시부터 아침 8시까지는 보내지 않습니다)
            </li>
            <li>디데이와 기념일 계산</li>
          </ul>
          <p className="mt-3">광고, 분석, 판매 목적으로는 사용하지 않습니다.</p>
        </section>

        <section>
          <h2 className={H2}>5. 제3자 서비스 및 처리 위탁</h2>
          <p className="mb-3">
            본 앱은 서비스 운영을 위해 다음 제3자 서비스를 이용하며, 각 제공자는
            자체 정책에 따라 정보를 처리합니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className={STRONG}>Supabase</strong> — 계정 인증 및
              데이터베이스 호스팅. 위 2번의 정보가 Supabase 인프라에 보관됩니다.
            </li>
            <li>
              <strong className={STRONG}>Apple</strong> · <strong className={STRONG}>Google</strong>{" "}
              — 이용자가 선택한 로그인 방식의 본인 인증에 사용됩니다.
            </li>
            <li>
              <strong className={STRONG}>Expo 푸시 알림 · Apple 푸시 알림 서비스(APNs)</strong>{" "}
              — 상대 기기로 알림을 전달하는 데 사용됩니다.
            </li>
          </ul>
          <p className="mt-3">
            본 앱은 이용자의 정보를 제3자에게 판매하거나 광고 목적으로 제공하지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>6. 정보의 보관 및 파기</h2>
          <p className="mb-3">
            처리하는 정보는 이용자가 계정 삭제를 요청할 때까지 보관합니다. 삭제를
            요청하시면 확인 후 7일 이내에 다음 정보를 파기합니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>계정 정보와 기기 푸시 토큰</li>
            <li>이용자가 꾸민 페이지와 뜯은 기록</li>
            <li>커플 연결 정보</li>
          </ul>
          <p className="mt-3">
            상대가 꾸민 페이지는 상대가 만든 내용이므로 상대의 계정에 남습니다.
            로그인하지 않고 쓴 내용은 기기에만 있으므로 앱을 삭제하면 함께
            사라집니다. 자세한 절차는{" "}
            <Link className="text-accent hover:underline" href="/tear-calendar/delete-account">
              계정 및 데이터 삭제
            </Link>{" "}
            페이지를 참고해 주세요.
          </p>
        </section>

        <section>
          <h2 className={H2}>7. 이용자의 권리</h2>
          <p>
            이용자는 언제든지 자신의 정보에 대한 열람, 정정, 삭제, 처리 정지를
            요청할 수 있습니다. 위 이메일 주소로 로그인에 사용한 계정과 함께 요청해
            주시면 지체 없이 처리합니다. 알림은 iOS 설정에서 언제든지 끌 수
            있습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>8. 아동의 개인정보</h2>
          <p>
            본 앱은 만 14세 미만 아동을 대상으로 하지 않으며, 만 14세 미만 아동의
            개인정보를 알면서 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className={H2}>9. 방침의 변경</h2>
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
