"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { CHANNEL_LABEL, KIND_LABEL, MAX_TEXT, type SnsDraft } from "@/lib/admin/sns";
import { decideDraft, type DecideState } from "./actions";

const INITIAL: DecideState = { error: null, done: null };

/**
 * 대기 중인 초안 한 장. 문구는 처음부터 고칠 수 있게 열어 둔다.
 * [승인] 은 지금 칸에 있는 문구를 보낸다. 초안과 다르면 DB 가 "고쳐서 승인" 으로 적는다.
 */
export default function DraftCard({
  draft,
  href,
  left,
}: {
  draft: SnsDraft;
  href: string | null;
  left: string | null;
}) {
  const [state, action] = useActionState(decideDraft, INITIAL);
  const [text, setText] = useState(draft.draft_text);
  const edited = text.trim() !== draft.draft_text;

  if (state.done) {
    return (
      <li className="flex items-center rounded-xl border border-[var(--rule)] bg-[var(--paper-raised)] px-4 py-3 text-sm text-[var(--ink-soft)]">
        {draft.target_author ? `@${draft.target_author} · ` : ""}
        {state.done}
      </li>
    );
  }

  return (
    <li className="flex flex-col rounded-xl border border-[var(--rule)] bg-[var(--paper-raised)] p-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--ink-soft)]">
        <span className="rounded bg-[var(--ink)] px-1.5 py-0.5 font-semibold text-[var(--paper)]">
          {CHANNEL_LABEL[draft.channel]}
        </span>
        <span>{KIND_LABEL[draft.kind]}</span>
        {draft.target_author && <span>@{draft.target_author}</span>}
        {left && <span className="admin-num ml-auto">남은 시간 {left}</span>}
      </div>

      {draft.target_summary && <p className="mt-2 text-sm text-[var(--ink-soft)]">{draft.target_summary}</p>}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block max-w-full self-start truncate text-xs text-[var(--web)] underline underline-offset-2"
        >
          원글 열기
        </a>
      )}

      <form action={action} className="mt-3 flex flex-1 flex-col">
        <input type="hidden" name="id" value={draft.id} />
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_TEXT}
          rows={Math.min(6, Math.max(2, Math.ceil(text.length / 28)))}
          aria-label="올릴 문구"
          className={`w-full resize-y rounded-lg border bg-[var(--paper)] px-3 py-2.5 text-[15px] leading-relaxed ${
            edited ? "border-[var(--ink)]" : "border-[var(--rule)]"
          }`}
        />
        <div className="mt-1 flex min-h-5 items-center justify-between text-xs text-[var(--ink-faint)]">
          {edited ? (
            <>
              <span className="text-[var(--ink-soft)]">고친 문구로 올라가요</span>
              <button type="button" onClick={() => setText(draft.draft_text)} className="underline underline-offset-2">
                원래대로
              </button>
            </>
          ) : (
            <span>눌러서 바로 고칠 수 있어요</span>
          )}
        </div>
        {draft.note && <p className="mt-1 text-xs text-[var(--warn-ink)]">메모: {draft.note}</p>}

        <div className="mt-auto grid grid-cols-[2fr_1fr] gap-2 pt-3">
          <Submit value="approve" disabled={!text.trim()} className="bg-[var(--apps)] text-[var(--paper)]">
            {edited ? "고쳐서 승인" : "승인"}
          </Submit>
          <Submit value="reject" className="border border-[var(--rule)] text-[var(--ink-soft)]">
            하지마
          </Submit>
        </div>

        {state.error && (
          <p role="alert" className="mt-2 text-sm text-[var(--down)]">
            {state.error}
          </p>
        )}
      </form>
    </li>
  );
}

function Submit({
  value,
  className,
  disabled = false,
  children,
}: {
  value: string;
  className: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="action"
      value={value}
      disabled={pending || disabled}
      className={`rounded-lg px-3 py-2.5 text-sm font-semibold disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
