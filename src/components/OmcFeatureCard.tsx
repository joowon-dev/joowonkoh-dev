"use client";

interface Feature {
  command: string;
  name: string;
  desc: string;
}

const features: Feature[] = [
  { command: "/autopilot", name: "오토파일럿", desc: "아이디어 → 완성 코드까지 자율 실행" },
  { command: "/ultrawork", name: "울트라워크", desc: "병렬 에이전트로 고속 작업 처리" },
  { command: "/team", name: "팀 모드", desc: "N개 에이전트가 작업 목록 공유하며 협업" },
  { command: "/deep-interview", name: "딥 인터뷰", desc: "소크라테스식 질문으로 요구사항 정제" },
  { command: "/ralph", name: "랄프", desc: "목표 달성까지 자기 참조 루프 반복" },
  { command: "/trace", name: "트레이스", desc: "경쟁 가설 기반 증거 추적 디버깅" },
];

export default function OmcFeatureCard() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        OMC 핵심 모드
      </div>
      <div className="divide-y divide-border">
        {features.map((f) => (
          <div key={f.command} className="flex items-start gap-4 px-5 py-3">
            <code className="shrink-0 rounded-md bg-tag-bg px-2 py-0.5 text-xs font-medium text-accent">
              {f.command}
            </code>
            <div className="min-w-0">
              <span className="text-sm font-medium text-text-primary">{f.name}</span>
              <span className="ml-2 text-sm text-text-muted">{f.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
