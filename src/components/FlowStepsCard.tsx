"use client";

interface Step {
  num: string;
  label: string;
  desc: string;
}

interface FlowStepsCardProps {
  title: string;
  steps: Step[];
}

export default function FlowStepsCard({ title, steps = [] }: FlowStepsCardProps) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        {title}
      </div>
      <div className="divide-y divide-border">
        {steps.map((step, idx) => (
          <div key={step.num} className="flex items-center gap-4 px-5 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
              {step.num}
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
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
