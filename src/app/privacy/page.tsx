import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "joowonkoh.com이 수집하는 정보, 사용 목적, 쿠키 및 광고 정책에 대한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/privacy",
  },
};

const UPDATED_AT = "2026년 4월 13일";

export default function PrivacyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        개인정보처리방침
      </h1>
      <p className="mt-3 text-sm text-text-muted">최종 업데이트: {UPDATED_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            1. 운영자 정보
          </h2>
          <p>
            본 사이트(이하 &ldquo;joowonkoh.com&rdquo;)는 개발자 고주원이 개인적으로
            운영하는 블로그입니다. 본 방침은 사이트가 수집하는 정보의 종류와 사용
            목적, 보관 및 제3자 제공에 관한 사항을 설명합니다. 문의 사항이 있을
            경우 <a className="text-accent hover:underline" href="mailto:joowonkoh0505@gmail.com">joowonkoh0505@gmail.com</a>{" "}
            으로 연락 부탁드립니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            2. 수집하는 정보의 항목
          </h2>
          <p className="mb-3">
            joowonkoh.com은 회원가입·로그인 기능을 제공하지 않으며, 방문자로부터
            이름·이메일·전화번호 등 개인 식별 정보를 직접 수집하지 않습니다. 다만
            서비스 운영과 분석을 위해 다음과 같은 정보가 자동으로 수집될 수
            있습니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>접속 IP 주소, 브라우저 종류 및 운영체제</li>
            <li>방문 일시, 머문 시간, 방문 페이지 및 이동 경로</li>
            <li>리퍼러(referrer) 정보 및 검색어</li>
            <li>쿠키(cookie) 및 유사 식별자</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            3. 정보의 이용 목적
          </h2>
          <p className="mb-3">수집된 정보는 다음 목적으로만 사용됩니다.</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>사이트 트래픽 및 사용자 행태 분석</li>
            <li>콘텐츠 품질 개선 및 UX 최적화</li>
            <li>맞춤형 광고 노출 및 성과 측정</li>
            <li>비정상 접근 및 어뷰징 탐지</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            4. 쿠키(Cookies)에 관한 사항
          </h2>
          <p>
            joowonkoh.com은 사용자 경험 향상과 통계 분석을 위해 쿠키를 사용합니다.
            쿠키는 웹사이트 서버가 사용자의 브라우저에 보내는 작은 텍스트 파일로,
            이용자의 컴퓨터 하드디스크에 저장됩니다. 이용자는 브라우저 설정을 통해
            쿠키 저장을 거부하거나 삭제할 수 있으며, 거부 시 일부 기능 이용에
            제한이 있을 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            5. 광고 및 제3자 서비스
          </h2>
          <p className="mb-3">
            본 사이트는 다음과 같은 제3자 서비스를 이용하며, 각 서비스 제공자는
            자체 정책에 따라 정보를 수집·처리할 수 있습니다.
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <strong className="text-text-primary">Google AdSense</strong> — Google 및
              협력사는 쿠키를 사용하여 본 사이트와 다른 사이트에서의 이전 방문
              기록을 기반으로 사용자에게 광고를 게재합니다. 사용자는{" "}
              <a
                className="text-accent hover:underline"
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 광고 설정
              </a>
              에서 맞춤 광고를 거부할 수 있습니다.
            </li>
            <li>
              <strong className="text-text-primary">Google Analytics / Tag Manager</strong>{" "}
              — 트래픽 통계 및 사이트 사용 분석을 위해 사용됩니다. 자세한 내용은{" "}
              <a
                className="text-accent hover:underline"
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 파트너 사이트 정책
              </a>
              을 참조해 주세요.
            </li>
            <li>
              <strong className="text-text-primary">Cloudflare Pages</strong> — 호스팅
              및 CDN 제공을 위해 사용되며, 보안과 성능 향상을 위해 일부 접속
              로그가 처리될 수 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            6. 정보의 보관 및 파기
          </h2>
          <p>
            본 사이트는 직접 수집한 개인정보가 없으므로 별도의 보관 데이터베이스를
            운영하지 않습니다. 분석 도구를 통해 수집된 통계 데이터는 각 서비스
            제공자의 정책에 따라 보관되며, 본 사이트는 이를 식별 가능한 형태로
            저장하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            7. 이용자의 권리
          </h2>
          <p>
            이용자는 언제든지 본인의 브라우저 설정을 통해 쿠키 사용을 거부할 수
            있으며, 위에서 안내한 Google 광고 설정 페이지를 통해 맞춤 광고를
            중단할 수 있습니다. 추가적인 권리 행사나 문의는 위 운영자 이메일로
            요청해 주시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            8. 방침의 변경
          </h2>
          <p>
            본 개인정보처리방침은 법령 및 서비스 변경 사항을 반영하기 위해 사전
            공지 없이 수정될 수 있습니다. 변경 시에는 본 페이지의 &ldquo;최종
            업데이트&rdquo; 일자가 함께 갱신됩니다.
          </p>
        </section>
      </div>
    </div>
  );
}
