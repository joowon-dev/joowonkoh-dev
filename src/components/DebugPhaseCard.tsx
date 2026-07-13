"use client";

interface Phase {
  num: string;
  title: string;
  activity: string;
  success: string;
}

interface DebugPhaseCardProps {
  phases: Phase[];
}

export default function DebugPhaseCard({ phases = [] }: DebugPhaseCardProps) {
  if (!phases || phases.length === 0) return null;
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
      <div className="bg-accent-soft px-5 py-3 text-center text-sm font-semibold text-text-primary">
        systematic-debugging · 4단계
      </div>
      <div className="divide-y divide-border">
        {phases.map((phase, idx) => (
          <div key={phase.num} className="flex items-start gap-4 px-5 py-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
              {phase.num}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">{phase.title}</span>
                {idx < phases.length - 1 && (
                  <span className="text-text-muted/40">↓</span>
                )}
              </div>
              <p className="mt-1 text-sm text-text-secondary">{phase.activity}</p>
              <p className="mt-1.5 text-[13px] text-text-muted">
                <span className="font-medium text-accent">통과 기준</span> · {phase.success}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
