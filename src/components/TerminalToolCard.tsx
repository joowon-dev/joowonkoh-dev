"use client";

interface Tool {
  name: string;
  replaces: string;
  desc: string;
  lang: string;
}

const tools: Tool[] = [
  { name: "Starship", replaces: "Oh My Zsh", desc: "크로스쉘 프롬프트, 시작 5~15ms", lang: "Rust" },
  { name: "zoxide", replaces: "cd", desc: "방문 빈도 학습, 경로 점프", lang: "Rust" },
  { name: "fzf", replaces: "Ctrl+R", desc: "퍼지 검색, 파일/히스토리/브랜치", lang: "Go" },
  { name: "ripgrep", replaces: "grep", desc: "초고속 코드 검색, .gitignore 자동 무시", lang: "Rust" },
  { name: "bat", replaces: "cat", desc: "구문 강조, 줄번호, Git diff 표시", lang: "Rust" },
  { name: "eza", replaces: "ls", desc: "아이콘, 트리뷰, Git 상태 표시", lang: "Rust" },
  { name: "lazygit", replaces: "git CLI", desc: "터미널 Git UI, staging/rebase/log", lang: "Go" },
  { name: "Atuin", replaces: "history", desc: "SQLite 기반 히스토리, 디바이스 동기화", lang: "Rust" },
];

export default function TerminalToolCard() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        2026 터미널 생산성 도구
      </div>
      <div className="divide-y divide-border">
        {tools.map((t) => (
          <div key={t.name} className="flex items-start gap-4 px-5 py-3">
            <div className="shrink-0 text-right" style={{ minWidth: "5.5rem" }}>
              <span className="text-sm font-medium text-text-primary">{t.name}</span>
              <div className="mt-0.5 text-[11px] text-text-muted">{t.lang}</div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <code className="rounded-md bg-tag-bg px-1.5 py-0.5 text-[11px] font-medium text-accent">
                  {t.replaces}
                </code>
                <span className="text-xs text-text-muted">대체</span>
              </div>
              <p className="mt-0.5 text-sm text-text-muted">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
