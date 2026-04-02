"use client";

import PlanCard from "./PlanCard";

export default function ClaudeCodePlanCard() {
  return (
    <PlanCard
      plans={[
        { name: "Free", price: "무료", available: false },
        { name: "Pro", price: "$20/월", available: true, highlight: true, note: "최소 조건" },
        { name: "Max 5x", price: "$100/월", available: true, note: "5배 사용량" },
        { name: "Max 20x", price: "$200/월", available: true, note: "20배 사용량" },
      ]}
    />
  );
}
