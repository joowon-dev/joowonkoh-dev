import type { Metadata } from "next";
import JjimjilbangWeather from "./JjimjilbangWeather";

const TITLE = "오늘의 찜질방";
const DESCRIPTION =
  "오늘 날씨가 찜질방 어느 방인지 알려줍니다. 체감온도와 습도를 함께 봐서 황토방·건식사우나·습식사우나·불가마로 판정하고, 하루가 어떤 방들을 지나가는지 보여줍니다.";
const URL = "https://joowonkoh.com/playground/jjimjilbang";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
  },
};

export default function JjimjilbangPage() {
  return <JjimjilbangWeather />;
}
