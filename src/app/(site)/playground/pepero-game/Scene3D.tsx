"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import * as THREE from "three";

import { cm, STICK_MM } from "./rules";

/**
 * 막대과자를 사이에 둔 두 사람을 3D 로 그린다(three.js + react-three-fiber). 화면을 꽉 채운다.
 * 머리가 큰 2등신 둘 — 왼쪽은 도전장을 보낸 사람(갈색 머리·새싹·귤색 후드), 오른쪽은 받은 사람(남색 머리·더듬이·민트 티).
 * 성별 티가 나지 않게 둘 다 같은 바가지 머리·같은 몸이고, 색과 머리 위 장식으로만 구분한다.
 * 아직 정체를 모르는 상대는 그림자(shadow)로, 눈만 빛난다.
 *
 * 입·얼굴이 맞닿아 보이는 장면은 그리지 않는다. 화면 속 틈은 motion.visibleGap 이 늘 남겨 둔다.
 * 이름표·말풍선·「쿵!」 같은 글자는 3D 위에 얹은 HTML 이다(3D 자리를 화면 좌표로 바꿔 옮긴다).
 */

/* ───────────── 자리 ───────────── */

/** 1mm 당 3D 길이. 막대 15cm = 6. */
const U = 0.04;
export const worldX = (mm: number) => (mm - STICK_MM / 2) * U;
const FLOOR = -2.32;
const FOV = 32;

export type Expr =
  | "idle"
  | "ready" // 주먹 쥐고 준비
  | "chew" // 먹는 중
  | "hold" // 멈추고 숨 참기
  | "nervous" // 다가온다!
  | "win"
  | "lose"
  | "ouch" // 들이받혔다
  | "oops" // 들이받았다
  | "dizzy" // 이마 쿵
  | "shadow"; // 정체 모를 상대

export interface Side {
  /** 입 자리(mm, 막대 왼쪽 끝에서) */
  at: number;
  expr: Expr;
  name: string;
  bubble?: string | null;
  /** 얼마나 달아올랐나(0~1) — 떨림·땀·기운 */
  heat?: number;
  /** 이마 쿵 — 발끝을 축으로 앞으로 쏠리며 고개를 숙여 이마끼리 닿는다(0~1) */
  lunge?: number;
}

export interface Crumb {
  id: number;
  at: number;
  dir: -1 | 1;
  seed: number;
}

export interface Cam {
  /** 화면 가운데(mm) */
  at: number;
  /** 화면에 담을 좌우 반 폭(3D 길이) */
  span: number;
  /** 흔들림(0~1) */
  shake?: number;
  /** 아래에 패널이 있을 때 그림을 이만큼(화면 높이 비율) 위로 올린다 */
  lift?: number;
  /** 화면 기울기(라디안) — 아슬아슬할 때 비스듬히 */
  roll?: number;
  /** 0~1: 화면이 확 다가오는 정도(시야각을 좁힌다) */
  push?: number;
}

interface Props {
  left: Side;
  right: Side;
  /** 막대를 그리나(부딪히거나 다 먹으면 안 그린다) */
  stick?: boolean;
  piece?: number | null;
  bite?: number | null;
  burst?: string;
  confetti?: boolean;
  crumbs?: Crumb[];
  cam: Cam;
  caption?: string;
}

const LOOK = {
  left: {
    skin: "#ffe0c9",
    hair: "#7a4a2c",
    shirt: "#ffa53a",
    pants: "#4b3b6e",
    iris: "#6b3a1f",
    label: "#f28a1e",
    aura: "#ff9a2a",
  },
  right: {
    skin: "#ffe6d3",
    hair: "#2b3550",
    shirt: "#54c7a6",
    pants: "#34465a",
    iris: "#1e2b4a",
    label: "#2fae8a",
    aura: "#3fe0b4",
  },
  shadow: {
    skin: "#3a2b55",
    hair: "#2a1f40",
    shirt: "#33264c",
    pants: "#2a1f40",
    iris: "#fff",
    label: "#8a7aa8",
    aura: "#9b7bff",
  },
};

/* ───────────── 겉: 캔버스 + 글자 ───────────── */

type Tag =
  | "nameL"
  | "nameR"
  | "bubbleL"
  | "bubbleR"
  | "piece"
  | "bite"
  | "qmark";
type Anchors = Record<Tag, [number, number, number] | null>;

export default function Scene3D(props: Props) {
  const {
    left,
    right,
    piece = null,
    bite = null,
    caption,
  } = props;
  const tags = useRef<Partial<Record<Tag, HTMLDivElement | null>>>({});

  const xl = worldX(left.at);
  const xr = worldX(right.at);
  const shadowR = right.expr === "shadow";
  const shadowL = left.expr === "shadow";
  const anchors: Anchors = {
    nameL: [xl - 1.0, FLOOR - 0.15, 0.6],
    nameR: [xr + 1.0, FLOOR - 0.15, 0.6],
    bubbleL: left.bubble ? [xl - 0.95, 1.75, 0] : null,
    bubbleR: right.bubble ? [xr + 0.95, 1.75, 0] : null,
    piece: piece !== null ? [(xl + xr) / 2, 2.0, 0] : null,
    bite: bite !== null ? [worldX(bite), 0.35, 0] : null,
    qmark: shadowR
      ? [xr + 0.95, 1.85, 0]
      : shadowL
        ? [xl - 0.95, 1.85, 0]
        : null,
  };

  const tag = (k: Tag) => (el: HTMLDivElement | null) => {
    tags.current[k] = el;
  };

  return (
    <div
      className="pp-3d absolute inset-0 select-none"
      role="img"
      aria-label={
        caption ??
        `${left.name}·${right.name} 둘이 막대과자를 양쪽에서 물고 있어요`
      }
    >
      <Canvas
        className="!absolute inset-0"
        dpr={[1, 2]}
        flat
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: FOV, position: [0, 0.6, 16], near: 0.1, far: 120 }}
      >
        <World {...props} anchors={anchors} tags={tags} />
      </Canvas>

      <div ref={tag("nameL")} className="pp-tag">
        <span
          className="pp-name pp-display"
          style={{ background: shadowL ? LOOK.shadow.label : LOOK.left.label }}
        >
          {left.name}
        </span>
      </div>
      <div ref={tag("nameR")} className="pp-tag">
        <span
          className="pp-name pp-display"
          style={{ background: shadowR ? LOOK.shadow.label : LOOK.right.label }}
        >
          {right.name}
        </span>
      </div>
      {left.bubble && (
        <div key={`bl-${left.bubble}`} ref={tag("bubbleL")} className="pp-tag">
          <span className="pp-bubble pp-display">{left.bubble}</span>
        </div>
      )}
      {right.bubble && (
        <div key={`br-${right.bubble}`} ref={tag("bubbleR")} className="pp-tag">
          <span className="pp-bubble pp-display">{right.bubble}</span>
        </div>
      )}
      {piece !== null && (
        <div ref={tag("piece")} className="pp-tag">
          <span className="pp-piece pp-display">남은 {cm(piece)}cm</span>
        </div>
      )}
      {bite !== null && (
        <div ref={tag("bite")} className="pp-tag">
          <span className="pp-burst pp-display">{props.burst ?? "쿵!"}</span>
        </div>
      )}
      {(shadowL || shadowR) && (
        <div ref={tag("qmark")} className="pp-tag">
          <span className="pp-display pp-qmark">?</span>
        </div>
      )}
    </div>
  );
}

/* ───────────── 3D 세상 ───────────── */

function World({
  left,
  right,
  stick = true,
  piece = null,
  bite = null,
  confetti = false,
  crumbs = [],
  cam,
  anchors,
  tags,
}: Props & {
  anchors: Anchors;
  tags: RefObject<Partial<Record<Tag, HTMLDivElement | null>>>;
}) {
  const toon = useToonGradient();
  const v = useMemo(() => new THREE.Vector3(), []);
  const pos = useRef<THREE.Vector3 | null>(null);
  const look = useRef<THREE.Vector3 | null>(null);
  const kick = useRef(0);
  const lift = useRef(0);
  const roll = useRef(0);
  const prevBite = useRef<number | null>(null);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const { camera, size } = state;
    const aspect = size.width / Math.max(1, size.height);

    // 부딪는 순간 한 번 크게 흔든다
    if (bite !== null && prevBite.current === null) kick.current = 1;
    prevBite.current = bite;
    kick.current = Math.max(0, kick.current - dt * 1.6);
    const s = (cam.shake ?? 0) * 0.12 + kick.current * 0.45;

    // 세로 화면은 비스듬히(막대가 안쪽으로 들어가게) 봐서 좌우 폭을 줄인다
    const portrait = aspect < 1;
    const yaw = (portrait ? 0.7 : 0.12) + Math.sin(t * 0.3) * 0.04;
    const tanV = Math.tan(((FOV / 2) * Math.PI) / 180);
    const tanH = tanV * aspect;
    const halfW =
      cam.span * (0.32 + 0.68 * Math.cos(yaw)) * (portrait ? 0.9 : 1);
    const d = Math.max(halfW / tanH, 3.0 / tanV) + 1.5;
    const focus = worldX(cam.at);
    const wantPos = new THREE.Vector3(
      focus + Math.sin(yaw) * d,
      0.55 + d * 0.045,
      Math.cos(yaw) * d,
    );
    const wantLook = new THREE.Vector3(focus, -0.35, 0);
    if (!pos.current || !look.current) {
      pos.current = wantPos.clone();
      look.current = wantLook.clone();
    }
    const k = Math.min(1, dt * 5);
    pos.current.lerp(wantPos, k);
    look.current.lerp(wantLook, k);
    camera.position.set(
      pos.current.x + (Math.random() - 0.5) * s,
      pos.current.y + (Math.random() - 0.5) * s,
      pos.current.z,
    );
    camera.lookAt(look.current);
    const cam3 = camera as THREE.PerspectiveCamera;
    roll.current = THREE.MathUtils.lerp(roll.current, cam.roll ?? 0, Math.min(1, dt * 6));
    if (Math.abs(roll.current) > 1e-4) camera.rotateZ(roll.current);
    // 부딪는 순간 + push 만큼 시야를 좁혀 확 다가온 느낌
    const wantFov = FOV * (1 - 0.22 * (cam.push ?? 0)) - kick.current * 7;
    if (Math.abs(cam3.fov - wantFov) > 0.01) {
      cam3.fov = THREE.MathUtils.lerp(cam3.fov, wantFov, Math.min(1, dt * 10));
      cam3.updateProjectionMatrix();
    }
    lift.current = THREE.MathUtils.lerp(
      lift.current,
      (cam.lift ?? 0) * (portrait ? 0.45 : 1),
      Math.min(1, dt * 4),
    );
    if (lift.current > 0.002)
      cam3.setViewOffset(
        size.width,
        size.height,
        0,
        lift.current * size.height,
        size.width,
        size.height,
      );
    else if (cam3.view) cam3.clearViewOffset();

    // 3D 자리 → 화면 px 로 글자 옮기기
    (Object.keys(anchors) as Tag[]).forEach((key) => {
      const el = tags.current?.[key];
      const p = anchors[key];
      if (!el || !p) return;
      v.set(p[0], p[1], p[2]).project(camera);
      el.style.transform = `translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
      el.style.visibility = "visible";
    });
  });

  const xl = worldX(left.at);
  const xr = worldX(right.at);

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[2, 7, 9]} intensity={1.7} />
      <directionalLight
        position={[-9, 3, -5]}
        intensity={1.1}
        color={LOOK.left.aura}
      />
      <directionalLight
        position={[9, 3, -5]}
        intensity={1.1}
        color={LOOK.right.aura}
      />

      <Stage toon={toon} />

      <Person side="left" x={xl} s={left} toon={toon} />
      <Person side="right" x={xr} s={right} toon={toon} />

      {stick && right.at - left.at > 0 && bite === null && piece === null && (
        <Stick from={left.at} to={right.at} toon={toon} />
      )}

      {crumbs.map((c) => (
        <CrumbMesh key={c.id} c={c} />
      ))}
      {piece !== null && (
        <FlyingPiece x={(xl + xr) / 2} mm={piece} toon={toon} />
      )}
      {bite !== null && <Impact x={worldX(bite)} />}
      {confetti && <Confetti />}
    </>
  );
}

/** 3단 명암 — 만화처럼 딱 끊어지는 그늘 */
function useToonGradient() {
  return useMemo(() => {
    const tex = new THREE.DataTexture(
      new Uint8Array([
        120, 120, 120, 255, 200, 200, 200, 255, 255, 255, 255, 255,
      ]),
      3,
      1,
    );
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/** 둥근 무대 + 가장자리 불빛 */
function Stage({ toon }: { toon: THREE.Texture }) {
  const ring = useRef<THREE.Group>(null);
  useFrame((state) => {
    ring.current?.children.forEach((m, i) => {
      const on = Math.floor(state.clock.elapsedTime * 4 + i) % 3 === 0;
      ((m as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(
        on ? "#fff3a8" : "#ffb36b",
      );
    });
  });
  const bulbs = 26;
  return (
    <group position={[0, FLOOR - 0.22, 0]}>
      <group scale={[1, 1, 0.42]}>
        <Toon
          toon={toon}
          color="#6a3f8f"
          outline={0.012}
          geo={<cylinderGeometry args={[6.4, 6.6, 0.44, 64]} />}
        />
        <mesh position={[0, 0.225, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[5.0, 5.35, 64]} />
          <meshBasicMaterial color="#ff8fc0" />
        </mesh>
        <mesh position={[0, 0.226, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[5.0, 64]} />
          <meshToonMaterial color="#8a54b5" gradientMap={toon} />
        </mesh>
      </group>
      <group ref={ring}>
        {Array.from({ length: bulbs }, (_, i) => {
          const a = (i / bulbs) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 6.5, 0, Math.sin(a) * 6.5 * 0.42]}
            >
              <sphereGeometry args={[0.06, 8, 6]} />
              <meshBasicMaterial color="#ffb36b" />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* ───────────── 사람 ───────────── */

const OUTLINE = new THREE.MeshBasicMaterial({
  color: "#2b1a2e",
  side: THREE.BackSide,
});

function Toon({
  geo,
  color,
  toon,
  outline = 0.035,
  ...rest
}: {
  geo: React.ReactElement;
  color: string;
  toon: THREE.Texture;
  outline?: number;
} & React.ComponentProps<"group">) {
  return (
    <group {...rest}>
      <mesh>
        {geo}
        <meshToonMaterial color={color} gradientMap={toon} />
      </mesh>
      {outline > 0 && (
        <mesh scale={1 + outline} material={OUTLINE}>
          {geo}
        </mesh>
      )}
    </group>
  );
}

/** 어깨에서 팔을 앞으로 든 각도(z), 옆으로 벌린 각도(x) */
const ARM: Record<Expr, [number, number]> = {
  idle: [0.2, 0.1],
  ready: [1.35, 0.05],
  chew: [1.0, 0.1],
  hold: [0.75, 0.05],
  nervous: [1.55, -0.15],
  win: [2.85, 0.45],
  lose: [0.02, 0.05],
  ouch: [2.15, -0.25],
  oops: [2.0, -0.2],
  dizzy: [0.5, 0.6],
  shadow: [0.6, 0.1],
};

/** 머리 가운데(입에서) — 입은 얼굴 앞 아래쪽에 있다 */
const HEAD: [number, number, number] = [-0.92, 0.37, 0];
const BODY_X = -1.08;
/** 이마 쿵 때 앞으로 쏠리는 최대 각도(라디안) */
const LUNGE = 0.13;

function Person({
  side,
  x,
  s,
  toon,
}: {
  side: "left" | "right";
  x: number;
  s: Side;
  toon: THREE.Texture;
}) {
  const { expr } = s;
  const shadow = expr === "shadow";
  const look = shadow ? LOOK.shadow : LOOK[side];
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const lipTop = useRef<THREE.Group>(null);
  const lipBot = useRef<THREE.Group>(null);
  const arms = useRef<(THREE.Group | null)[]>([]);
  const cheeks = useRef<THREE.Group>(null);
  const since = useRef({ expr, t: 0 });
  const heat = useRef(0);
  const lean = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (since.current.expr !== expr) since.current = { expr, t };
    const age = t - since.current.t;
    heat.current = THREE.MathUtils.lerp(
      heat.current,
      s.heat ?? 0,
      Math.min(1, dt * 6),
    );
    const h = heat.current;
    const jit = (amp: number) => (Math.random() - 0.5) * amp;

    if (root.current) {
      let y = 0;
      let rz = 0;
      let px = 0;
      let pz = 0;
      switch (expr) {
        case "ready":
          y = -0.06 + Math.sin(t * 9) * 0.025;
          px = jit(0.02);
          break;
        case "chew":
          y = Math.abs(Math.sin(t * (14 + h * 16))) * 0.04;
          rz = -0.03; // 살짝 숙이기(더 숙이면 머리가 앞으로 나가 얼굴이 가까워 보인다)
          px = jit(0.012 + h * 0.03);
          pz = jit(h * 0.04);
          break;
        case "hold":
          px = jit(0.01 + h * 0.03);
          y = jit(0.01);
          break;
        case "nervous":
          px = jit(0.05);
          pz = jit(0.04);
          break;
        case "win":
          y = Math.abs(Math.sin(t * 6.5)) * 0.42;
          break;
        case "lose":
          y = -0.12;
          rz = 0.1;
          break;
        case "ouch":
          y = age < 0.5 ? Math.sin((age / 0.5) * Math.PI) * 0.55 : 0;
          px = age > 0.5 ? jit(0.03) : 0;
          break;
        case "oops":
          px = jit(0.025);
          rz = 0.06;
          break;
        case "dizzy":
          rz = Math.sin(t * 3.2) * 0.12;
          y = age < 0.4 ? -Math.sin((age / 0.4) * Math.PI) * 0.15 : 0;
          break;
        case "shadow":
          y = Math.sin(t * 2) * 0.03;
          break;
        default:
          y = Math.sin(t * 2.4 + (side === "left" ? 0 : 1.3)) * 0.02;
      }
      root.current.position.set(px, y, pz);
      root.current.rotation.z = THREE.MathUtils.lerp(
        root.current.rotation.z,
        rz,
        Math.min(1, dt * 10),
      );
    }

    if (lean.current) lean.current.rotation.z = -LUNGE * (s.lunge ?? 0);
    if (head.current) {
      const chew = expr === "chew" ? Math.sin(t * (16 + h * 18)) * 0.035 : 0;
      head.current.position.set(HEAD[0], HEAD[1] + chew, HEAD[2]);
      const tilt =
        expr === "win"
          ? 0.15
          : expr === "lose"
            ? -0.28
            : expr === "dizzy"
              ? Math.sin(t * 3.2 + 1) * 0.15
              : 0;
      const lunge = s.lunge ?? 0;
      // 쿵 할 때는 고개를 푹 숙여 이마(앞머리)가 먼저 나가게 — 입은 아래로 물러난다
      head.current.rotation.z =
        lunge > 0
          ? tilt - 0.4 * lunge
          : THREE.MathUtils.lerp(
              head.current.rotation.z,
              tilt,
              Math.min(1, dt * 10),
            );
    }
    const open =
      expr === "chew" ? (Math.sin(t * (16 + h * 18)) + 1) * 0.035 : 0;
    if (lipTop.current) lipTop.current.position.y = 0.075 + open;
    if (lipBot.current) lipBot.current.position.y = -0.075 - open;
    if (cheeks.current) {
      const puff =
        expr === "hold"
          ? 1.45 + Math.sin(t * 20) * 0.04
          : expr === "chew"
            ? 1.15
            : 1;
      cheeks.current.scale.setScalar(
        THREE.MathUtils.lerp(
          cheeks.current.scale.x,
          puff,
          Math.min(1, dt * 12),
        ),
      );
    }

    const [fz, fx] = ARM[expr];
    arms.current.forEach((a, i) => {
      if (!a) return;
      let z = fz;
      let xx = fx * (i === 0 ? 1 : -1);
      if (expr === "win") z += Math.sin(t * 13 + i * Math.PI) * 0.15;
      if (expr === "chew")
        z += Math.sin(t * (10 + h * 10) + i * Math.PI) * 0.25; // 주먹 붕붕
      if (expr === "ready") z += Math.sin(t * 9 + i) * 0.08;
      if ((expr === "ouch" || expr === "oops") && i === 1) {
        z = 0.4;
        xx = 0;
      }
      a.rotation.z = THREE.MathUtils.lerp(
        a.rotation.z,
        z,
        Math.min(1, dt * 14),
      );
      a.rotation.x = THREE.MathUtils.lerp(
        a.rotation.x,
        xx,
        Math.min(1, dt * 14),
      );
    });
  });

  // 반쯤 카메라 쪽으로 몸을 돌린다. 오른쪽 사람은 반 바퀴 돌아 왼쪽을 본다.
  const turn = side === "left" ? -0.38 : Math.PI + 0.38;
  // 카메라 쪽 z 부호(오른쪽 사람은 돌아서 있어 반대)
  const near = side === "left" ? 1 : -1;

  return (
    <group position={[x, 0, 0]} rotation-y={turn}>
      {/* 발끝을 축으로 앞으로 쏠리기(이마 쿵) */}
      <group ref={lean} position={[BODY_X, FLOOR, 0]}>
        <group position={[-BODY_X, -FLOOR, 0]}>
          <group ref={root}>
            {(s.heat ?? 0) > 0.05 && !shadow && (
              <Aura color={look.aura} heat={s.heat ?? 0} />
            )}

            {/* 다리 + 신발 */}
            {[1, -1].map((z) => (
              <group key={z} position={[BODY_X, -1.95, z * 0.24]}>
                <Toon
                  toon={toon}
                  color={look.pants}
                  geo={<capsuleGeometry args={[0.16, 0.22, 6, 12]} />}
                />
                <Toon
                  toon={toon}
                  color={shadow ? look.pants : "#ffffff"}
                  position={[0.08, -0.24, 0]}
                  scale={[1.35, 0.7, 1]}
                  geo={<sphereGeometry args={[0.17, 14, 10]} />}
                />
              </group>
            ))}

            {/* 몸 */}
            <Toon
              toon={toon}
              color={look.shirt}
              position={[BODY_X, -1.32, 0]}
              scale={[0.95, 1, 0.98]}
              geo={<capsuleGeometry args={[0.56, 0.32, 10, 24]} />}
            />
            {!shadow && <Outfit side={side} near={near} toon={toon} />}

            {/* 팔 — 어깨를 축으로 돈다 */}
            {[near, -near].map((z, i) => (
              <group
                key={z}
                ref={(el) => {
                  arms.current[i] = el;
                }}
                position={[BODY_X + 0.06, -0.98, z * 0.6]}
              >
                <Toon
                  toon={toon}
                  color={look.shirt}
                  outline={0.02}
                  position={[0, -0.22, 0]}
                  geo={<capsuleGeometry args={[0.14, 0.26, 6, 12]} />}
                />
                <Toon
                  toon={toon}
                  color={look.skin}
                  position={[0, -0.5, 0]}
                  geo={<sphereGeometry args={[0.17, 16, 12]} />}
                />
              </group>
            ))}

            <group ref={head} position={HEAD}>
              <Head
                side={side}
                look={look}
                expr={expr}
                toon={toon}
                cheeks={cheeks}
                near={near}
              />
            </group>

            {/* 입술 — 막대 끝을 문다 */}
            {!shadow && expr !== "dizzy" && (
              <group position={[-0.05, 0, 0]}>
                <group ref={lipTop}>
                  <Toon
                    toon={toon}
                    color="#e9806f"
                    outline={0.07}
                    scale={[0.1, 0.06, 0.15]}
                    geo={<sphereGeometry args={[1, 16, 12]} />}
                  />
                </group>
                <group ref={lipBot}>
                  <Toon
                    toon={toon}
                    color="#e9806f"
                    outline={0.07}
                    scale={[0.1, 0.06, 0.15]}
                    geo={<sphereGeometry args={[1, 16, 12]} />}
                  />
                </group>
                {expr === "ouch" && (
                  <PopIn delay={0.45}>
                    <Toon
                      toon={toon}
                      color="#f6d7a7"
                      position={[0.03, -0.03, 0]}
                      rotation={[0, 0, -0.35]}
                      outline={0.05}
                      geo={<boxGeometry args={[0.13, 0.4, 0.32]} />}
                    />
                  </PopIn>
                )}
              </group>
            )}
          </group>
        </group>
      </group>
    </group>
  );
}

/** 옷 장식 — 왼쪽은 후드 끈·모자, 오른쪽은 깃·별 배지 */
function Outfit({
  side,
  near,
  toon,
}: {
  side: "left" | "right";
  near: number;
  toon: THREE.Texture;
}) {
  if (side === "left") {
    return (
      <group>
        {/* 등 뒤 후드 */}
        <Toon
          toon={toon}
          color="#ffc070"
          position={[BODY_X - 0.42, -0.86, 0]}
          scale={[0.5, 0.32, 0.62]}
          geo={<sphereGeometry args={[1, 18, 12]} />}
        />
        {/* 끈 두 가닥 */}
        {[0.16, -0.16].map((z) => (
          <Toon
            key={z}
            toon={toon}
            color="#ffffff"
            outline={0.06}
            position={[BODY_X + 0.52, -1.1, z]}
            rotation-z={0.25}
            geo={<capsuleGeometry args={[0.035, 0.26, 4, 8]} />}
          />
        ))}
        {/* 주머니 */}
        <Toon
          toon={toon}
          color="#f28a1e"
          outline={0.03}
          position={[BODY_X + 0.42, -1.6, 0]}
          scale={[0.22, 0.2, 0.5]}
          geo={<sphereGeometry args={[1, 14, 10]} />}
        />
      </group>
    );
  }
  return (
    <group>
      <mesh position={[BODY_X + 0.05, -0.8, 0]} rotation-z={Math.PI / 2 + 0.25}>
        <torusGeometry args={[0.36, 0.06, 8, 24]} />
        <meshToonMaterial color="#ffffff" gradientMap={toon} />
      </mesh>
      <mesh
        position={[BODY_X + 0.5, -1.18, near * 0.22]}
        rotation={[0, Math.PI / 2 - near * 0.4, 0]}
        scale={0.14}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#ffd34d" />
      </mesh>
    </group>
  );
}

/** 몸 둘레로 피어오르는 불꽃 알갱이 — 빨리 먹을수록 많이, 빠르게 */
function Aura({ color, heat }: { color: string; heat: number }) {
  const ref = useRef<THREE.Group>(null);
  const bits = 16;
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current?.children.forEach((m, i) => {
      const k = (t * (0.8 + heat * 1.6) + i * 0.137) % 1;
      const a = i * 2.39996;
      const r = 0.75 + 0.15 * Math.sin(i * 7.1);
      m.position.set(Math.cos(a) * r, -0.9 + k * 2.6, Math.sin(a) * r);
      m.scale.setScalar(
        i / bits < heat ? 0.09 * Math.sin(k * Math.PI) + 0.0001 : 0.0001,
      );
      m.rotation.set(t * 3 + i, t * 2, 0);
    });
  });
  return (
    <group ref={ref} position={[BODY_X, -1.1, 0]}>
      {Array.from({ length: bits }, (_, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={i % 3 ? color : "#fff3a8"}
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ───────────── 얼굴 ───────────── */

const INK = "#2b1a2e";
const ink = <meshBasicMaterial color={INK} />;

/** 머리 겉면 한 자리에, 바깥(법선)을 로컬 x 로 보게 붙인다 */
function OnFace({
  dir,
  r = 0.99,
  children,
}: {
  dir: [number, number, number];
  r?: number;
  children: React.ReactNode;
}) {
  const n = new THREE.Vector3(...dir).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(1, 0, 0),
    n,
  );
  return (
    <group position={n.clone().multiplyScalar(r).toArray()} quaternion={q}>
      {children}
    </group>
  );
}

function Head({
  side,
  look,
  expr,
  toon,
  cheeks,
  near,
}: {
  side: "left" | "right";
  look: (typeof LOOK)["left"];
  expr: Expr;
  toon: THREE.Texture;
  cheeks: RefObject<THREE.Group | null>;
  near: number;
}) {
  const shadow = expr === "shadow";
  return (
    <group>
      <Toon
        toon={toon}
        color={look.skin}
        scale={[1, 0.94, 1]}
        geo={<sphereGeometry args={[1, 40, 28]} />}
      />
      {/* 귀 */}
      {[1, -1].map((z) => (
        <Toon
          key={z}
          toon={toon}
          color={look.skin}
          position={[-0.12, -0.05, z * 0.97]}
          scale={[0.14, 0.2, 0.1]}
          geo={<sphereGeometry args={[1, 12, 10]} />}
        />
      ))}
      <Hair side={side} color={look.hair} toon={toon} near={near} />

      {shadow ? (
        <ShadowEyes />
      ) : (
        <>
          <group ref={cheeks}>
            {[1, -1].map((z) => (
              <OnFace key={z} dir={[0.62, -0.32, z * 0.72]} r={0.97}>
                <mesh scale={[0.06, 0.13, 0.2]}>
                  <sphereGeometry args={[1, 14, 10]} />
                  <meshBasicMaterial
                    color="#ff7f9c"
                    transparent
                    opacity={expr === "ouch" || expr === "hold" ? 0.95 : 0.6}
                  />
                </mesh>
              </OnFace>
            ))}
          </group>
          {[1, -1].map((z) => (
            <OnFace key={z} dir={[0.74, 0.08, z * 0.56]}>
              <Eye expr={expr} iris={look.iris} z={z} />
            </OnFace>
          ))}
          {[1, -1].map((z) => (
            <OnFace key={z} dir={[0.62, 0.5, z * 0.52]} r={1.0}>
              <Brow expr={expr} z={z} />
            </OnFace>
          ))}
          {(expr === "nervous" || expr === "oops" || expr === "hold") && (
            <Sweat />
          )}
          {expr === "chew" && <SweatFly />}
          {(expr === "ouch" || expr === "lose") && <Tears />}
          {expr === "dizzy" && (
            <>
              <Stars />
              <OnFace dir={[0.93, -0.36, 0]} r={0.99}>
                <mesh scale={[0.04, 0.07, 0.09]}>
                  <sphereGeometry args={[1, 12, 10]} />
                  {ink}
                </mesh>
              </OnFace>
            </>
          )}
          {expr === "win" && <Sparkles />}
        </>
      )}
    </group>
  );
}

function Eye({ expr, iris, z }: { expr: Expr; iris: string; z: number }) {
  const blink = useRef<THREE.Group>(null);
  const pupil = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (blink.current)
      blink.current.scale.y =
        (expr === "idle" || expr === "ready") && t % 3.1 < 0.1 ? 0.12 : 1;
    if (pupil.current) {
      const shake = expr === "nervous" ? 0.025 : 0;
      pupil.current.position.set(
        0.012,
        (Math.random() - 0.5) * shake,
        (Math.random() - 0.5) * shake,
      );
    }
  });

  const line = (len: number, rot: number, y = 0, w = 0.03) => (
    <mesh position={[0.01, y, 0]} rotation-x={rot}>
      <capsuleGeometry args={[w, len, 4, 8]} />
      {ink}
    </mesh>
  );

  switch (expr) {
    case "win":
      // 반짝반짝 별 눈
      return (
        <group>
          <mesh scale={[0.04, 0.2, 0.2]} rotation-x={Math.PI / 4}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#ffc93c" />
          </mesh>
          <mesh scale={[0.045, 0.24, 0.24]} rotation-x={Math.PI / 4}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color={INK} side={THREE.BackSide} />
          </mesh>
        </group>
      );
    case "hold":
    case "ouch":
      // > < 꾹 감은 눈
      return (
        <group rotation-x={z > 0 ? 0 : Math.PI}>
          <mesh position={[0.01, 0.05, 0.02]} rotation-x={0.75}>
            <capsuleGeometry args={[0.032, 0.15, 4, 8]} />
            {ink}
          </mesh>
          <mesh position={[0.01, -0.05, 0.02]} rotation-x={-0.75}>
            <capsuleGeometry args={[0.032, 0.15, 4, 8]} />
            {ink}
          </mesh>
        </group>
      );
    case "dizzy":
      return (
        <group>
          {line(0.22, 0.8)}
          {line(0.22, -0.8)}
        </group>
      );
    case "lose":
      // ㅠ — 내리깐 눈
      return (
        <group>
          {line(0.16, Math.PI / 2, 0.06)}
          <mesh position={[0.01, -0.04, 0]} scale={[0.05, 0.1, 0.1]}>
            <sphereGeometry
              args={[1, 10, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]}
            />
            {ink}
          </mesh>
        </group>
      );
    case "chew":
      // 결연한 눈 — 위가 일자로 잘린 눈동자
      return (
        <group>
          <mesh scale={[0.05, 0.17, 0.15]}>
            <sphereGeometry
              args={[1, 18, 12, 0, Math.PI * 2, 0.55, Math.PI - 0.55]}
            />
            <meshBasicMaterial color="#fff" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.015, -0.02, 0]} scale={[0.05, 0.13, 0.11]}>
            <sphereGeometry
              args={[1, 16, 12, 0, Math.PI * 2, 0.75, Math.PI - 0.75]}
            />
            <meshBasicMaterial color={iris} side={THREE.DoubleSide} />
          </mesh>
          <mesh
            position={[0.03, 0.12, 0]}
            rotation-x={(z > 0 ? -1 : 1) * 0.2 + Math.PI / 2}
          >
            <capsuleGeometry args={[0.035, 0.3, 4, 8]} />
            {ink}
          </mesh>
          <mesh position={[0.04, 0.02, 0.04]} scale={0.035}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
        </group>
      );
    case "nervous":
    case "oops": {
      // 흰자가 커지고 눈동자가 콩알만 해진다
      return (
        <group>
          <mesh scale={[0.05, 0.22, 0.17]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          <mesh scale={[0.05, 0.22, 0.17]}>
            <sphereGeometry args={[1.13, 18, 12]} />
            <meshBasicMaterial color={INK} side={THREE.BackSide} />
          </mesh>
          <group ref={pupil}>
            <mesh scale={[0.035, 0.06, 0.05]}>
              <sphereGeometry args={[1, 12, 10]} />
              {ink}
            </mesh>
          </group>
        </group>
      );
    }
    default:
      // 큰 눈 — 눈동자 + 반짝이 두 개
      return (
        <group ref={blink}>
          <mesh scale={[0.05, 0.2, 0.15]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshBasicMaterial color={INK} />
          </mesh>
          <mesh position={[0.012, -0.03, 0]} scale={[0.05, 0.14, 0.11]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshBasicMaterial color={iris} />
          </mesh>
          <mesh position={[0.04, 0.07, 0.04]} scale={0.05}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          <mesh position={[0.04, -0.08, -0.03]} scale={0.024}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
        </group>
      );
  }
}

function Brow({ expr, z }: { expr: Expr; z: number }) {
  // 로컬: y 위, z 옆(얼굴 바깥쪽이 z 부호). rotation-x 로 눈썹을 기울인다.
  const angry = expr === "chew" || expr === "ready";
  const worried =
    expr === "nervous" || expr === "oops" || expr === "lose" || expr === "hold";
  const tilt = angry ? -0.45 : worried ? 0.45 : expr === "ouch" ? 0.3 : 0;
  const lift = worried ? 0.05 : angry ? -0.04 : expr === "win" ? 0.06 : 0;
  if (expr === "chew") return null; // 먹을 땐 눈 위 굵은 선이 눈썹 몫
  return (
    <mesh position={[0, lift, 0]} rotation-x={Math.PI / 2 + z * tilt}>
      <capsuleGeometry args={[0.03, 0.17, 4, 8]} />
      {ink}
    </mesh>
  );
}

/** 그림자 상대의 빛나는 눈 */
function ShadowEyes() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.scale.y = t % 2.7 < 0.12 ? 0.1 : 1;
  });
  return (
    <group ref={ref}>
      {[1, -1].map((z) => (
        <OnFace key={z} dir={[0.74, 0.1, z * 0.5]} r={1.0}>
          <mesh scale={[0.04, 0.09, 0.17]} rotation-x={z * 0.25}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshBasicMaterial color="#fff6c8" />
          </mesh>
        </OnFace>
      ))}
    </group>
  );
}

function Hair({
  side,
  color,
  toon,
  near,
}: {
  side: "left" | "right";
  color: string;
  toon: THREE.Texture;
  near: number;
}) {
  // 둘 다 같은 동글동글 바가지 머리(성별 티가 나지 않게). 색과 머리 위 장식으로만 구분한다.
  return (
    <group>
      <Toon
        toon={toon}
        color={color}
        geo={<sphereGeometry args={[1.08, 40, 24, 0, Math.PI * 2, 0, 1.25]} />}
      />
      <Toon
        toon={toon}
        color={color}
        geo={
          <sphereGeometry
            args={[1.09, 40, 24, -Math.PI / 2 + 0.3, Math.PI - 0.6, 0, 1.95]}
          />
        }
      />
      {/* 짧은 앞머리 — 동글동글 세 덩이 */}
      {[0.4, 0, -0.4].map((z) => (
        <Toon
          key={z}
          toon={toon}
          color={color}
          position={[0.7, 0.5 - Math.abs(z) * 0.1, z]}
          rotation={[z * 0.6, 0, -0.6]}
          scale={[0.24, 0.3, 0.36]}
          geo={<sphereGeometry args={[1, 14, 10]} />}
        />
      ))}
      {side === "left" ? (
        // 새싹 두 잎
        <group position={[0, 1.08, 0]}>
          <Toon
            toon={toon}
            color="#6a8f3a"
            outline={0.06}
            position={[0, 0.12, 0]}
            geo={<cylinderGeometry args={[0.03, 0.03, 0.26, 6]} />}
          />
          {[1, -1].map((k) => (
            <Toon
              key={k}
              toon={toon}
              color="#7fd35a"
              outline={0.05}
              position={[0, 0.28, k * 0.13 * near]}
              rotation-x={k * 0.9}
              scale={[0.07, 0.18, 0.11]}
              geo={<sphereGeometry args={[1, 12, 8]} />}
            />
          ))}
        </group>
      ) : (
        // 꼬불 더듬이 한 가닥
        <Toon
          toon={toon}
          color={color}
          position={[-0.05, 1.18, 0]}
          rotation={[0, 0, 0.4]}
          outline={0.08}
          geo={<torusGeometry args={[0.2, 0.045, 8, 16, Math.PI * 1.3]} />}
        />
      )}
    </group>
  );
}

function Sweat() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    ref.current?.children.forEach((m, i) => {
      const k = (state.clock.elapsedTime * 1.3 + i * 0.5) % 1;
      m.position.y = 0.75 - k * 0.6;
      m.scale.setScalar(0.1 * (1 - k * 0.4));
    });
  });
  return (
    <group ref={ref}>
      {[0.95, -0.95].map((z) => (
        <mesh key={z} position={[-0.25, 0.7, z]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshToonMaterial color="#8fd0ff" />
        </mesh>
      ))}
    </group>
  );
}

/** 먹는 동안 머리 뒤로 튀는 땀방울 */
function SweatFly() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    ref.current?.children.forEach((m, i) => {
      const k = (state.clock.elapsedTime * 1.8 + i * 0.33) % 1;
      m.position.set(
        -0.6 - k * 1.1,
        0.9 + k * 0.5 - k * k * 1.2,
        (i - 1) * 0.6,
      );
      m.scale.setScalar(k > 0.85 ? 0.0001 : 0.08);
    });
  });
  return (
    <group ref={ref}>
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshToonMaterial color="#9ad8ff" />
        </mesh>
      ))}
    </group>
  );
}

function Tears() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    ref.current?.children.forEach((m, i) => {
      const k = (state.clock.elapsedTime * 1.6 + i * 0.5) % 1;
      m.position.y = -0.05 - k * 0.5;
    });
  });
  return (
    <group ref={ref}>
      {[0.52, -0.52].map((z) => (
        <mesh key={z} position={[0.78, 0, z]} scale={[0.06, 0.09, 0.06]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshToonMaterial color="#8fd0ff" />
        </mesh>
      ))}
    </group>
  );
}

function Stars() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 4;
  });
  return (
    <group position={[0, 1.3, 0]}>
      <group ref={ref}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 2) * 0.8,
              0,
              Math.sin((i * Math.PI) / 2) * 0.8,
            ]}
            scale={0.15}
          >
            <octahedronGeometry args={[1, 0]} />
            <meshToonMaterial color="#ffd34d" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Sparkles() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    ref.current?.children.forEach((m, i) => {
      const k = (state.clock.elapsedTime * 1.4 + i * 0.27) % 1;
      m.scale.setScalar(Math.sin(k * Math.PI) * 0.14);
      m.rotation.y = k * 3;
    });
  });
  const spots: [number, number, number][] = [
    [0.2, 1.4, 0.8],
    [0.6, 1.1, -0.8],
    [-0.4, 1.5, -0.3],
    [1.0, 0.6, 0.9],
    [-0.8, 1.0, 0.9],
  ];
  return (
    <group ref={ref}>
      {spots.map((p) => (
        <mesh key={p.join()} position={p}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#ffe066" />
        </mesh>
      ))}
    </group>
  );
}

/** 처음 나타날 때 톡 커지며 등장 */
function PopIn({
  delay = 0,
  children,
}: {
  delay?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  useFrame((state) => {
    if (!ref.current) return;
    if (born.current === null) born.current = state.clock.elapsedTime;
    const k = Math.min(
      1,
      Math.max(0, (state.clock.elapsedTime - born.current - delay) / 0.25),
    );
    const back = 1 + 2.2 * (k - 1) ** 3 + 1.2 * (k - 1) ** 2;
    ref.current.scale.setScalar(Math.max(0.0001, back));
  });
  return (
    <group ref={ref} scale={0.0001}>
      {children}
    </group>
  );
}

/* ───────────── 막대·효과 ───────────── */

const HANDLE = 18;

function Stick({
  from,
  to,
  toon,
}: {
  from: number;
  to: number;
  toon: THREE.Texture;
}) {
  const a = worldX(from);
  const b = worldX(to);
  const c = Math.max(a, worldX(HANDLE));
  return (
    <group>
      {c > a && (
        <Toon
          toon={toon}
          color="#f0c07a"
          outline={0.08}
          position={[(a + c) / 2, 0, 0]}
          rotation-z={Math.PI / 2}
          geo={<cylinderGeometry args={[0.085, 0.085, c - a, 16]} />}
        />
      )}
      {b > c && (
        <Toon
          toon={toon}
          color="#5b3221"
          outline={0.08}
          position={[(c + b) / 2, 0, 0]}
          rotation-z={Math.PI / 2}
          geo={<cylinderGeometry args={[0.11, 0.11, b - c, 16]} />}
        />
      )}
    </group>
  );
}

/** 부딪힌 자리에서 퍼지는 충격 고리 */
function Impact({ x }: { x: number }) {
  const ref = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  useFrame((state) => {
    if (!ref.current) return;
    if (born.current === null) born.current = state.clock.elapsedTime;
    const k = state.clock.elapsedTime - born.current;
    ref.current.children.forEach((m, i) => {
      const kk = Math.max(0, k - i * 0.08);
      m.scale.setScalar(0.2 + kk * 5);
      ((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity =
        Math.max(0, 0.9 - kk * 1.6);
    });
  });
  return (
    <group ref={ref} position={[x, 0.1, 0]}>
      {[0, 1].map((i) => (
        <mesh key={i}>
          <ringGeometry args={[0.8, 1, 40]} />
          <meshBasicMaterial
            color={i ? "#ffffff" : "#ffd34d"}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function CrumbMesh({ c }: { c: Crumb }) {
  const ref = useRef<THREE.Mesh>(null);
  const born = useRef<number | null>(null);
  const r = (n: number) => ((Math.sin(c.seed * 9301 + n * 49297) + 1) / 2) % 1;
  useFrame((state) => {
    if (!ref.current) return;
    if (born.current === null) born.current = state.clock.elapsedTime;
    const k = state.clock.elapsedTime - born.current;
    ref.current.position.set(
      worldX(c.at) + c.dir * (0.4 + r(1) * 1.0) * k,
      -0.05 + (1.2 + r(2) * 1.2) * k - 5 * k * k,
      (r(3) - 0.5) * 2 * k,
    );
    ref.current.rotation.set(k * 9 * r(4), k * 7, 0);
    ref.current.scale.setScalar(k > 0.8 ? 0.0001 : 0.035 + r(5) * 0.035);
  });
  return (
    <mesh ref={ref} scale={0.0001}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={r(6) < 0.6 ? "#5b3221" : "#e2ad66"} />
    </mesh>
  );
}

/** 똑 부러진 남은 조각이 빙글빙글 돌며 튀어 오른다 */
function FlyingPiece({
  x,
  mm,
  toon,
}: {
  x: number;
  mm: number;
  toon: THREE.Texture;
}) {
  const ref = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  useFrame((state) => {
    if (!ref.current) return;
    if (born.current === null) born.current = state.clock.elapsedTime;
    const k = Math.min(1, (state.clock.elapsedTime - born.current) / 0.7);
    const ease = 1 - (1 - k) ** 3;
    ref.current.position.set(x, ease * 1.4 + Math.sin(k * Math.PI) * 0.25, 0);
    ref.current.rotation.set(
      0,
      state.clock.elapsedTime * 1.5,
      ease * Math.PI * 4 + Math.PI / 2,
    );
  });
  return (
    <group ref={ref}>
      <Toon
        toon={toon}
        color="#5b3221"
        outline={0.08}
        geo={
          <cylinderGeometry args={[0.11, 0.11, Math.max(0.12, mm * U), 16]} />
        }
      />
    </group>
  );
}

/** 꽃가루 */
function Confetti() {
  const ref = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  const bits = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        x: ((i * 37) % 100) / 10 - 5,
        z: ((i * 53) % 30) / 10 - 1.5,
        delay: (i % 11) * 0.07,
        speed: 1.8 + (i % 5) * 0.3,
        color: ["#ffa53a", "#ffd34d", "#54c7a6", "#ffffff", "#9b7bff"][i % 5],
      })),
    [],
  );
  useFrame((state) => {
    if (!ref.current) return;
    if (born.current === null) born.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - born.current;
    ref.current.children.forEach((m, i) => {
      const b = bits[i];
      const k = Math.max(0, t - b.delay);
      m.position.set(b.x + Math.sin(k * 3 + i) * 0.25, 4 - k * b.speed, b.z);
      m.rotation.set(k * 5 + i, k * 4, k * 3);
      m.visible = m.position.y > FLOOR;
    });
  });
  return (
    <group ref={ref}>
      {bits.map((b, i) => (
        <mesh key={i} position={[b.x, 5, b.z]}>
          <boxGeometry args={[0.12, 0.2, 0.02]} />
          <meshBasicMaterial color={b.color} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
