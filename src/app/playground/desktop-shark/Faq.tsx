/**
 * 자주 묻는 것. 접어 두고 누른 것만 연다 — 펼쳐 놓으면 페이지가 설명서가 된다.
 * `<details>` 라 자바스크립트 없이도 펴진다.
 */

const FAQ = [
  {
    q: "켜 두면 일하는 데 방해되지 않나요?",
    a: "창이 마우스를 절대 받지 않아요. 클릭과 타자는 «세기만» 해서, 누르던 버튼은 그대로 눌리고 치던 글자는 그대로 찍혀요. 남이 화면을 볼 때는 ⌥⇧S(윈도우는 Alt+Shift+S)로 밥 주기를 멈추거나 ⌥⇧H 로 숨기면 돼요.",
  },
  {
    q: "상어가 잘 안 보여요",
    a: "처음에는 작고 흐린 그림자라 그게 정상이에요. 먹을수록 커지고 진해져요 — 1단계에서 6단계까지 몸 길이가 일곱 배가 돼요. 밝은 바탕화면에서 더 잘 보이고, 어두운 바탕화면에서는 등의 밝은 테두리로 보여요.",
  },
  {
    q: "얼마나 해야 다 크나요?",
    a: "누적 18,000점이면 한 마리가 6단계까지 커요. 보통 일하는 리듬(가끔 클릭, 틈틈이 타자)이면 시간당 5,000점쯤이라 하루면 한 마리예요. 여섯 종을 다 여는 데는 한 주 남짓 걸려요.",
  },
  {
    q: "모니터가 두 대예요",
    a: "메뉴의 「모니터」에서 상어가 살 화면을 골라요. 다른 모니터에서 클릭해도 밥이 돼요 — 상어 화면의 그쪽 가장자리로 떨어져요.",
  },
  {
    q: "무엇을 쳤는지 앱이 아나요?",
    a: "몰라요. 맥에서는 macOS가 이미 세고 있는 「키를 몇 번 눌렀나」 숫자만 물어봐서 어떤 키였는지 알 방법이 없고, 그래서 권한도 필요 없어요. 랭킹에는 점수와 별명, 상어 종만 올라가요.",
  },
  {
    q: "랭킹에 안 올리고 싶어요",
    a: "메뉴나 도감 창에서 「랭킹에 올리기」를 끄면 아무것도 서버로 보내지 않아요. 상어는 그대로 커요. 계정은 몰래 야구와 같은 걸 써서, 야구의 복구 코드를 넣으면 같은 사람으로 이어져요.",
  },
  {
    q: "업데이트는 어떻게 해요?",
    a: "새 버전이 나오면 메뉴 맨 위에 「새 버전 설치」가 생겨요. 눌러야만 갈아 끼우고, 키우던 상어는 그대로 남아요. 윈도우는 설치본으로 깐 경우에만 돼요.",
  },
];

export default function Faq() {
  return (
    <div className="divide-y divide-[#0f2a3a]/10 rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(15,42,58,0.08)]">
      {FAQ.map((item) => (
        <details key={item.q} className="group px-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <span className="text-[16px] font-semibold text-[#0f2a3a]">{item.q}</span>
            <span aria-hidden className="shrink-0 text-[#0f2a3a]/45 transition group-open:rotate-45">
              ＋
            </span>
          </summary>
          <p className="pb-5 text-[14.5px] leading-[1.75] text-[#0f2a3a]/70 break-keep">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
