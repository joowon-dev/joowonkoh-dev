import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JIGUMIA 이용약관",
  description:
    "모바일 앱 JIGUMIA(지구미아) 서비스의 이용 조건 및 절차, 회사와 회원 간의 권리·의무 및 책임사항에 관한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/jigumia/terms",
  },
};

const EFFECTIVE_AT = "2025년 4월 1일";

const ARTICLES: { title: string; body: string }[] = [
  {
    title: "제1조 (목적)",
    body: '본 약관은 JIGUMIA(이하 "회사")가 제공하는 브랜드 할인 캘린더 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.',
  },
  {
    title: "제2조 (정의)",
    body: `1. "서비스"란 회사가 제공하는 브랜드 세일 일정 조회, 관심 브랜드 저장, 알림 기능 등을 말합니다.
2. "회원"이란 본 약관에 동의하고 서비스에 가입한 자를 말합니다.
3. "콘텐츠"란 서비스에서 제공하는 세일 정보, 브랜드 정보 등 일체의 정보를 말합니다.`,
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    body: `1. 본 약관은 서비스 화면에 게시하거나 기타 방법으로 회원에게 공지함으로써 효력이 발생합니다.
2. 회사는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자 및 변경사유를 명시하여 7일 전에 공지합니다.
3. 변경된 약관에 동의하지 않는 회원은 서비스 이용을 중단하고 탈퇴할 수 있습니다.`,
  },
  {
    title: "제4조 (서비스 이용 계약)",
    body: `1. 이용 계약은 회원이 본 약관에 동의하고 Google 또는 Apple 계정을 통해 로그인함으로써 성립됩니다.
2. 회사는 다음 각 호에 해당하는 경우 이용 신청을 거절할 수 있습니다.
  - 타인의 정보를 이용한 경우
  - 서비스 운영을 고의로 방해한 이력이 있는 경우`,
  },
  {
    title: "제5조 (서비스의 제공 및 변경)",
    body: `1. 회사는 다음의 서비스를 제공합니다.
  - 브랜드별 세일 일정 캘린더 조회
  - 관심 브랜드 즐겨찾기
  - 세일 시작/종료 알림
  - 브랜드 탐색 및 검색
2. 서비스 내용은 회사 사정에 따라 변경될 수 있으며, 변경 시 사전 공지합니다.`,
  },
  {
    title: "제6조 (서비스의 중단)",
    body: `1. 회사는 다음 각 호에 해당하는 경우 서비스 제공을 일시적으로 중단할 수 있습니다.
  - 시스템 점검, 교체 및 고장
  - 천재지변, 국가비상사태 등 불가항력적 사유
2. 서비스 중단 시 사전에 공지하며, 불가피한 경우 사후에 공지할 수 있습니다.`,
  },
  {
    title: "제7조 (회원의 의무)",
    body: `1. 회원은 서비스 이용 시 다음 행위를 하여서는 안 됩니다.
  - 타인의 계정을 도용하는 행위
  - 서비스의 정상적 운영을 방해하는 행위
  - 서비스를 이용하여 법령에 위반되는 행위
  - 서비스 내 정보를 무단으로 수집, 이용, 제공하는 행위
2. 회원은 본 약관 및 관계 법령을 준수하여야 합니다.`,
  },
  {
    title: "제8조 (회사의 의무)",
    body: `1. 회사는 안정적인 서비스 제공을 위해 최선을 다합니다.
2. 회사는 회원의 개인정보를 본인 동의 없이 제3자에게 제공하지 않습니다.
3. 회사는 서비스 관련 설비를 항상 운용 가능한 상태로 유지하며, 장애 발생 시 신속히 복구합니다.`,
  },
  {
    title: "제9조 (지적재산권)",
    body: "서비스에 포함된 콘텐츠(세일 정보, 브랜드 로고, 디자인 등)에 대한 저작권 및 지적재산권은 회사 또는 해당 권리자에게 귀속됩니다. 회원은 서비스를 통해 얻은 정보를 회사의 사전 승인 없이 상업적으로 이용할 수 없습니다.",
  },
  {
    title: "제10조 (면책 조항)",
    body: `1. 회사는 세일 정보의 정확성을 보장하지 않으며, 각 브랜드의 세일 내용은 해당 브랜드의 공식 채널에서 확인하시기 바랍니다.
2. 회사는 회원이 서비스를 통해 기대하는 수익이나 이익을 보장하지 않습니다.
3. 천재지변 또는 이에 준하는 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.`,
  },
  {
    title: "제11조 (회원 탈퇴 및 자격 상실)",
    body: `1. 회원은 언제든지 서비스 내 "회원 탈퇴" 기능을 통해 탈퇴할 수 있습니다.
2. 탈퇴 시 회원의 관심 브랜드, 알림 설정 등 모든 데이터는 즉시 삭제되며 복구할 수 없습니다.`,
  },
  {
    title: "제12조 (분쟁 해결)",
    body: `1. 서비스 이용과 관련하여 분쟁이 발생한 경우 회사와 회원은 성실히 협의하여 해결합니다.
2. 협의가 이루어지지 않을 경우 민사소송법에 따른 관할법원에 소를 제기할 수 있습니다.`,
  },
];

export default function JigumiaTermsPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        JIGUMIA · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        JIGUMIA 이용약관
      </h1>
      <p className="mt-3 text-sm text-text-muted">시행일: {EFFECTIVE_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] text-text-secondary">
        {ARTICLES.map((article) => (
          <section key={article.title}>
            <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
              {article.title}
            </h2>
            <p className="whitespace-pre-line">{article.body}</p>
          </section>
        ))}

        <p className="text-sm text-text-muted">
          본 약관은 {EFFECTIVE_AT}부터 시행됩니다.
        </p>
      </div>
    </div>
  );
}
