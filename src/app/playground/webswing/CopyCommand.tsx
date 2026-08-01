"use client";

import { useState } from "react";

/**
 * The Gatekeeper workaround is a command people have to paste into Terminal,
 * and mistyping it is the most likely way the install goes wrong — so it gets
 * a copy button rather than asking anyone to transcribe it.
 */
export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-tag-bg p-3">
      <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[11px] text-text-secondary">
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg bg-card-bg px-2.5 py-1 text-[11px] font-medium text-text-secondary spring-transition hover:text-accent active:scale-95"
        aria-label="명령어 복사"
      >
        {copied ? "복사됨" : "복사"}
      </button>
    </div>
  );
}
