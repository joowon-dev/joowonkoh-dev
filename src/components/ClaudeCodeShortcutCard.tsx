"use client";

interface Shortcut {
  key: string;
  desc: string;
}

const shortcuts: Shortcut[] = [
  { key: "!", desc: "bash 명령어 직접 실행 (토큰 비용 0)" },
  { key: "@", desc: "파일 참조 (퍼지 매칭, 라인 지정)" },
  { key: "Esc", desc: "현재 작업 중단" },
  { key: "Esc+Esc", desc: "되감기 메뉴 (4가지 복원 옵션)" },
  { key: "Shift+Tab", desc: "권한 모드 순환" },
  { key: "Ctrl+R", desc: "프롬프트 히스토리 검색" },
  { key: "Ctrl+G", desc: "외부 에디터에서 프롬프트 작성" },
  { key: "Ctrl+V", desc: "이미지 붙여넣기 (macOS)" },
];

export default function ClaudeCodeShortcutCard() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        숨은 기능 & 단축키
      </div>
      <div className="divide-y divide-border">
        {shortcuts.map((s) => (
          <div key={s.key} className="flex items-start gap-4 px-5 py-3">
            <code className="shrink-0 rounded-md bg-tag-bg px-2 py-0.5 text-xs font-medium text-accent">
              {s.key}
            </code>
            <span className="text-sm text-text-muted">{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
