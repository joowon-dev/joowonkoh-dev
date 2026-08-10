/**
 * 상영 전 미리보기.
 *
 * 스크린에 걸기 전에 «지금 뭐가 걸릴지»를 평범한 화면으로 먼저 보여준다.
 * 곡면에 얹히고 나면 얼굴이 제대로 잡혔는지, 사진이 맞게 골렸는지 알아보기
 * 어렵다. 확인은 왜곡 없는 화면에서 끝내고, 왜곡은 그 다음 일이다.
 */

export interface Fit {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 원본을 잘라내지 않고 상자 안에 다 넣는다. CSS의 object-fit: contain과 같다.
 *
 * 여기서만은 1.43:1로 자르지 않는다. 미리보기는 «스크린에 어떻게 걸릴지»가
 * 아니라 «지금 카메라에 뭐가 잡혔는지»를 보는 자리라, 원본을 그대로 보여주는
 * 편이 판단에 쓸모 있다.
 */
export function fitContain(srcW: number, srcH: number, dstW: number, dstH: number): Fit {
  if (srcW <= 0 || srcH <= 0 || dstW <= 0 || dstH <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const scale = Math.min(dstW / srcW, dstH / srcH);
  const width = srcW * scale;
  const height = srcH * scale;
  return {
    x: (dstW - width) / 2,
    y: (dstH - height) / 2,
    width,
    height,
  };
}
