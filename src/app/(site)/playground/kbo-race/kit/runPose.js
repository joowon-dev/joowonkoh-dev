// sneaky-baseball 의 유니폼 렌더러(teams·glyphs·sprites)를 그대로 쓰고,
// 여기서는 순위 레이스용 꼬마 달리기 포즈만 새로 만든다 — 머리를 키워 귀엽게.
import { drawFigure, fielderStand } from './sprites.js'
import { kitOf } from './teams.js'

function bone(ctx, ax, ay, bx, by, w) {
  ctx.beginPath(); ctx.lineWidth = w; ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke()
}
function blob(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill() }
// sprites.js 의 jerseyPath 와 같은 모양 — 실루엣과 상의가 어긋나면 몸에서 뜬다.
function torso(ctx, [ax, ay, bx, by, w]) {
  const r = w / 2, a = Math.atan2(by - ay, bx - ax)
  const px = Math.cos(a + Math.PI / 2) * r, py = Math.sin(a + Math.PI / 2) * r
  ctx.beginPath()
  ctx.moveTo(ax + px, ay + py); ctx.lineTo(bx + px, by + py)
  ctx.arc(bx, by, r, a + Math.PI / 2, a - Math.PI / 2, true)
  ctx.lineTo(ax - px, ay - py); ctx.closePath(); ctx.fill()
}

// 로컬 -x 가 바라보는 쪽. 레이스는 오른쪽으로 달리니 flip=-1 로 그린다.
function pose(p) {
  return {
    ...p,
    helmet: false,
    silhouette(ctx) {
      blob(ctx, ...p.head)
      torso(ctx, p.torsoBone)
      for (const l of p.legBones) bone(ctx, ...l)
      bone(ctx, ...p.sleeveBone)
      bone(ctx, ...p.foreBone)
      for (const [x, y, r] of p.hands) blob(ctx, x, y, r * 1.2)
    },
  }
}

// 꼬마 비율: 머리가 키의 1/3 가까이 된다.
const HEAD = 0.19
export const RUN = [
  // 성큼 — 앞다리 앞으로, 소매 팔 앞으로
  pose({
    head: [-0.05, -0.76, HEAD],
    torsoBone: [-0.02, -0.56, 0.02, -0.34, 0.22],
    legBones: [[0, -0.32, -0.17, -0.04, 0.12], [0.02, -0.32, 0.17, -0.1, 0.12]],
    sleeveBone: [-0.05, -0.52, -0.2, -0.42, 0.1],
    foreBone: [0.04, -0.52, 0.17, -0.62, 0.1],
    hands: [[-0.21, -0.41, 0.055], [0.18, -0.63, 0.05]],
  }),
  // 모음 — 발이 모이고 몸이 살짝 뜬다
  pose({
    head: [-0.04, -0.79, HEAD],
    torsoBone: [-0.02, -0.59, 0.01, -0.37, 0.22],
    legBones: [[0, -0.35, -0.04, -0.02, 0.12], [0.02, -0.35, 0.13, -0.17, 0.12]],
    sleeveBone: [-0.04, -0.55, -0.09, -0.38, 0.1],
    foreBone: [0.03, -0.55, 0.09, -0.39, 0.1],
    hands: [[-0.1, -0.37, 0.055], [0.1, -0.38, 0.05]],
  }),
  // 성큼 — 반대 팔
  pose({
    head: [-0.05, -0.76, HEAD],
    torsoBone: [-0.02, -0.56, 0.02, -0.34, 0.22],
    legBones: [[0, -0.32, -0.17, -0.04, 0.12], [0.02, -0.32, 0.17, -0.1, 0.12]],
    sleeveBone: [-0.02, -0.52, 0.15, -0.42, 0.1],
    foreBone: [-0.06, -0.52, -0.19, -0.63, 0.1],
    hands: [[0.16, -0.41, 0.055], [-0.2, -0.64, 0.05]],
  }),
]
export const CYCLE = [0, 1, 2, 1]

const KIT_ID = { LG:'lg', KT:'kt', SK:'ssg', NC:'nc', OB:'doosan', HT:'kia', LT:'lotte', SS:'samsung', HH:'hanwha', WO:'kiwoom' }
export const kitFor = (code) => kitOf(`${KIT_ID[code]}-home`)
export { drawFigure, fielderStand }
