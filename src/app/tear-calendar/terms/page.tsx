import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "뜯어쓰는 달력 이용약관",
  description:
    "커플 일력 앱 뜯어쓰는 달력의 이용 조건, 이용자의 콘텐츠와 의무, 책임의 범위에 관한 안내입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/tear-calendar/terms",
  },
};

const EFFECTIVE_AT = "2026년 9월 27일";
const CONTACT = "contact@joowonkoh.com";

const ARTICLES: { title: string; body: string }[] = [
  {
    title: "제1조 (목적)",
    body: '본 약관은 개발자 고주원(이하 "운영자")이 개인으로 만들어 제공하는 커플 일력 앱 뜯어쓰는 달력(이하 "서비스")의 이용 조건과 절차, 운영자와 이용자의 권리·의무 및 책임을 정하는 것을 목적으로 합니다.',
  },
  {
    title: "제2조 (정의)",
    body: `1. "서비스"란 두 사람이 서로를 위해 하루치 페이지를 꾸미고, 상대가 꾸민 페이지를 뜯어서 보는 기능과 이에 딸린 디데이·기념일·알림 기능을 말합니다.
2. "이용자"란 본 약관에 따라 서비스를 이용하는 사람을 말합니다.
3. "상대"란 초대 코드로 이용자와 연결된 다른 이용자 한 사람을 말합니다.
4. "콘텐츠"란 이용자가 페이지에 올린 글, 사진, 스티커 등 일체의 내용을 말합니다.`,
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    body: `1. 본 약관은 서비스 화면 또는 이 페이지에 게시함으로써 효력이 발생합니다.
2. 운영자는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자와 변경 사유를 이 페이지에 7일 전에 알립니다.
3. 변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 계정 삭제를 요청할 수 있습니다.`,
  },
  {
    title: "제4조 (서비스의 이용)",
    body: `1. 서비스는 무료로 제공됩니다.
2. 이용자는 로그인하지 않고도 서비스의 기능을 기기 안에서 혼자 이용할 수 있습니다.
3. 상대와 연결하려면 Apple 또는 Google 계정으로 로그인하고, 한 사람이 만든 초대 코드를 다른 사람이 입력해야 합니다. 이용 계약은 이용자가 본 약관에 동의하고 로그인함으로써 성립합니다.`,
  },
  {
    title: "제5조 (페이지와 알림)",
    body: `1. 지난 날의 페이지는 그날이 지나면 잠겨 더 이상 꾸밀 수 없습니다. 앞날의 페이지는 미리 꾸며 둘 수 있습니다.
2. 이용자가 상대의 오늘 페이지를 뜯으면 상대에게 알림이 전달될 수 있으며, 뜯은 페이지는 되돌릴 수 없습니다.
3. 운영자는 알림이 과해지지 않도록 같은 종류의 알림은 6시간에 한 번까지, 밤 10시부터 아침 8시까지는 보내지 않는 등 발송을 제한합니다.`,
  },
  {
    title: "제6조 (콘텐츠의 권리)",
    body: `1. 이용자가 만든 콘텐츠의 권리는 그 콘텐츠를 만든 이용자에게 있습니다.
2. 운영자는 콘텐츠를 연결된 상대에게 보여 주고 서비스를 제공하는 데에만 사용하며, 그 밖의 목적으로 이용하거나 제3자에게 제공하지 않습니다.`,
  },
  {
    title: "제7조 (이용자의 의무)",
    body: `1. 이용자는 서비스 이용 시 다음 행위를 하여서는 안 됩니다.
  - 타인의 권리(초상권, 저작권 등)를 침해하는 콘텐츠를 올리는 행위
  - 법령에 어긋나는 콘텐츠를 올리는 행위
  - 타인의 계정을 도용하거나 초대 코드를 부정하게 사용하는 행위
  - 서비스의 정상적인 운영을 방해하는 행위
2. 이용자는 본 약관과 관계 법령을 지켜야 합니다.`,
  },
  {
    title: "제8조 (운영자의 의무)",
    body: `1. 운영자는 안정적인 서비스 제공을 위해 노력합니다.
2. 운영자는 이용자의 개인정보를 개인정보처리방침에 따라 보호하며, 본인 동의 없이 제3자에게 제공하지 않습니다.`,
  },
  {
    title: "제9조 (서비스의 변경 및 중단)",
    body: `1. 서비스는 있는 그대로 제공되며, 운영상·기술상 필요에 따라 내용이 바뀌거나 중단될 수 있습니다.
2. 시스템 점검·장애, 천재지변 등 불가피한 사유가 있으면 서비스 제공을 일시적으로 중단할 수 있습니다.
3. 서비스를 종료하는 경우 가능한 한 미리 이 페이지와 앱을 통해 알립니다.`,
  },
  {
    title: "제10조 (책임의 제한)",
    body: `1. 운영자는 이용자 사이에 주고받은 콘텐츠의 내용에 대해 책임을 지지 않습니다.
2. 운영자는 기기 분실, 앱 삭제, 로그인하지 않은 상태에서 기기에만 저장된 콘텐츠의 손실에 대해 책임을 지지 않습니다. 중요한 내용은 따로 보관해 주시기 바랍니다.
3. 천재지변 또는 이에 준하는 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.`,
  },
  {
    title: "제11조 (계정 삭제)",
    body: `1. 이용자는 언제든지 ${CONTACT} 로 로그인에 사용한 계정과 함께 계정 삭제를 요청할 수 있습니다.
2. 운영자는 확인 후 7일 이내에 이용자의 계정과 이용자가 만든 콘텐츠, 연결 정보를 삭제하며, 삭제된 데이터는 복구할 수 없습니다.`,
  },
  {
    title: "제12조 (분쟁 해결)",
    body: `1. 서비스 이용과 관련하여 분쟁이 발생한 경우 운영자와 이용자는 성실히 협의하여 해결합니다.
2. 협의가 이루어지지 않을 경우 민사소송법에 따른 관할법원에 소를 제기할 수 있습니다.`,
  },
];

export default function TearCalendarTermsPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        뜯어쓰는 달력 · Legal
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        뜯어쓰는 달력 이용약관
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
          본 약관은 {EFFECTIVE_AT}부터 시행됩니다. 문의:{" "}
          <a className="text-accent hover:underline" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>
        </p>
      </div>
    </div>
  );
}
