"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CHANNEL_LABEL, KIND_LABEL, MAX_TEXT, type SnsDraft } from "@/lib/admin/sns";
import { decideDraft, type DecideState } from "./actions";

const INITIAL: DecideState = { error: null, done: null };

/** 대기 중인 초안 한 장. 버튼 셋은 같은 폼의 submit 이라 JS 가 늦게 떠도 동작한다. */
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

  if (state.done) {
    return (
      <li className="rounded-xl border border-[var(--rule)] bg-[var(--paper-raised)] px-4 py-3 text-sm text-[var(--ink-soft)]">
        {draft.target_author ? `@${draft.target_author} · ` : ""}
        {state.done}
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-[var(--rule)] bg-[var(--paper-raised)] p-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--ink-soft)]">
        <span className="rounded bg-[var(--ink)] px-1.5 py-0.5 font-semibold text-[var(--paper)]">
          {CHANNEL_LABEL[draft.channel]}
        </span>
        <span>{KIND_LABEL[draft.kind]}</span>
        {draft.target_author && <span>@{draft.target_author}</span>}
        {left && <span className="ml-auto admin-num">남은 시간 {left}</span>}
      </div>

      {draft.target_summary && <p className="mt-2 text-sm text-[var(--ink-soft)]">{draft.target_summary}</p>}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block max-w-full truncate text-xs text-[var(--web)] underline underline-offset-2"
        >
          원글 열기
        </a>
      )}

      <p className="mt-3 whitespace-pre-wrap rounded-lg bg-[var(--paper)] px-3 py-2.5 text-[15px] leading-relaxed">
        {draft.draft_text}
      </p>
      {draft.note && <p className="mt-2 text-xs text-[var(--warn-ink)]">메모: {draft.note}</p>}

      <form action={action} className="mt-3">
        <input type="hidden" name="id" value={draft.id} />
        <div className="grid grid-cols-2 gap-2">
          <Submit value="approve" className="bg-[var(--apps)] text-white">
            승인
          </Submit>
          <Submit value="reject" className="border border-[var(--rule)] text-[var(--ink-soft)]">
            하지마
          </Submit>
        </div>

        <details className="mt-2">
          <summary className="cursor-pointer select-none py-1.5 text-sm text-[var(--ink-soft)]">고쳐서 승인</summary>
          <textarea
            name="text"
            defaultValue={draft.draft_text}
            maxLength={MAX_TEXT}
            rows={3}
            className="mt-1 w-full rounded-lg border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-[15px]"
          />
          <Submit value="edit" className="mt-2 w-full bg-[var(--ink)] text-[var(--paper)]">
            이 문구로 승인
          </Submit>
        </details>

        {state.error && (
          <p role="alert" className="mt-2 text-sm text-[var(--down)]">
            {state.error}
          </p>
        )}
      </form>
    </li>
  );
}

function Submit({ value, className, children }: { value: string; className: string; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="action"
      value={value}
      disabled={pending}
      className={`rounded-lg px-3 py-2.5 text-sm font-semibold disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
