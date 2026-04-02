"use client";

import CompareCard from "./CompareCard";

export default function ClaudeCodeCompareCard() {
  return (
    <CompareCard
      headers={["macOS", "Windows"]}
      items={[
        { label: "설치 명령어", values: ["curl -fsSL https://claude.ai/install.sh | bash", "irm https://claude.ai/install.ps1 | iex"] },
        { label: "사전 준비", values: ["없음", "Git for Windows"] },
        { label: "최소 OS", values: ["macOS 13.0", "Windows 10 (1809+)"] },
        { label: "최소 RAM", values: ["4GB", "4GB"] },
        { label: "최소 요금제", values: ["Pro ($20/월)", "Pro ($20/월)"] },
      ]}
    />
  );
}
