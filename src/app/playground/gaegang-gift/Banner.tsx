/**
 * 경축 현수막.
 *
 * 동네 어귀에 걸리는 «경축 ○○○» 현수막 그대로다 — 짙은 빨강 바탕에 안쪽을
 * 향한 갈매기 무늬가 겹겹이 들어오고, 가운데 흰 판에 문구, 양 끝 노란 별에
 * «경»과 «축». 진짜 경사에 쓰는 물건이라 개강에 걸어 두면 그 자체로 농담이 된다.
 *
 * 이미지가 아니라 SVG로 그렸다. 어느 화면에서도 안 깨지고, 문구를 바꾸는 데
 * 디자인 도구가 필요 없다.
 */

/** 현수막 좌표계. 실제 현수막처럼 가로로 길다 */
const W = 880;
const H = 200;
/** 갈매기 무늬가 가운데로 파고드는 깊이 */
const POINT = 48;
/** 흰 판이 시작하는 x. 여기서부터 바깥쪽으로 색 띠가 한 겹씩 쌓인다 */
const INNER = 214;
/** 색 띠 한 겹의 두께 */
const STEP = 26;

/** 안쪽을 향한 갈매기 한 겹. 경계에서 화면 중앙까지를 채운다 */
function chevron(offset: number, mirrored: boolean): string {
  const x = mirrored ? W - offset : offset;
  const tip = mirrored ? x - POINT : x + POINT;
  return `M${x} 0 L${tip} ${H / 2} L${x} ${H} L${W / 2} ${H} L${W / 2} 0 Z`;
}

/** 별 모양 배지. 뾰족한 끝 18개 */
const BURST =
  "M0 -74L9.6 -54.2L25.3 -69.5L27.5 -47.6L47.6 -56.7L42.1 -35.4L64.1 -37L51.7 -18.8L72.9 -12.8L55 0L72.9 12.8L51.7 18.8L64.1 37L42.1 35.4L47.6 56.7L27.5 47.6L25.3 69.5L9.6 54.2L0 74L-9.6 54.2L-25.3 69.5L-27.5 47.6L-47.6 56.7L-42.1 35.4L-64.1 37L-51.7 18.8L-72.9 12.8L-55 0L-72.9 -12.8L-51.7 -18.8L-64.1 -37L-42.1 -35.4L-47.6 -56.7L-27.5 -47.6L-25.3 -69.5L-9.6 -54.2Z";

/* 바깥에서 안으로. 마지막 흰색이 가운데 판이 된다 */
const BANDS = [
  { fill: "#c0392b", step: 3 },
  { fill: "#e8672a", step: 2 },
  { fill: "#f2c230", step: 1 },
  { fill: "#ffffff", step: 0 },
];

export default function Banner({ text }: { text: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
      role="img"
      aria-label={`경축 ${text}`}
    >
      {/* 현수막 바탕 */}
      <rect width={W} height={H} fill="#8e1616" />

      {BANDS.map(({ fill, step }) => {
        const offset = INNER - step * STEP;
        return (
          <g key={fill}>
            <path d={chevron(offset, false)} fill={fill} />
            <path d={chevron(offset, true)} fill={fill} />
          </g>
        );
      })}

      {/* 양 끝 별에 «경»과 «축» */}
      {[
        { x: 96, label: "경" },
        { x: W - 96, label: "축" },
      ].map(({ x, label }) => (
        <g key={label} transform={`translate(${x} ${H / 2})`}>
          <path d={BURST} fill="#ffd633" stroke="#e8a800" strokeWidth="3" />
          <text
            y="24"
            textAnchor="middle"
            fill="#9e1616"
            fontSize="66"
            fontWeight="800"
            fontFamily="Pretendard, system-ui, sans-serif"
          >
            {label}
          </text>
        </g>
      ))}

      {/* 가운데 흰 판의 문구 */}
      <text
        x={W / 2}
        y={H / 2 + 33}
        textAnchor="middle"
        fill="#a81f1f"
        fontSize="92"
        fontWeight="800"
        letterSpacing="14"
        fontFamily="Pretendard, system-ui, sans-serif"
      >
        {text}
      </text>
    </svg>
  );
}
