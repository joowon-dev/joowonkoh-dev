import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "와파냥 이용약관",
  description: "와이파이 진단 앱 와파냥의 이용 조건과 책임의 범위에 관한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/wapanyang/terms",
  },
};

const EFFECTIVE_AT = "2026년 10월 9일";
const CONTACT = "contact@joowonkoh.com";

const ARTICLES: { title: string; body: string }[] = [
  {
    title: "제1조 (목적)",
    body: '본 약관은 개발자 고주원(이하 "운영자")이 개인으로 만들어 제공하는 와이파이 진단 앱 와파냥(이하 "서비스")의 이용 조건과 운영자와 이용자의 권리·의무 및 책임을 정하는 것을 목적으로 합니다.',
  },
  {
    title: "제2조 (서비스의 내용)",
    body: `1. 서비스는 이용자 기기가 연결된 와이파이의 암호 방식, HTTPS 가로채기·DNS 변조 의심 여부, 로그인 페이지 여부, 연결된 기기 수를 점검하고, 다운로드·업로드 속도와 핑·지터·패킷 손실을 측정하여 그 결과와 기록, 홈 화면 위젯, 공유 카드를 제공합니다.
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
    title: "제4조 (진단 결과의 성격)",
    body: `1. 보안 진단은 앱이 운영체제와 공개 서버를 통해 확인할 수 있는 범위에서 위험 징후를 알려 주는 참고 정보입니다. "안전" 등급이 네트워크가 완전히 안전하다는 보증은 아니며, "위험" 등급이 실제 공격이 일어났다는 확정도 아닙니다.
2. 속도는 측정 시점에 공개 측정 서버(Cloudflare)까지의 결과이며, 시간대·서버 상태·기기 상태에 따라 달라질 수 있습니다. 통신사나 공유기 제조사가 보장하는 속도와 비교하는 공식 자료로 쓸 수 없습니다.
3. 측정에는 데이터가 쓰입니다. 모바일 데이터와 비교 기능을 쓰면 모바일 데이터가 쓰이며, 요금제에 따라 요금이 발생할 수 있습니다.`,
  },
  {
    title: "제5조 (광고)",
    body: `1. 운영자는 서비스 운영을 위해 Google AdMob 을 통해 배너 광고와 전면 광고를 표시합니다.
2. 광고 속 상품·서비스의 거래는 이용자와 광고주 사이에서 이루어지며, 운영자는 그 내용에 대해 책임을 지지 않습니다.`,
  },
  {
    title: "제6조 (이용자의 의무)",
    body: `1. 이용자는 본인이 이용 권한을 가진 네트워크에서만 서비스를 사용해야 합니다.
2. 이용자는 서비스를 정상적인 운영을 방해하는 방법으로 이용하여서는 안 되며, 광고를 부정한 방법으로 반복 클릭하는 등 광고 운영을 방해하는 행위를 하여서는 안 됩니다.`,
  },
  {
    title: "제7조 (서비스의 변경 및 중단)",
    body: `1. 서비스는 있는 그대로 제공되며, 운영상·기술상 필요에 따라 내용이 바뀌거나 중단될 수 있습니다.
2. 서비스가 쓰는 외부 측정 서버의 정책이 바뀌면 일부 측정이 일시적으로 되지 않을 수 있습니다.
3. 서비스를 종료하는 경우 가능한 한 미리 이 페이지를 통해 알립니다.`,
  },
  {
    title: "제8조 (책임의 제한)",
    body: `1. 운영자는 진단 결과를 믿고 네트워크를 사용하거나 사용하지 않아 생긴 결과(정보 유출, 금전 손해 등)에 대해 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다. 중요한 거래는 신뢰할 수 있는 네트워크에서 하시기 바랍니다.
2. 운영자는 측정에 쓰인 데이터 요금에 대해 책임을 지지 않습니다.
3. 천재지변 또는 이에 준하는 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.`,
  },
  {
    title: "제9조 (분쟁 해결)",
    body: `1. 서비스 이용과 관련하여 분쟁이 발생한 경우 운영자와 이용자는 성실히 협의하여 해결합니다.
2. 협의가 이루어지지 않을 경우 민사소송법에 따른 관할법원에 소를 제기할 수 있습니다.`,
  },
];

export default function WapanyangTermsPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        와파냥 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        와파냥 이용약관
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
