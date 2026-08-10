import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone"은 직접 서버를 띄울 때 쓰는 산출물이다. Vercel은 자체
  // 빌드 산출물을 만들므로 필요 없다.
  //
  // images.unoptimized는 유지한다. Vercel의 이미지 최적화는 사용량 과금이 붙고,
  // 이 사이트는 이미 빌드 시점에 줄여 둔 이미지를 쓴다.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
