import type { Metadata } from "next";
import CoinPusherGame from "./CoinPusherGame";

export const metadata: Metadata = {
  title: "코인 밀기 추첨기",
  description:
    "참가자 이름을 넣으면 코인이 판 위로 쏟아지고, 푸셔에 밀려 가장 먼저 떨어진 코인의 주인이 당첨되는 추첨기.",
};

export default function CoinPusherPage() {
  return (
    <main>
      <CoinPusherGame />
    </main>
  );
}
