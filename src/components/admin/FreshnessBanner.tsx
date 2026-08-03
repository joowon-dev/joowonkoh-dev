import type { FreshnessProblem } from "@/lib/admin/freshness";
import { SOURCE_LABELS } from "@/lib/admin/types";

export default function FreshnessBanner({
  problems,
}: {
  problems: readonly FreshnessProblem[];
}) {
  if (problems.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-xs text-amber-200">
      <p className="font-medium">수집이 밀린 소스가 있습니다</p>
      <ul className="mt-2 space-y-1 text-amber-200/80">
        {problems.map((problem) => (
          <li key={problem.source}>
            {SOURCE_LABELS[problem.source]} — {describe(problem)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function describe(problem: FreshnessProblem): string {
  switch (problem.reason) {
    case "never":
      return "아직 한 번도 수집되지 않았습니다";
    case "stale":
      return `마지막 성공이 ${Math.floor(problem.hoursSince ?? 0)}시간 전입니다`;
    case "error":
      return `마지막 시도 실패${problem.error ? ` (${problem.error})` : ""}`;
  }
}
