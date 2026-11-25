"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { LATEST, RELEASES } from "./releases";

/**
 * 받기. 온 사람의 OS 탭을 먼저 열어 주고, 직접 누른 선택이 그다음부터 이긴다
 * (붙여넣기 총 페이지의 Download 와 같은 동작). 첫 화면의 「윈도우에서 받기」는
 * `#windows` 로 와서 윈도우 탭을 연다.
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
    body: "창이 하나 뜨고 Applications 폴더가 옆에 서 있어요. Desktop Tree를 그 위로 끌어 놓으면 끝이에요. 애플 공증을 받은 앱이라 경고 없이 열려요.",
  },
  {
    title: "켜면 화면 구석에 트리가 서요",
    body: "지금 떠 있는 창마다 빨강·노랑·초록 방울이 하나씩, 트리 여기저기에 달려요. 방울에 마우스를 올리면 어느 앱의 창인지 이름표가 떠요.",
  },
  {
    title: "처음 방울을 누를 때 손쉬운 사용 권한을 켜요",
    body: "시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용에서 Desktop Tree를 켜 주세요. 다른 앱의 창을 닫고 키우려면 꼭 필요해요. 권한이 없어도 트리와 방울은 그대로 보여요.",
  },
  {
    title: "메뉴 막대에서 트리 아이콘을 찾아요",
    body: "Dock에는 없어요. 숨기기, 꼬마전구 반짝임, 크기, 로그인할 때 켜기, 제거, 종료가 전부 여기 있어요. 트리는 잡고 끌면 옮겨져요.",
  },
];

const WIN_STEPS: Step[] = [
  {
    title: "설치 파일을 받아서 실행해요",
    body: "서명이 없어서 SmartScreen이 한 번 막아요. 「추가 정보」 → 「실행」을 누르면 돼요. 앱이 쓰는 .NET 런타임이 없는 PC면 설치 파일이 알아서 받아 깔아요(약 60MB, 그때 관리자 확인이 한 번 떠요).",
    link: {
      href: LATEST.windows.href,
      label: "바탕화면 트리 설치 파일",
      note: `${LATEST.version} · ${LATEST.windows.size} · Windows 10 1809 이상 · 64비트`,
    },
  },
  {
    title: "켜면 화면 구석에 트리가 서요",
    body: "작업 표시줄에 보이는 창마다 방울 셋이 달려요. 빨강은 닫기, 노랑은 최소화, 초록은 최대화예요. 권한은 필요 없어요.",
  },
  {
    title: "알림 영역에서 트리 아이콘을 찾아요",
    body: "윈도우 11은 새 아이콘을 숨겨 둬요. 시계 옆 ^ 를 눌러 꺼내 두세요. 숨기기, 크기, 종료가 여기 있어요. 트리는 잡고 끌면 옮겨져요.",
  },
  {
    title: "지울 때는 「설정 → 앱」이나 아이콘 메뉴에서",
    body: "「바탕화면 트리 제거…」를 누르면 앱과 설정까지 깨끗이 지워져요.",
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
      <div role="tablist" aria-label="운영체제" className="inline-flex gap-1 rounded-[12px] bg-[#e7ebf2] p-1">
        {(["mac", "windows"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={platform === p}
            aria-controls={`dt-panel-${p}`}
            onClick={() => setChosen(p)}
            className={`rounded-[9px] px-5 py-2 text-[15px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2ab3f] ${
              platform === p ? "bg-white text-[#16203a] shadow-[0_2px_8px_-2px_rgba(22,32,58,0.3)]" : "text-[#16203a]/55 hover:text-[#16203a]"
            }`}
          >
            {p === "mac" ? "macOS" : "Windows"}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="dt-panel-mac" hidden={platform !== "mac"} className="mt-6">
        <a
          href={LATEST.mac.href}
          download
          className="group flex items-center justify-between gap-4 rounded-[18px] bg-[#141d33] px-6 py-5 text-[#eef2f8] shadow-[0_18px_34px_-18px_rgba(13,20,36,0.8)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e2ab3f]"
        >
          <span>
            <span className="dt-display block text-[22px] leading-tight">맥에서 받기</span>
            <span className="mt-1 block text-[13px] text-[#eef2f8]/70">
              {LATEST.version}, {LATEST.mac.size}. macOS 13 이상, Apple Silicon과 Intel 모두. 애플 공증.
            </span>
          </span>
          <span aria-hidden className="shrink-0 rounded-[9px] bg-[#e2ab3f] px-4 py-2 text-[15px] text-[#0d1424]">
            dmg
          </span>
        </a>
        <Steps steps={MAC_STEPS} />
      </div>

      <div role="tabpanel" id="dt-panel-windows" hidden={platform !== "windows"} className="mt-6">
        <Steps steps={WIN_STEPS} />
        <p className="mt-6 text-[13px] leading-relaxed text-[#16203a]/60">
          설치 없이 폴더째 쓰고 싶으면{" "}
          <a href={LATEST.windowsZip.href} download className="font-semibold text-[#16203a] underline underline-offset-4">
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
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[#141d33] text-[15px] text-[#ffe9a8]">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold text-[#16203a]">{s.title}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-[#16203a]/70 break-keep">{s.body}</p>
            {s.link && (
              <a
                href={s.link.href}
                {...(s.link.external ? { target: "_blank", rel: "noreferrer noopener" } : { download: true })}
                className="mt-3 flex items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(22,32,58,0.12)] transition hover:shadow-[0_0_0_2px_#e2ab3f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e2ab3f]"
              >
                <span>
                  <span className="block text-[14px] font-semibold text-[#16203a]">{s.link.label}</span>
                  <span className="mt-0.5 block text-[12px] text-[#16203a]/55">{s.link.note}</span>
                </span>
                <span className="shrink-0 rounded-[8px] bg-[#141d33] px-3 py-1.5 text-[12px] font-semibold text-[#ffe9a8]">
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
    <details className="group mt-10 rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(22,32,58,0.1)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-semibold text-[#16203a]">달라진 것 보기</span>
        <span aria-hidden className="text-[#16203a]/50 transition group-open:rotate-180">▾</span>
      </summary>
      <ul className="border-t border-[#16203a]/10">
        {RELEASES.map((r) => (
          <li key={r.version} className="px-5 py-4">
            <p className="text-[15px] font-semibold text-[#16203a]">
              {r.version}{" "}
              <time dateTime={r.date} className="ml-1 text-[13px] font-normal text-[#16203a]/55">
                {r.date}
              </time>
            </p>
            <ul className="mt-2 space-y-1.5">
              {r.notes.map((n) => (
                <li key={n} className="text-[14px] leading-relaxed text-[#16203a]/70 break-keep">
                  {n}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
              <a href={r.mac.href} download className="rounded-[8px] bg-[#e7ebf2] px-3 py-1.5 font-semibold text-[#16203a]">
                macOS {r.mac.size}
              </a>
              <a href={r.windows.href} download className="rounded-[8px] bg-[#e7ebf2] px-3 py-1.5 font-semibold text-[#16203a]">
                Windows {r.windows.size}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}
