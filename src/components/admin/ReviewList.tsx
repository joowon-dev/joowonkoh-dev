import { isNewReview, STORE_LABELS, type StoreReview } from "@/lib/admin/store";

const DAY = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" });

/** 스토어 리뷰. 처음 본 지 하루 안 된 건 「새」, 별 셋 이하는 눈에 띄게. */
export default function ReviewList({
  reviews,
  now,
  appNames,
}: {
  reviews: readonly StoreReview[];
  now: Date;
  /** 여러 앱을 섞어 보여 줄 때만 */
  appNames?: Record<string, string>;
}) {
  if (reviews.length === 0) {
    return <p className="text-sm text-[var(--ink-faint)]">아직 모은 리뷰가 없어요.</p>;
  }
  return (
    <ul className="divide-y divide-[var(--rule)]">
      {reviews.map((r) => (
        <li key={`${r.store}:${r.review_id}`} className="py-3">
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
      ))}
    </ul>
  );
}
