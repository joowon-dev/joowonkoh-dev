"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** 앱 로그인 화면과 같은 인사(copy 의 landing.greetings). 천천히 사라졌다가 다음 말이 떠오른다. */

const STAY = 4200;
const FADE_OUT = 900;
const FADE_IN = 1200;

export default function Greeting({
  lines,
  quote,
  className,
  style,
}: {
  lines: string[];
  quote: [string, string];
  className?: string;
  style?: React.CSSProperties;
}) {
  const still = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (still) return;
    // 떠오르는 동안(FADE_IN)까지 기다린 뒤 STAY 만큼 머문다.
    const t = shown
      ? setTimeout(() => setShown(false), FADE_IN + STAY)
      : setTimeout(() => {
          setIndex((i) => (i + 1) % lines.length);
          setShown(true);
        }, FADE_OUT);
    return () => clearTimeout(t);
  }, [shown, still, lines.length]);

  const line = still ? lines[0] : lines[index % lines.length];

  return (
    <p
      className={className}
      style={{
        ...style,
        opacity: shown || still ? 1 : 0,
        transition: still ? "none" : `opacity ${shown ? FADE_IN : FADE_OUT}ms ease-in-out`,
      }}
    >
      {quote[0]}
      {line}
      {quote[1]}
    </p>
  );
}
