"use client";

import { useEffect } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOT } from "@/lib/adsense";

/**
 * 광고 한 자리.
 *
 * 광고 단위 ID가 없으면 아무것도 그리지 않는다. 자리만 잡아둔 가짜 ID로
 * `<ins>`를 내보내면 빈 광고 껍데기가 글마다 남는데, 그게 예전에 실제로
 * 배포돼 있었다. 승인 전에는 안 그리는 게 맞다 —
 * 심사에 필요한 건 layout의 스크립트 한 줄뿐이다.
 */
export default function AdSense() {
  useEffect(() => {
    if (!ADSENSE_SLOT) return;
    try {
      // @ts-expect-error adsbygoogle는 외부 스크립트가 꽂아 넣는다
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 스크립트가 아직 안 붙었다. 다음 로드에서 알아서 채워진다
    }
  }, []);

  if (!ADSENSE_SLOT) return null;

  return (
    <div className="mt-6 mb-2">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
