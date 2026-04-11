"use client";

interface Command {
  command: string;
  desc: string;
}

interface Stage {
  label: string;
  emoji: string;
  commands: Command[];
}

const stages: Stage[] = [
  {
    label: "프로젝트 시작",
    emoji: "1",
    commands: [
      { command: "git init", desc: "새 저장소 초기화" },
      { command: "git clone", desc: "원격 저장소 복사 (--depth 1 가능)" },
      { command: "git remote", desc: "원격 저장소 추가/변경/확인" },
    ],
  },
  {
    label: "브랜치 전략",
    emoji: "2",
    commands: [
      { command: "git branch", desc: "브랜치 생성/삭제/목록" },
      { command: "git switch", desc: "브랜치 전환 (checkout 대체)" },
      { command: "git merge", desc: "브랜치 병합" },
      { command: "git rebase", desc: "커밋 히스토리 재배치" },
    ],
  },
  {
    label: "일상 워크플로우",
    emoji: "3",
    commands: [
      { command: "git status", desc: "작업 트리 상태 확인" },
      { command: "git add", desc: "스테이징 (-p로 부분 추가)" },
      { command: "git commit", desc: "커밋 (--amend로 수정)" },
      { command: "git pull", desc: "원격 변경사항 가져오기" },
      { command: "git push", desc: "로컬 커밋 원격에 반영" },
      { command: "git stash", desc: "작업 임시 저장/복원" },
    ],
  },
  {
    label: "히스토리 탐색",
    emoji: "4",
    commands: [
      { command: "git log", desc: "커밋 이력 조회 (--oneline --graph)" },
      { command: "git diff", desc: "변경사항 비교" },
      { command: "git show", desc: "특정 커밋 상세 확인" },
      { command: "git blame", desc: "줄별 마지막 수정자 추적" },
    ],
  },
  {
    label: "위기 탈출",
    emoji: "5",
    commands: [
      { command: "git restore", desc: "파일 변경 되돌리기" },
      { command: "git reset", desc: "커밋 되돌리기 (soft/mixed/hard)" },
      { command: "git revert", desc: "커밋 취소 (새 커밋 생성)" },
      { command: "git reflog", desc: "모든 HEAD 이동 기록 조회" },
      { command: "git cherry-pick", desc: "특정 커밋만 가져오기" },
    ],
  },
  {
    label: "GitHub CLI",
    emoji: "6",
    commands: [
      { command: "gh auth login", desc: "GitHub 인증" },
      { command: "gh repo create", desc: "레포 생성 (로컬+리모트)" },
      { command: "gh pr create", desc: "PR 생성" },
      { command: "gh pr merge", desc: "PR 머지 (--squash 등)" },
      { command: "gh issue create", desc: "이슈 생성" },
      { command: "gh run watch", desc: "CI 실행 실시간 모니터링" },
    ],
  },
];

export default function GitCommandCard() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        Git & GitHub CLI 명령어 30선 — 워크플로우 순서
      </div>
      <div className="divide-y divide-border">
        {stages.map((stage) => (
          <div key={stage.label}>
            <div className="bg-card-bg px-5 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {stage.emoji}. {stage.label}
              </span>
            </div>
            <div className="divide-y divide-border">
              {stage.commands.map((c) => (
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
