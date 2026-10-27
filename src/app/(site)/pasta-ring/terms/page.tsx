import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "파스타 한 줌 이용약관",
  description: "파스타 계량·타이머 앱 파스타 한 줌의 이용 조건과 책임의 범위에 관한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/pasta-ring/terms",
  },
};

const EFFECTIVE_AT = "2026년 10월 7일";
const CONTACT = "contact@joowonkoh.com";

const ARTICLES: { title: string; body: string }[] = [
  {
    title: "제1조 (목적)",
    body: '본 약관은 개발자 고주원(이하 "운영자")이 개인으로 만들어 제공하는 파스타 계량·타이머 앱 파스타 한 줌(이하 "서비스")의 이용 조건과 운영자와 이용자의 권리·의무 및 책임을 정하는 것을 목적으로 합니다.',
  },
  {
    title: "제2조 (서비스의 내용)",
    body: `1. 서비스는 화면에 그린 원으로 마른 파스타의 양을 가늠하는 기능, 면별 삶는 시간과 물·소금 양을 안내하는 기능, 삶기 타이머와 알림 기능을 제공합니다.
2. 서비스는 무료로 제공되며, 서비스 화면에 광고가 표시됩니다.
3. 서비스에는 계정이 없으며, 이용자는 앱을 설치하고 실행함으로써 본 약관에 동의한 것으로 봅니다.`,
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    body: `1. 본 약관은 이 페이지에 게시함으로써 효력이 발생합니다.
2. 운영자는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자와 변경 사유를 이 페이지에 7일 전에 알립니다.
3. 변경된 약관에 동의하지 않는 이용자는 앱을 삭제하여 이용을 중단할 수 있습니다.`,
  },
  {
    title: "제4조 (안내 정보의 성격)",
    body: `1. 원으로 잰 양은 마른 면 다발의 지름으로 무게를 어림한 값이며, 저울로 잰 무게와 다를 수 있습니다. 면을 쥐는 힘, 면의 종류와 길이, 기기의 화면 정보에 따라 차이가 생길 수 있습니다.
2. 삶는 시간은 각 브랜드가 공개한 시간을 바탕으로 한 안내이며, 판매 국가나 제조 시기에 따라 포장지의 시간과 다를 수 있습니다. 포장지의 안내와 다르면 포장지를 따라 주십시오.
3. 물과 소금의 양은 일반적으로 쓰이는 비율에 따른 권장값입니다. 건강상 염분 섭취를 조절해야 하는 경우 이용자의 판단에 따라 줄여 주십시오.`,
  },
  {
    title: "제5조 (광고)",
    body: `1. 운영자는 서비스 운영을 위해 Google AdMob 을 통해 배너 광고와 전면 광고를 표시합니다.
2. 광고 속 상품·서비스의 거래는 이용자와 광고주 사이에서 이루어지며, 운영자는 그 내용에 대해 책임을 지지 않습니다.`,
  },
  {
    title: "제6조 (이용자의 의무)",
    body: `1. 이용자는 서비스를 정상적인 운영을 방해하는 방법으로 이용하여서는 안 됩니다.
2. 이용자는 광고를 부정한 방법으로 반복 클릭하는 등 광고 운영을 방해하는 행위를 하여서는 안 됩니다.`,
  },
  {
    title: "제7조 (서비스의 변경 및 중단)",
    body: `1. 서비스는 있는 그대로 제공되며, 운영상·기술상 필요에 따라 내용이 바뀌거나 중단될 수 있습니다.
2. 서비스를 종료하는 경우 가능한 한 미리 이 페이지를 통해 알립니다.`,
  },
  {
    title: "제8조 (책임의 제한)",
    body: `1. 운영자는 서비스가 안내한 양·시간·물과 소금의 양을 따른 조리 결과에 대해 책임을 지지 않습니다. 끓는 물을 다룰 때는 안전에 유의해 주십시오.
2. 운영자는 기기 설정(알림 끄기, 무음 모드, 배터리 절약 등)으로 타이머 알림이 울리지 않아 생긴 결과에 대해 책임을 지지 않습니다.
3. 천재지변 또는 이에 준하는 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.`,
  },
  {
    title: "제9조 (분쟁 해결)",
    body: `1. 서비스 이용과 관련하여 분쟁이 발생한 경우 운영자와 이용자는 성실히 협의하여 해결합니다.
2. 협의가 이루어지지 않을 경우 민사소송법에 따른 관할법원에 소를 제기할 수 있습니다.`,
  },
];

export default function PastaRingTermsPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        파스타 한 줌 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        파스타 한 줌 이용약관
      </h1>
      <p className="mt-3 text-sm text-text-muted">시행일: {EFFECTIVE_AT}</p>

      <div className="mt-10 space-y-10 leading-[1.85] break-keep text-text-secondary">
        {ARTICLES.map((article) => (
          <section key={article.title}>
            <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">{article.title}</h2>
            <p className="whitespace-pre-line">{article.body}</p>
          </section>
        ))}

        <p className="text-sm text-text-muted">
          본 약관은 {EFFECTIVE_AT}부터 시행됩니다. 문의:{" "}
          <a className="text-accent hover:underline" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>
        </p>
      </div>
    </div>
  );
}
