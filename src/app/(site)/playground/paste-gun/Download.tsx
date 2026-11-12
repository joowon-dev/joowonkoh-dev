"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { LATEST, RELEASES } from "./releases";

/**
 * 받기. 온 사람의 OS 탭을 먼저 열어 주고, 직접 누른 선택이 그다음부터 이긴다
 * (치이카와 페이지의 Download 와 같은 동작). 첫 화면의 「윈도우에서 받기」는
 * `#windows` 로 와서 윈도우 탭을 연다.
 *
 * 치이카와·상어와 다른 것 하나: **윈도우에서 런타임을 따로 깔라고 시키지 않는다.**
 * 설치 파일이 없을 때만 받아서 깐다(paste-gun 의 windows/installer.iss).
 */

type Platform = "mac" | "windows";

let detectedCache: Platform | null = null;
function detectPlatform(): Platform {
  if (detectedCache === null) {
    const hint = `${navigator.userAgent} ${navigator.platform ?? ""}`;
    detectedCache = /Win/i.test(hint) && !/Mac|iPhone|iPad|iPod/i.test(hint) ? "windows" : "mac";
  }
  return detectedCache;
}
const subscribeNever = () => () => {};

export function useDetectedPlatform() {
  return useSyncExternalStore(subscribeNever, detectPlatform, () => "mac" as Platform);
}

type Step = { title: string; body: string; link?: { href: string; label: string; note: string; external?: boolean } };

const MAC_STEPS: Step[] = [
  {
    title: "dmg를 열고 Applications로 끌어 넣어요",
    body: "창이 하나 뜨고 Applications 폴더가 옆에 서 있어요. Paste Gun을 그 위로 끌어 놓으면 끝이에요. 애플 공증을 받은 앱이라 경고 없이 열려요.",
  },
  {
    title: "손쉬운 사용 권한을 켜요",
    body: "처음 켜면 권한을 물어봐요. 시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용에서 Paste Gun을 켜 주세요. 다른 앱에 글자를 넣으려면 꼭 필요해요. 권한이 없는 동안은 화면에 그렇다고 적혀 있어요.",
  },
  {
    title: "아무거나 복사하고 ⌘V",
    body: "복사한 글이 탄창에 들어가고, ⌘V를 누르면 총이 커서로 날아와 쏴요. 복사한 것이 없으면 평소 붙여넣기 그대로예요.",
  },
  {
    title: "메뉴 막대에서 총 아이콘을 찾아요",
    body: "Dock에는 없어요. 무기고, HUD 숨기기, 로그인할 때 켜기, 제거, 종료가 전부 여기 있어요. 총은 ⌥⇧G, 탄창은 ⌥⇧M으로 바꿔요.",
  },
];

const WIN_STEPS: Step[] = [
  {
    title: "설치 파일을 받아서 실행해요",
    body: "서명이 없어서 SmartScreen이 한 번 막아요. 「추가 정보」 → 「실행」을 누르면 돼요. 앱이 쓰는 .NET 런타임이 없는 PC면 설치 파일이 알아서 받아 깔아요(약 60MB, 그때 관리자 확인이 한 번 떠요).",
    link: {
      href: LATEST.windows.href,
      label: "붙여넣기 총 설치 파일",
      note: `${LATEST.version} · ${LATEST.windows.size} · Windows 10 1809 이상 · 64비트`,
    },
  },
  {
    title: "아무거나 복사하고 Ctrl+V",
    body: "복사한 글이 탄창에 들어가고, Ctrl+V를 누르면 총이 쏴요. 복사한 것이 없으면 평소 붙여넣기 그대로예요.",
  },
  {
    title: "알림 영역에서 총 아이콘을 찾아요",
    body: "윈도우 11은 새 아이콘을 숨겨 둬요. 시계 옆 ^ 를 눌러 꺼내 두세요. 무기고는 Alt+Shift+A, 총은 Alt+Shift+G, 탄창은 Alt+Shift+M이에요.",
  },
  {
    title: "지울 때는 「설정 → 앱」이나 아이콘 메뉴에서",
    body: "「붙여넣기 총 제거…」를 누르면 앱과 저장한 탄창까지 깨끗이 지워져요.",
  },
];

export default function Download() {
  const detected = useDetectedPlatform();
  const [chosen, setChosen] = useState<Platform | null>(null);
  const platform = chosen ?? detected;

  // 첫 화면에서 「윈도우에서 받기」를 누르고 왔다.
  useEffect(() => {
    const read = () => {
      if (window.location.hash === "#windows") setChosen("windows");
      if (window.location.hash === "#mac") setChosen("mac");
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  return (
    <div>
      <div role="tablist" aria-label="운영체제" className="inline-flex gap-1 rounded-[12px] bg-[#e9ecf1] p-1">
        {(["mac", "windows"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={platform === p}
            aria-controls={`pg-panel-${p}`}
            onClick={() => setChosen(p)}
            className={`rounded-[9px] px-5 py-2 text-[15px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d8a23c] ${
              platform === p ? "bg-white text-[#1a212c] shadow-[0_2px_8px_-2px_rgba(26,33,44,0.3)]" : "text-[#1a212c]/55 hover:text-[#1a212c]"
            }`}
          >
            {p === "mac" ? "macOS" : "Windows"}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="pg-panel-mac" hidden={platform !== "mac"} className="mt-6">
        <a
          href={LATEST.mac.href}
          download
          className="group flex items-center justify-between gap-4 rounded-[18px] bg-[#161d28] px-6 py-5 text-[#e8ecf1] shadow-[0_18px_34px_-18px_rgba(16,21,29,0.8)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d8a23c]"
        >
          <span>
            <span className="pg-display block text-[22px] leading-tight">맥에서 받기</span>
            <span className="mt-1 block text-[13px] text-[#e8ecf1]/70">
              {LATEST.version}, {LATEST.mac.size}. macOS 13 이상, Apple Silicon과 Intel 모두. 애플 공증.
            </span>
          </span>
          <span aria-hidden className="shrink-0 pg-num rounded-[9px] bg-[#d8a23c] px-4 py-2 text-[15px] text-[#10151d]">
            dmg
          </span>
        </a>
        <Steps steps={MAC_STEPS} />
      </div>

      <div role="tabpanel" id="pg-panel-windows" hidden={platform !== "windows"} className="mt-6">
        <Steps steps={WIN_STEPS} />
        <p className="mt-6 text-[13px] leading-relaxed text-[#1a212c]/60">
          설치 없이 폴더째 쓰고 싶으면{" "}
          <a href={LATEST.windowsZip.href} download className="font-semibold text-[#1a212c] underline underline-offset-4">
            압축본({LATEST.windowsZip.size})
          </a>
          을 받아도 돼요. 대신 자동 업데이트는 설치본만 돼요.
        </p>
      </div>

      <History />
    </div>
  );
}

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-6 space-y-5">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-4">
          <span className="pg-num mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#161d28] text-[15px] text-[#ffd682]">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold text-[#1a212c]">{s.title}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-[#1a212c]/70 break-keep">{s.body}</p>
            {s.link && (
              <a
                href={s.link.href}
                {...(s.link.external ? { target: "_blank", rel: "noreferrer noopener" } : { download: true })}
                className="mt-3 flex items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(26,33,44,0.12)] transition hover:shadow-[0_0_0_2px_#d8a23c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d8a23c]"
              >
                <span>
                  <span className="block text-[14px] font-semibold text-[#1a212c]">{s.link.label}</span>
                  <span className="mt-0.5 block text-[12px] text-[#1a212c]/55">{s.link.note}</span>
                </span>
                <span className="shrink-0 rounded-[8px] bg-[#161d28] px-3 py-1.5 text-[12px] font-semibold text-[#ffd682]">
                  받기
                </span>
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** 지난 버전. 기본은 접어 둔다 — 대부분은 최신만 받으면 된다. */
function History() {
  return (
    <details className="group mt-10 rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(26,33,44,0.1)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-semibold text-[#1a212c]">달라진 것 보기</span>
        <span aria-hidden className="text-[#1a212c]/50 transition group-open:rotate-180">▾</span>
      </summary>
      <ul className="border-t border-[#1a212c]/10">
        {RELEASES.map((r) => (
          <li key={r.version} className="px-5 py-4">
            <p className="text-[15px] font-semibold text-[#1a212c]">
              {r.version}{" "}
              <time dateTime={r.date} className="ml-1 text-[13px] font-normal text-[#1a212c]/55">
                {r.date}
              </time>
            </p>
            <ul className="mt-2 space-y-1.5">
              {r.notes.map((n) => (
                <li key={n} className="text-[14px] leading-relaxed text-[#1a212c]/70 break-keep">
                  {n}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
              <a href={r.mac.href} download className="rounded-[8px] bg-[#e9ecf1] px-3 py-1.5 font-semibold text-[#1a212c]">
                macOS {r.mac.size}
              </a>
              <a href={r.windows.href} download className="rounded-[8px] bg-[#e9ecf1] px-3 py-1.5 font-semibold text-[#1a212c]">
                Windows {r.windows.size}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}
