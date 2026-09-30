import type { FreshnessProblem } from "@/lib/admin/freshness";
import { SOURCE_LABELS } from "@/lib/admin/types";
import { Notice } from "./ui";

/** 낡은 숫자를 표시 없이 보여 주지 않는다. 수집이 밀린 소스가 있으면 모든 화면 위에 뜬다. */
export default function FreshnessBanner({
  problems,
}: {
  problems: readonly FreshnessProblem[];
}) {
  if (problems.length === 0) return null;

  return (
    <Notice>
      <p className="font-semibold">수집이 밀린 소스가 있어요</p>
      <ul className="mt-1 space-y-0.5">
        {problems.map((problem) => (
          <li key={problem.source}>
            {SOURCE_LABELS[problem.source]}: {describe(problem)}
          </li>
        ))}
      </ul>
    </Notice>
  );
}

function describe(problem: FreshnessProblem): string {
  switch (problem.reason) {
    case "never":
      return "아직 연결 전이라 수집한 적이 없어요";
    case "stale":
      return `마지막 수집이 ${Math.floor(problem.hoursSince ?? 0)}시간 전이에요`;
    case "error":
      return `마지막 시도가 실패했어요${problem.error ? ` (${problem.error})` : ""}`;
  }
}
