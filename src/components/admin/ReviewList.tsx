import { isNewReview, STORE_LABELS, type StoreReview } from "@/lib/admin/store";

const DAY = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" });

/**
 * 스토어 리뷰. 처음 본 지 하루 안 된 건 「새」, 별 셋 이하는 눈에 띄게.
 * 앞의 몇 개만 펴 두고 나머지는 접는다 — 폰에서 리뷰가 화면을 다 먹지 않게.
 */
export default function ReviewList({
  reviews,
  now,
  appNames,
  initial = 5,
}: {
  reviews: readonly StoreReview[];
  now: Date;
  /** 여러 앱을 섞어 보여 줄 때만 */
  appNames?: Record<string, string>;
  initial?: number;
}) {
  if (reviews.length === 0) {
    return <p className="text-sm text-[var(--ink-faint)]">아직 모은 리뷰가 없어요.</p>;
  }
  const head = reviews.slice(0, initial);
  const rest = reviews.slice(initial);
  const item = (r: StoreReview) => <Review key={`${r.store}:${r.review_id}`} r={r} now={now} appNames={appNames} />;
  return (
    <>
      <ul className="divide-y divide-[var(--rule)]">{head.map(item)}</ul>
      {rest.length > 0 && (
        <details className="group border-t border-[var(--rule)]">
          <summary className="cursor-pointer list-none py-3 text-center text-sm font-semibold text-[var(--apps)] group-open:hidden">
            리뷰 {rest.length}개 더 보기
          </summary>
          <ul className="divide-y divide-[var(--rule)]">{rest.map(item)}</ul>
        </details>
      )}
    </>
  );
}

function Review({ r, now, appNames }: { r: StoreReview; now: Date; appNames?: Record<string, string> }) {
  return (
    <li className="py-3">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--ink-soft)]">
        <span className="admin-num font-semibold" style={{ color: r.rating <= 3 ? "var(--down)" : "var(--apps)" }}>
          {"★".repeat(r.rating)}
          <span className="opacity-25">{"★".repeat(5 - r.rating)}</span>
        </span>
        {appNames && <span className="font-semibold text-[var(--ink)]">{appNames[r.app_slug] ?? r.app_slug}</span>}
        <span>{STORE_LABELS[r.store]}</span>
        {r.version && <span className="admin-num">v{r.version}</span>}
        <span className="admin-num">{DAY.format(new Date(r.reviewed_at))}</span>
        {isNewReview(r, now) && (
          <span className="rounded bg-[var(--apps)] px-1.5 py-px text-[10px] font-semibold text-[var(--paper)]">새</span>
        )}
        {r.replied && <span className="text-[var(--ink-faint)]">답변함</span>}
      </p>
      {r.title && <p className="mt-1 text-sm font-semibold">{r.title}</p>}
      <p className="mt-0.5 text-sm leading-relaxed whitespace-pre-line">{r.body}</p>
      {r.author && <p className="mt-1 text-xs text-[var(--ink-faint)]">{r.author}</p>}
    </li>
  );
}
