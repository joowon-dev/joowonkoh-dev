"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 서버 컴포넌트를 주기적으로 다시 그린다. 탭이 안 보일 때는 쉬고, 돌아오면 바로 한 번.
 * 수집이 1분마다라 그보다 자주 불러도 숫자는 같다.
 */
export default function AutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = window.setInterval(tick, seconds * 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, seconds]);

  return null;
}
