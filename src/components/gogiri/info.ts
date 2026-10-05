/**
 * 고기리막국수 가게 정보.
 *
 * 2026-10-05 에 식신·캐치테이블·다이닝코드 등에 올라온 내용을 모은 것이다.
 * 값이 바뀌면 여기만 고친다. 페이지에는 «방문 전 확인» 을 함께 띄운다.
 */

export const PLACE = {
  name: "고기리막국수",
  address: "경기 용인시 수지구 이종무로 157",
  hours: "매일 11:00–21:00",
  weekendHours: "주말·연휴는 10:40 에 연다",
  closed: "화요일 정기휴무",
  parking: "전용 주차장, 입구에서 안내",
  waiting: "캐치테이블 원격 줄서기",
  quietHours: "평일 오후 3–6시가 비교적 한산",
  since: "2012년, 들기름막국수를 처음 내놓은 집",
} as const;

export const LINKS = {
  naverMap: "https://map.naver.com/p/search/%EA%B3%A0%EA%B8%B0%EB%A6%AC%EB%A7%89%EA%B5%AD%EC%88%98",
  kakaoMap: "https://map.kakao.com/?q=%EA%B3%A0%EA%B8%B0%EB%A6%AC%EB%A7%89%EA%B5%AD%EC%88%98",
  catchtable: "https://app.catchtable.co.kr/ct/shop/goggilr",
} as const;

export type MenuKey = "deulgireum" | "mul" | "bibim" | "suyuk";

export interface MenuItem {
  key: MenuKey;
  name: string;
  price: string;
  note: string;
}

export const MENU: MenuItem[] = [
  {
    key: "deulgireum",
    name: "원조 들기름막국수",
    price: "12,000원",
    note: "들기름·간장에 버무린 면 위로 김가루와 깨. 비비지 않고 나온 그대로.",
  },
  {
    key: "mul",
    name: "물막국수",
    price: "12,000원",
    note: "차가운 동치미 육수에 만 메밀면. 새콤하고 맑다.",
  },
  {
    key: "bibim",
    name: "비빔막국수",
    price: "12,000원",
    note: "빨간 양념에 비벼 먹는 쪽. 매콤달콤.",
  },
  {
    key: "suyuk",
    name: "수육",
    price: "소 17,000원 · 중 25,000원",
    note: "막국수 옆에 곁들이는 삶은 고기.",
  },
];

/** 정보를 모은 곳 */
export const SOURCES = [
  { label: "식신", href: "https://www.siksinhot.com/P/355743" },
  { label: "캐치테이블", href: "https://app.catchtable.co.kr/ct/shop/goggilr" },
  { label: "다이닝코드", href: "https://www.diningcode.com/profile.php?rid=iyewfmixd2ng" },
] as const;
