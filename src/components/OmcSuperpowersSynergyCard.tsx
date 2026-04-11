"use client";

interface Combo {
  omc: string;
  superpowers: string;
  result: string;
}

const combos: Combo[] = [
  {
    omc: "/autopilot",
    superpowers: "brainstorming + TDD",
    result: "자율 실행 + 규율 있는 개발 사이클",
  },
  {
    omc: "/team",
    superpowers: "write-plan + verify",
    result: "계획 기반 분업 + 단계별 검증",
  },
  {
    omc: "/ultrawork",
    superpowers: "code-review",
    result: "병렬 구현 + 완료 시 자동 리뷰",
  },
  {
    omc: "/ralph",
    superpowers: "systematic-debugging",
    result: "끈질긴 반복 + 체계적 원인 분석",
  },
  {
    omc: "/deep-interview",
    superpowers: "brainstorming",
    result: "깊은 질문 + 구조화된 설계 탐색",
  },
];

export default function OmcSuperpowersSynergyCard() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        OMC + Superpowers 시너지 조합
      </div>
      <div className="divide-y divide-border">
        {combos.map((c) => (
          <div key={c.omc} className="px-5 py-3">
            <div className="flex items-center gap-2">
              <code className="shrink-0 rounded-md bg-tag-bg px-2 py-0.5 text-xs font-medium text-accent">
                {c.omc}
              </code>
              <span className="text-xs text-text-muted">+</span>
              <span className="text-sm font-medium text-text-primary">
                {c.superpowers}
              </span>
            </div>
            <p className="mt-1 text-sm text-text-muted">{c.result}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
