import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "미션용돈",
  description:
    "명절에 온 가족이 모였을 때 폰 한 대로 즐기는 미션 뽑기 앱. 릴이 돌아 미션이 정해지고, 성공하면 정해둔 범위 안에서 용돈이 랜덤으로 나옵니다. iOS 앱 미션용돈 소개 및 지원 페이지입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/mission-money",
  },
};

const FEATURES = [
  {
    title: "두구두구 릴 뽑기",
    body: "슬롯머신처럼 미션이 돌아가다 멈춥니다. 진동과 소리가 붙어서, 멈추는 순간 온 방이 같이 조용해집니다.",
  },
  {
    title: "난이도별 배율",
    body: "기준 금액 범위를 한 번 정해두면 쉬움 0.5배·보통 1배·어려움 1.5배가 곱해집니다. 금액은 100원 단위로 떨어집니다.",
  },
  {
    title: "실패해도 위로금",
    body: "못 해도 빈손으로 보내지 않습니다. 실패한 미션은 다시 통에 들어가 누군가에게 또 나옵니다.",
  },
  {
    title: "정산표",
    body: "누가 어떤 미션으로 얼마를 받았는지 한 판이 끝나면 순위와 함께 정리됩니다. 지난 판도 기록에 남습니다.",
  },
  {
    title: "미션 30개 기본 제공",
    body: "온 가족 앞에서 미션을 타이핑하고 있을 시간은 없으니까요. 마음에 안 들면 지우고 직접 적으면 됩니다.",
  },
  {
    title: "TV·태블릿에 띄우기",
    body: "가로 화면에서는 차례와 정산이 양옆에 펼쳐집니다. 폰 한 대를 돌려 써도 되고, 큰 화면에 미러링해도 됩니다.",
  },
];

export default function MissionMoneyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        iOS App
      </span>

      <div className="flex items-center gap-5">
        <Image
          src="/mission-money-icon.png"
          alt="미션용돈 앱 아이콘"
          width={84}
          height={84}
          className="rounded-2xl border border-border shadow-ambient"
        />
        <div>
          <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
            미션용돈
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            명절에 온 가족이 하는 미션 뽑기
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-[60ch] leading-[1.85] break-keep text-text-secondary">
        미션용돈은 명절에 모인 가족들이 폰 한 대를 돌려가며 하는 미션 뽑기
        앱입니다. 미션을 적어두고 릴을 돌리면 두구두구 소리와 함께 하나가 뽑히고,
        해낸 사람에게는 정해둔 범위 안에서 용돈 금액이 랜덤으로 굴러갑니다.
        회원가입도, 서버도 없습니다.
      </p>

      <section className="mt-14">
        <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Features
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient"
            >
              <h3 className="mb-2 font-display text-base font-semibold text-text-primary">
                {item.title}
              </h3>
              <p className="text-sm leading-[1.7] break-keep text-text-secondary">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight md:text-2xl">
          시작하는 법
        </h2>
        <ol className="ml-5 max-w-[58ch] list-decimal space-y-2 text-sm leading-[1.85] break-keep text-text-secondary">
          <li>홈에서 가운데 큰 봉투를 눌러 참가자를 등록합니다.</li>
          <li>홈으로 돌아와 「판 시작하기」를 누릅니다.</li>
          <li>차례인 사람이 「뽑기」를 눌러 미션을 뽑습니다.</li>
          <li>해냈으면 「해냈다」, 못 했으면 「실패」를 누릅니다.</li>
          <li>홈의 「판 끝내고 정산하기」로 누가 얼마를 받았는지 확인합니다.</li>
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight md:text-2xl">
          왜 만들었나
        </h2>
        <p className="max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          명절에 오랜만에 모이면 할 말이 금방 떨어집니다. 어른들은 용돈을 주고
          싶은데 줄 명분이 마땅치 않고, 아이들은 받고 싶은데 먼저 말을 못 꺼냅니다.
          그 사이의 어색함을 게임 하나로 넘겨보려고 만들었습니다.
        </p>
        <p className="mt-3 max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          금액을 미리 정해두지 않고 범위만 정해둔 것도 같은 이유입니다. 얼마를
          줄지 정해놓으면 그냥 주는 것과 다를 게 없지만, 숫자가 굴러가다 멈추면
          2,600원에도 방이 뒤집어집니다.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          자주 묻는 질문
        </h2>
        <div className="space-y-6 leading-[1.85] text-text-secondary">
          <div>
            <h3 className="mb-1.5 font-display text-base font-semibold text-text-primary">
              앱이 돈을 주고받나요
            </h3>
            <p className="max-w-[60ch] text-sm leading-[1.8] break-keep">
              아니요. 화면에 뜨는 금액은 가족끼리 직접 현금을 주고받기 위한 안내
              숫자입니다. 앱 안에 결제·송금·환전 기능은 없고, 앱이 돈을 보관하지도
              않습니다.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-display text-base font-semibold text-text-primary">
              적어둔 내용이 어디로 가나요
            </h3>
            <p className="max-w-[60ch] text-sm leading-[1.8] break-keep">
              기기 안에만 저장됩니다. 서버로 보내지 않고 계정도 만들지 않습니다.
              앱을 지우면 함께 사라집니다.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-display text-base font-semibold text-text-primary">
              소리를 끄고 싶어요
            </h3>
            <p className="max-w-[60ch] text-sm leading-[1.8] break-keep">
              「용돈」 화면 맨 아래의 소리 버튼을 누르면 두구두구 소리가 꺼집니다.
              진동은 그대로 남습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          문의 및 지원
        </h2>
        <p className="max-w-[58ch] text-sm leading-[1.8] break-keep text-text-secondary">
          기능 제안이나 문의는 아래 이메일로 보내 주세요. 가능한 한 빠르게
          답장드리겠습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-5">
          <a
            href="mailto:contact@joowonkoh.com"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            contact@joowonkoh.com →
          </a>
          <Link
            href="/mission-money/privacy"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            개인정보처리방침 →
          </Link>
        </div>
      </section>
    </div>
  );
}
