import { Notice, Panel } from "@/components/admin/ui";
import { loadSnsDrafts, settle } from "@/lib/admin/queries";
import {
  CHANNEL_LABEL,
  effectiveStatus,
  KIND_LABEL,
  safeHref,
  type SnsDraft,
  splitDrafts,
  STATUS_LABEL,
  timeLeft,
} from "@/lib/admin/sns";
import DraftCard from "./DraftCard";

export const runtime = "edge";

export default async function SnsPage() {
  const now = new Date();
  const drafts = await settle(loadSnsDrafts(now), [] as SnsDraft[]);
  const { pending, done } = splitDrafts(drafts.value, now);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">SNS 승인</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Claude 가 쓴 댓글·답글이에요. 승인한 것만 Claude 가 다음 확인 때 올려요. 2시간이 지나면 만료돼요.
        </p>
      </header>

      {drafts.error && <Notice>초안을 불러오지 못했어요: {drafts.error}</Notice>}

      <Panel title={`승인 대기 ${pending.length}`}>
        {pending.length === 0 ? (
          <p className="text-sm text-[var(--ink-faint)]">지금은 결정할 게 없어요.</p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {pending.map((d) => (
              <DraftCard key={d.id} draft={d} href={safeHref(d.target_url)} left={timeLeft(d.expires_at, now)} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="최근 7일">
        {done.length === 0 ? (
          <p className="text-sm text-[var(--ink-faint)]">아직 기록이 없어요.</p>
        ) : (
          <ul className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
            {done.map((d) => (
              <DoneRow key={d.id} draft={d} now={now} />
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

function DoneRow({ draft, now }: { draft: SnsDraft; now: Date }) {
  const status = effectiveStatus(draft, now);
  const posted = safeHref(draft.posted_url);
  const tone =
    status === "posted" ? "text-[var(--up)]" : status === "failed" ? "text-[var(--down)]" : "text-[var(--ink-faint)]";

  return (
    <li className="py-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-2 text-xs text-[var(--ink-soft)]">
        <span className={`font-semibold ${tone}`}>{STATUS_LABEL[status]}</span>
        <span>{CHANNEL_LABEL[draft.channel]}</span>
        <span>{KIND_LABEL[draft.kind]}</span>
        {draft.target_author && <span>@{draft.target_author}</span>}
        {posted && (
          <a href={posted} target="_blank" rel="noopener noreferrer" className="text-[var(--web)] underline underline-offset-2">
            올린 글
          </a>
        )}
      </div>
      <p className="mt-1 whitespace-pre-wrap">{draft.final_text ?? draft.draft_text}</p>
      {draft.error && <p className="mt-1 text-xs text-[var(--down)]">{draft.error}</p>}
    </li>
  );
}
