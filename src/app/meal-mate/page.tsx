import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meal Mate",
  description:
    "다녀온 맛집을 좋음(O) · 별로(X)로 기록하는 가장 간단한 방법. iOS 앱 Meal Mate 소개 및 지원 페이지입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/meal-mate",
  },
};

const FEATURES = [
  {
    title: "좋음 · 별로 한눈에",
    body: "다녀온 음식점을 O(좋음) 또는 X(별로)로 기록합니다. 복잡한 별점 대신 직관적인 두 가지 선택으로 빠르게 남깁니다.",
  },
  {
    title: "음식 카테고리 분류",
    body: "한식·일식·중식·양식·베트남식·카페·샐러드·기타로 분류해, 먹고 싶은 종류별로 기록을 모아 볼 수 있습니다.",
  },
  {
    title: "한 줄 메모",
    body: "20자 이내의 짧은 메모로 '왜 좋았는지' 핵심만 남깁니다. 길게 쓸 필요 없이 기억에 남는 한마디면 충분합니다.",
  },
  {
    title: "배달 · 지도 링크",
    body: "배달 앱이나 지도 링크를 함께 저장해, 다시 주문하거나 찾아갈 때 바로 연결됩니다.",
  },
];

export default function MealMatePage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        iOS App
      </span>

      <div className="flex items-center gap-5">
        <Image
          src="/meal-mate-icon.png"
          alt="Meal Mate 앱 아이콘"
          width={84}
          height={84}
          className="rounded-2xl border border-border shadow-ambient"
        />
        <div>
          <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
            Meal Mate
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            다녀온 맛집을 기록하는 가장 간단한 방법
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-[60ch] leading-[1.85] text-text-secondary">
        Meal Mate는 다녀온 음식점을 좋음(O)과 별로(X)로 기록하고, 음식 카테고리와
        한 줄 메모로 정리하는 모바일 앱입니다. &ldquo;여기 괜찮았는데 이름이
        뭐였더라&rdquo; 하는 순간을 줄이기 위해 만들었습니다. 가볍게 남기고, 다음에
        먹을 곳을 고를 때 빠르게 꺼내 보세요.
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
          왜 별점이 아니라 O·X인가
        </h2>
        <p className="max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          맛집 기록 앱은 이미 많습니다. 그런데 대부분 별점 다섯 칸에 사진 여러
          장, 긴 후기를 요구합니다. 그러다 보니 밥 먹고 나와서 기록을 남기는
          일이 일처럼 느껴지고, 결국 두세 번 쓰다 맙니다. 기록이 안 쌓이면
          나중에 꺼내 볼 것도 없습니다.
        </p>
        <p className="mt-3 max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          그래서 남길 것을 최소한으로 깎았습니다. 좋았는지 아닌지, 그리고 20자
          한 줄. 별 3개와 별 4개는 나중에 봐도 무슨 차이였는지 기억나지 않지만,
          O와 X는 헷갈릴 일이 없습니다. 20자 제한을 둔 것도 같은 이유입니다 —
          칸이 넓으면 잘 쓰려다 안 쓰게 됩니다.
        </p>

        <h2 className="mt-12 mb-4 font-display text-xl font-bold tracking-tight md:text-2xl">
          어떻게 쓰면 좋은가
        </h2>
        <p className="max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          진가는 기록할 때가 아니라 고를 때 나옵니다. 오늘 뭘 먹을지 정하기
          어려울 때 카테고리로 걸러서 O만 모아 보면, 이미 검증된 곳 중에서
          고르게 됩니다. 배달 앱이나 지도 링크를 같이 넣어 두면 거기서 바로
          이어집니다.
        </p>
        <p className="mt-3 max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          X도 O만큼 쓸모가 있습니다. 한 번 별로였던 집을 반년 뒤에 다시
          후보에 올리는 일이 생각보다 흔합니다. 제가 실제로 다녀와서 남긴 긴
          후기들은
          <Link
            href="/blog/life"
            className="mx-1 font-medium text-text-secondary underline underline-offset-4 spring-transition hover:text-accent"
          >
            블로그 Life 섹션
          </Link>
          에 따로 올리고 있습니다.
        </p>
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
            href="/meal-mate/privacy"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            개인정보처리방침 →
          </Link>
        </div>
      </section>
    </div>
  );
}
