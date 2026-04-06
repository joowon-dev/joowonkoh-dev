"use client";

interface Skill {
  command: string;
  name: string;
  desc: string;
}

const skills: Skill[] = [
  { command: "/brainstorm", name: "브레인스토밍", desc: "요구사항 정제, 설계 탐색" },
  { command: "/write-plan", name: "계획 수립", desc: "구현 계획을 단계별로 작성" },
  { command: "/tdd", name: "테스트 주도 개발", desc: "Red → Green → Refactor 사이클" },
  { command: "/debug", name: "체계적 디버깅", desc: "가설 → 검증 → 수정 루프" },
  { command: "/review", name: "코드 리뷰", desc: "변경 사항 검증, 품질 체크" },
  { command: "/verify", name: "완료 검증", desc: "작업 완료 전 증거 기반 확인" },
];

export default function SuperpowersSkillCard() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        Superpowers 핵심 스킬
      </div>
      <div className="divide-y divide-border">
        {skills.map((skill) => (
          <div key={skill.command} className="flex items-start gap-4 px-5 py-3">
            <code className="shrink-0 rounded-md bg-tag-bg px-2 py-0.5 text-xs font-medium text-accent">
              {skill.command}
            </code>
            <div className="min-w-0">
              <span className="text-sm font-medium text-text-primary">{skill.name}</span>
              <span className="ml-2 text-sm text-text-muted">{skill.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
