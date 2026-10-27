/**
 * 앱 마스코트 "면이" — 위에서 내려다본 면 다발 얼굴에 면 세 가닥이 삐죽.
 * 앱은 View 로 그렸고, 여기서는 같은 모양을 SVG 로 옮겼다.
 */
import { C } from "./palette";

type Mood = "happy" | "wow" | "yay";

export default function Mascot({ size = 96, mood = "happy" }: { size?: number; mood?: Mood }) {
  return (
    <svg width={size} height={size * 1.18} viewBox="0 0 100 118" aria-hidden>
      {[-1, 0, 1].map((i) => (
        <rect
          key={i}
          x={46 + i * 11}
          y={i === 0 ? 0 : 6}
          width={8}
          height={i === 0 ? 30 : 24}
          rx={4}
          fill={C.noodle}
          stroke={C.ink}
          strokeWidth={3}
          transform={`rotate(${i * 18} ${50 + i * 11} 26)`}
        />
      ))}
      <circle cx={50} cy={68} r={47} fill={C.noodle} stroke={C.ink} strokeWidth={3.5} />
      {[
        [22, 50], [78, 48], [18, 78], [82, 76], [32, 98], [68, 99], [50, 30],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4.5} fill={C.noodleDeep} opacity={0.35} />
      ))}
      {mood === "yay" ? (
        <>
          <path d="M33 66 q5 -7 10 0" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
          <path d="M57 66 q5 -7 10 0" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx={39} cy={64} rx={mood === "wow" ? 6 : 5} ry={mood === "wow" ? 7.5 : 6.2} fill={C.ink} />
          <ellipse cx={61} cy={64} rx={mood === "wow" ? 6 : 5} ry={mood === "wow" ? 7.5 : 6.2} fill={C.ink} />
          <circle cx={37.5} cy={61.5} r={1.9} fill="#fff" />
          <circle cx={59.5} cy={61.5} r={1.9} fill="#fff" />
        </>
      )}
      <ellipse cx={30} cy={75} rx={6.5} ry={4} fill={C.blush} opacity={0.8} />
      <ellipse cx={70} cy={75} rx={6.5} ry={4} fill={C.blush} opacity={0.8} />
      {mood === "wow" ? (
        <ellipse cx={50} cy={82} rx={5.5} ry={6.5} fill={C.ink} />
      ) : (
        <path
          d={mood === "yay" ? "M40 77 q10 13 20 0 z" : "M43 78 q7 7 14 0"}
          fill={mood === "yay" ? C.tomato : "none"}
          stroke={C.ink}
          strokeWidth={3.2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
