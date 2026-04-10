"use client";

interface Command {
  command: string;
  desc: string;
}

interface Category {
  label: string;
  commands: Command[];
}

const categories: Category[] = [
  {
    label: "세션 관리",
    commands: [
      { command: "/clear", desc: "대화 초기화, 새 작업 시작" },
      { command: "/compact", desc: "대화 압축, 토큰 절약" },
      { command: "/resume", desc: "이전 세션 이어가기" },
      { command: "/rewind", desc: "체크포인트로 되감기" },
    ],
  },
  {
    label: "모델 & 성능",
    commands: [
      { command: "/model", desc: "세션 중 모델 전환" },
      { command: "/effort", desc: "추론 깊이 조절 (low~max)" },
    ],
  },
  {
    label: "개발 환경",
    commands: [
      { command: "/permissions", desc: "파일/셸 권한 관리" },
      { command: "/config", desc: "설정 확인 및 수정" },
      { command: "/install-github-app", desc: "GitHub 연동 설정" },
    ],
  },
  {
    label: "비용 & 확인",
    commands: [
      { command: "/cost", desc: "토큰 사용량 확인" },
      { command: "/diff", desc: "변경사항 확인 (턴별 뷰)" },
      { command: "/doctor", desc: "설치 상태 진단" },
    ],
  },
];

export default function ClaudeCodeCommandCard() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        Claude Code 필수 명령어
      </div>
      <div className="divide-y divide-border">
        {categories.map((cat) => (
          <div key={cat.label}>
            <div className="bg-card-bg px-5 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {cat.label}
              </span>
            </div>
            <div className="divide-y divide-border">
              {cat.commands.map((c) => (
                <div key={c.command} className="flex items-start gap-4 px-5 py-3">
                  <code className="shrink-0 rounded-md bg-tag-bg px-2 py-0.5 text-xs font-medium text-accent">
                    {c.command}
                  </code>
                  <span className="text-sm text-text-muted">{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
