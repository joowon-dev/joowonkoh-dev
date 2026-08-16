import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이게내연봉",
  description:
    "연봉을 넣으면 지금 이 순간 쌓이는 내 돈이 1초 단위로 보이는 앱. 다이나믹 아일랜드와 홈 위젯에서도 확인할 수 있습니다. iOS 앱 이게내연봉 소개 및 지원 페이지입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/moneytick",
  },
};

const FEATURES = [
  {
    title: "1초에 얼마 버는지",
    body: "연봉·월급·일급 중 편한 걸로 넣으면 지금 이 순간 쌓이는 금액이 매초 올라갑니다.",
  },
  {
    title: "실시간 · 근무시간",
    body: "자는 동안에도 계산하는 실시간 누적과, 출퇴근 시간에만 계산하는 근무시간 모드 중에 고를 수 있습니다.",
  },
  {
    title: "다이나믹 아일랜드",
    body: "앱을 열지 않아도 지금까지 번 돈을 확인할 수 있습니다. 볼 때마다 그 시점 기준으로 다시 계산해 보여줍니다.",
  },
  {
    title: "홈 위젯 · StandBy",
    body: "홈 화면 위젯과 충전 중 거치 화면에서도 누적 금액을 큼직하게 볼 수 있습니다.",
  },
  {
    title: "비교 레이스",
    body: "대통령·국회의원·장관·9급 공무원·최저임금·병장과 나란히 달립니다. 2026년에 공표된 법정 급여를 그대로 사용했습니다.",
  },
  {
    title: "내 근무시간 기준으로",
    body: "저 사람이 내 근무시간만큼 일하면 얼마 벌까? 같은 시간을 일했다고 가정하고 다시 계산해 보여줍니다.",
  },
];

export default function MoneyTickPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        iOS App
      </span>

      <div className="flex items-center gap-5">
        <Image
          src="/moneytick-icon.png"
          alt="이게내연봉 앱 아이콘"
          width={84}
          height={84}
          className="rounded-2xl border border-border shadow-ambient"
        />
        <div>
          <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
            이게내연봉
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            1초에 얼마 버는지 보는 앱
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-[60ch] leading-[1.85] text-text-secondary">
        이게내연봉은 연봉을 한 번 넣어두면 지금 이 순간 쌓이는 내 돈이 1초 단위로
        올라가는 iOS 앱입니다. 월급날에만 잠깐 실감하던 숫자를 매일 눈으로 보게
        만들고 싶어서 만들었습니다. 다이나믹 아일랜드와 홈 화면 위젯에서도 확인할
        수 있고, 대통령·최저임금 같은 공표된 법정 급여와 나란히 달리는 비교 레이스도
        들어 있습니다.
      </p>

      <div className="mt-6">
        <span className="inline-block rounded-full border border-border bg-card-bg px-4 py-2 text-sm font-medium text-text-secondary shadow-ambient">
          App Store 출시 준비 중
        </span>
      </div>

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
              <p className="text-sm leading-[1.7] text-text-secondary">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight md:text-2xl">
          왜 만들었나
        </h2>
        <p className="max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          연봉은 1년에 한 번 정해지고 월급은 한 달에 한 번 들어옵니다. 그래서
          내가 지금 무슨 값에 시간을 팔고 있는지는 평소에 잘 안 보입니다. 그
          숫자를 초 단위로 흐르게 만들면 감각이 좀 달라지지 않을까 싶어서 만든
          앱입니다. 회의가 길어질 때 화면을 보면 그 회의의 가격이 보입니다.
        </p>
        <p className="mt-3 max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          비교 레이스를 넣은 것도 같은 이유입니다. 혼자 올라가는 숫자는 크기를
          가늠하기 어렵지만, 옆에 다른 줄이 같이 달리면 바로 감이 옵니다. 다만
          여기에 추측한 금액을 쓰면 재미가 아니라 거짓말이 되기 때문에, 공표된
          법정 급여만 씁니다. 근거는 아래 질문에 적어 두었습니다.
        </p>
        <p className="mt-3 max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          넣은 연봉은 기기 안에만 있습니다. 서버로 보내지 않고, 계정도 만들지
          않습니다. 연봉은 남에게 보내고 싶은 정보가 아니니까요.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          자주 묻는 질문
        </h2>
        <div className="space-y-6 leading-[1.85] text-text-secondary">
          <div>
            <h3 className="mb-1.5 font-display text-base font-semibold text-text-primary">
              다이나믹 아일랜드의 숫자가 멈춰 있어요
            </h3>
            <p className="max-w-[60ch] text-sm leading-[1.8]">
              앱을 벗어나면 iOS가 잠시 뒤 앱을 중단시키기 때문에 숫자가 그 자리에
              멈춥니다. 기기 성능이나 배터리 설정과 무관한 시스템 동작입니다. 앱을
              다시 열거나 아일랜드가 다시 그려지면 그 시점의 정확한 금액으로
              맞춰지므로, 표시되는 금액 자체는 언제나 정확합니다.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-display text-base font-semibold text-text-primary">
              세금을 뗀 실수령액으로 볼 수 있나요
            </h3>
            <p className="max-w-[60ch] text-sm leading-[1.8]">
              아직 지원하지 않습니다. 4대보험과 근로소득세는 부양가족 수 등 조건에
              따라 달라져서, 검증되지 않은 계산식을 넣는 대신 다음 업데이트로
              미뤘습니다. 지금 표시되는 금액은 세전 기준입니다.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-display text-base font-semibold text-text-primary">
              비교 레이스의 금액은 어디서 가져왔나요
            </h3>
            <p className="max-w-[60ch] text-sm leading-[1.8]">
              2026년 인사혁신처 공무원 봉급표, 고용노동부 최저임금 고시,
              공무원보수규정에 공표된 금액을 사용했습니다. 추정하거나 계산해 낸
              값이 아닙니다. 비교하고 싶은 사람이 따로 있다면 직접 추가할 수
              있습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          문의 및 지원
        </h2>
        <p className="max-w-[55ch] text-sm leading-[1.8] text-text-secondary">
          앱 사용 중 문제가 있거나 기능 제안, 문의 사항이 있다면 아래 이메일로
          연락 주세요. 가능한 한 빠르게 답장드리겠습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-5">
          <a
            href="mailto:joowonkoh0505@gmail.com"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            joowonkoh0505@gmail.com →
          </a>
          <Link
            href="/moneytick/privacy"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            개인정보처리방침 →
          </Link>
        </div>
      </section>
    </div>
  );
}
