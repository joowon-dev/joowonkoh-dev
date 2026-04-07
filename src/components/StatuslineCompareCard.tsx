"use client";

import CompareCard from "./CompareCard";

export default function StatuslineCompareCard() {
  return (
    <CompareCard
      headers={["설정 방식", "특징"]}
      items={[
        { label: "/statusline 명령어", values: ["자연어로 설명하면 자동 생성", "가장 간편, 빠른 시작에 적합"] },
        { label: "settings.json 인라인", values: ["jq 한 줄로 간단하게 설정", "별도 파일 없이 바로 적용"] },
        { label: "외부 스크립트 파일", values: ["~/.claude/statusline.sh에 작성", "복잡한 로직, 색상, 멀티라인 가능"] },
      ]}
    />
  );
}
