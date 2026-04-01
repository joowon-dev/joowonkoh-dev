"use client";

import { useEffect } from "react";

interface AdSenseProps {
  adSlot: string;
}

export default function AdSense({ adSlot }: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is injected by the script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  return (
    <div className="my-8">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
