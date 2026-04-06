"use client";

const steps = [
  { num: "1", label: "브레인스토밍", desc: "뭘 만들지 정리" },
  { num: "2", label: "계획 수립", desc: "어떻게 만들지 설계" },
  { num: "3", label: "TDD 구현", desc: "테스트 먼저, 코드는 그 다음" },
  { num: "4", label: "코드 리뷰", desc: "변경 사항 검증" },
  { num: "5", label: "완료 검증", desc: "증거 기반으로 확인" },
];

export default function SuperpowersFlowCard() {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        Superpowers 워크플로우
      </div>
      <div className="flex flex-col gap-0 divide-y divide-border">
        {steps.map((step, idx) => (
          <div key={step.num} className="flex items-center gap-4 px-5 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
              {step.num}
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-sm font-medium text-text-primary">{step.label}</span>
              <span className="text-sm text-text-muted">{step.desc}</span>
            </div>
            {idx < steps.length - 1 && (
              <span className="ml-auto text-text-muted/40">↓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
