/**
 * 애드센스 설정을 한곳에 모은다.
 *
 * 예전에는 컴포넌트에 `ca-pub-XXXXXXXXXXXXXXXX`와 `1234567890`이 그대로 박혀
 * 있었다. 자리만 잡아두려던 값인데 그대로 배포돼서, 글 45편 전부에 동작하지
 * 않는 광고 태그가 실려 나갔다. 값이 없으면 아예 안 그리는 쪽이 안전하다.
 */

/** 퍼블리셔 ID. public/ads.txt와 반드시 같아야 한다 */
export const ADSENSE_CLIENT = "ca-pub-7807290470382730";

/**
 * 광고 단위(ad unit) ID.
 *
 * 애드센스 대시보드에서 광고 단위를 만들어야 나오는 값이고, 계정이 승인된
 * 뒤에야 만들 수 있다. 그래서 승인 전에는 비어 있는 게 정상이다.
 * 승인되면 `.env`에 NEXT_PUBLIC_ADSENSE_SLOT을 넣으면 그때부터 광고가 붙는다.
 */
export const ADSENSE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT || null;

/** 광고를 그릴 준비가 됐는가 */
export const adsEnabled = ADSENSE_SLOT !== null;
