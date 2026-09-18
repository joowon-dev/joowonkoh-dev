import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "네밥내밥",
  description:
    "아침·점심·저녁을 식판 한 칸씩 사진으로 채우고, 가족이나 친구와 서로 챙기는 앱. iOS·안드로이드 앱 네밥내밥 소개 및 지원 페이지입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/yourmealmymeal",
  },
};

const FEATURES = [
  {
    title: "식판 한 칸씩",
    body: "아침·점심·저녁, 그리고 간식. 칸을 누르면 사진을 찍거나 앨범에서 고를 수 있습니다.",
  },
  {
    title: "담을 부분을 직접",
    body: "사진을 밀고 확대해서 칸에 담길 자리를 직접 정합니다. 밥이 가장자리에 잘리지 않습니다.",
  },
  {
    title: "모임으로 함께",
    body: "초대 코드로 들어오면 오늘 누가 무엇을 먹었는지 한 화면에 보입니다.",
  },
  {
    title: "식판은 하나",
    body: "한 사람이 여러 모임에 들어갈 수 있습니다. 아침을 한 번 올리면 내가 속한 모든 상에 함께 올라갑니다.",
  },
  {
    title: "하루를 한 장으로",
    body: "그날의 식판이나 한 끼의 모임 밥상을 한 장으로 묶어 사진첩에 저장하거나 나눌 수 있습니다.",
  },
  {
    title: "간식은 덤",
    body: "끼니는 셋입니다. 간식 칸은 비어 있어도 안 챙겨 먹은 것으로 세지 않습니다.",
  },
];

export default function YourMealMyMealPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        iOS · Android App
      </span>

      <div className="flex items-center gap-5">
        <Image
          src="/yourmealmymeal-icon.png"
          alt="네밥내밥 앱 아이콘"
          width={84}
          height={84}
          className="rounded-2xl border border-border shadow-ambient"
        />
        <div>
          <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
            네밥내밥
          </h1>
          <p className="mt-1 text-sm text-text-muted">밥 먹었냐고 묻는 대신</p>
        </div>
      </div>

      <p className="mt-6 max-w-[60ch] leading-[1.85] text-text-secondary">
        네밥내밥은 오늘 먹은 끼니를 식판 한 칸씩 사진으로 채우고, 가족이나 친구와
        서로 챙기는 iOS·안드로이드 앱입니다. 잘 먹고 다니냐고 묻는 말은 자주 하기 민망하고,
        묻는다고 제대로 답이 오지도 않습니다. 대신 각자 자기 식판을 채워 두면
        말없이도 서로 확인이 됩니다.
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
          혼자 사는 사람에게 밥은 가장 먼저 대충 때우게 되는 일입니다. 그런데
          그걸 확인할 방법은 전화해서 묻는 것뿐이고, 물으면 대체로 &ldquo;먹었어&rdquo;라는
          답이 돌아옵니다. 사실인지 아닌지는 알 수 없습니다.
        </p>
        <p className="mt-3 max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          그래서 묻는 대신 보이게 만들었습니다. 식판에 칸이 비어 있으면 그것만으로
          충분히 보입니다. 잔소리를 자동화한 앱이 아니라, 안부를 묻는 수고를 덜어
          주는 앱에 가깝습니다.
        </p>
        <p className="mt-3 max-w-[58ch] text-sm leading-[1.85] break-keep text-text-secondary">
          그래서 빈 칸을 나무라지 않는 데 신경을 썼습니다. 끼니는 셋이고 간식은
          덤입니다. 간식 칸이 비어 있다고 안 챙겨 먹은 것으로 세면, 서로 챙기자고
          만든 앱이 없는 잘못을 만들어 내게 됩니다.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          자주 묻는 질문
        </h2>
        <div className="space-y-6 leading-[1.85] text-text-secondary">
          <div>
            <h3 className="mb-1.5 font-display text-base font-semibold text-text-primary">
              내 사진을 누가 볼 수 있나요
            </h3>
            <p className="max-w-[60ch] text-sm leading-[1.8]">
              나와 같은 모임에 있는 사람만 볼 수 있습니다. 이 제한은 앱 화면이
              아니라 데이터베이스 자체에 걸려 있어서, 앱을 뜯어고쳐도 남의 끼니를
              가져올 수 없습니다. 사진 보관함은 비공개이고 링크는 잠깐만 유효합니다.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-display text-base font-semibold text-text-primary">
              가족 모임과 친구 모임에 같이 들어갈 수 있나요
            </h3>
            <p className="max-w-[60ch] text-sm leading-[1.8]">
              됩니다. 그리고 식판은 한 사람에 하나입니다. 아침을 한 번 올리면 내가
              속한 모든 모임에서 같이 보입니다. 모임마다 따로 올릴 필요가 없습니다.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-display text-base font-semibold text-text-primary">
              계정을 지우면 어떻게 되나요
            </h3>
            <p className="max-w-[60ch] text-sm leading-[1.8]">
              앱 안에서 바로 지울 수 있습니다. 올린 사진과 기록이 모두 사라지고
              되돌릴 수 없습니다. 내가 만든 모임은 남아 있는 사람 중 가장 오래
              있던 사람에게 넘어가고, 아무도 남지 않았으면 모임도 함께 사라집니다.
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 font-display text-base font-semibold text-text-primary">
              광고가 있나요
            </h3>
            <p className="max-w-[60ch] text-sm leading-[1.8]">
              지금은 없습니다. 이용 통계를 모으는 도구도 붙이지 않았습니다. 나중에
              달라지면 이 페이지와 개인정보처리방침을 먼저 고친 뒤에 반영합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          문의 및 지원
        </h2>
        <p className="max-w-[58ch] text-sm leading-[1.8] break-keep text-text-secondary">
          출시 상태를 먼저 밝혀 둡니다. 아직 App Store에 올라가지 않았고, 심사
          준비 중입니다. 올라가면 이 페이지에 내려받는 곳을 답니다.
        </p>
        <p className="mt-3 max-w-[58ch] text-sm leading-[1.8] break-keep text-text-secondary">
          그 전이라도 기능 제안이나 문의는 아래 이메일로 보내 주세요.
        </p>
        <div className="mt-4 flex flex-wrap gap-5">
          <a
            href="mailto:contact@joowonkoh.com"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            contact@joowonkoh.com →
          </a>
          <Link
            href="/yourmealmymeal/privacy"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            개인정보처리방침 →
          </Link>
        </div>
      </section>
    </div>
  );
}
