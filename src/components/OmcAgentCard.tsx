"use client";

interface Agent {
  name: string;
  role: string;
  model: string;
}

const agents: Agent[] = [
  { name: "architect", role: "아키텍처 설계 및 디버깅 조언", model: "Opus" },
  { name: "code-reviewer", role: "심각도 등급별 코드 리뷰", model: "Opus" },
  { name: "debugger", role: "근본 원인 분석, 스택 트레이스 해석", model: "Sonnet" },
  { name: "executor", role: "구현 작업 집중 실행", model: "Sonnet" },
  { name: "designer", role: "UI/UX 디자인 및 구현", model: "Sonnet" },
  { name: "test-engineer", role: "테스트 전략, TDD 워크플로우", model: "Sonnet" },
  { name: "planner", role: "전략적 계획 수립", model: "Opus" },
  { name: "writer", role: "기술 문서, README 작성", model: "Haiku" },
];

const modelColor: Record<string, string> = {
  Opus: "text-orange-400",
  Sonnet: "text-blue-400",
  Haiku: "text-green-400",
};

export default function OmcAgentCard() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        OMC 전문 에이전트
      </div>
      <div className="divide-y divide-border">
        {agents.map((a) => (
          <div key={a.name} className="flex items-center gap-4 px-5 py-3">
            <code className="shrink-0 rounded-md bg-tag-bg px-2 py-0.5 text-xs font-medium text-text-primary">
              {a.name}
            </code>
            <span className="flex-1 text-sm text-text-muted">{a.role}</span>
            <span className={`shrink-0 text-xs font-medium ${modelColor[a.model]}`}>
              {a.model}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
