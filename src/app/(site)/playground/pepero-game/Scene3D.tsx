"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import * as THREE from "three";

import { clampMm, cm, STICK_MM } from "./rules";

/**
 * 막대과자를 사이에 둔 두 사람을 3D 로 그린다(three.js + react-three-fiber).
 * 장난감 같은 동글동글한 사람 둘 — 왼쪽은 먼저 한 사람(갈색 단발·분홍 옷), 오른쪽은 받은 사람(검정 머리·민트 옷).
 *
 * 입·얼굴이 맞닿아 보이는 장면은 그리지 않는다. 화면 속 틈은 Game 의 visibleGap 이 늘 남겨 둔다.
 * 말풍선·이름표·「앙!」 같은 글자는 3D 위에 얹은 HTML 이다(3D 자리를 화면 좌표로 바꿔 옮긴다).
 */

/* ───────────── 자리 ───────────── */

/** 1mm 당 3D 길이. 막대 15cm = 6. */
const U = 0.04;
export const worldX = (mm: number) => (mm - STICK_MM / 2) * U;
const FLOOR = -2.05;

export type Expr = "idle" | "chew" | "nervous" | "proud" | "meh" | "ouch" | "oops" | "mystery";

export interface Side {
  /** 입 자리(mm, 막대 왼쪽 끝에서) */
  at: number;
  expr: Expr;
  name: string;
  bubble?: string | null;
}

export interface Crumb {
  id: number;
  /** 튀어 나온 자리(mm) */
  at: number;
  /** 왼쪽 사람 쪽으로 튀면 -1 */
  dir: -1 | 1;
  seed: number;
}

interface Props {
  left: Side;
  right: Side;
  pickLeft?: number | null;
  pickRight?: number | null;
  onPick?: (mm: number) => void;
  /** 다 먹고 똑 부러져 튀어 오른 조각의 실제 길이(mm) */
  piece?: number | null;
  /** 깨문(부딪힌) 자리(mm) */
  bite?: number | null;
  /** 그 자리에 터지는 글자 — 기본 「앙!」 */
  burst?: string;
  sparkle?: boolean;
  confetti?: boolean;
  crumbs?: Crumb[];
  /** 카메라 — 가운데(mm)와 확대 배율 */
  cam?: { at: number; zoom: number };
  caption?: string;
}

const LOOK = {
  left: { skin: "#ffe0c9", hair: "#7a4a2c", shirt: "#ff8fab", label: "#ff8fab" },
  right: { skin: "#ffe5d1", hair: "#2f2a33", shirt: "#6cc4a9", label: "#38a88a" },
  mystery: { skin: "#ece3da", hair: "#cfc3b8", shirt: "#ddd2c8", label: "#c9bcb0" },
};

/* ───────────── 겉: 캔버스 + 글자 ───────────── */

/** 3D 자리를 화면 위 HTML 로 옮길 표지들 */
type Tag = "nameL" | "nameR" | "bubbleL" | "bubbleR" | "pickL" | "pickR" | "piece" | "bite" | "qmark";
type Anchors = Record<Tag, [number, number, number] | null>;

export default function Scene3D(props: Props) {
  const { left, right, pickLeft = null, pickRight = null, onPick, piece = null, bite = null, caption } = props;
  const wrap = useRef<HTMLDivElement>(null);
  const tags = useRef<Partial<Record<Tag, HTMLDivElement | null>>>({});
  /** 막대 양 끝의 화면 x(px) — 누른 자리를 mm 로 바꿀 때 쓴다. useFrame 에서 채운다. */
  const ends = useRef({ x0: 0, x1: 1 });
  const dragging = useRef(false);

  const xl = worldX(left.at);
  const xr = worldX(right.at);
  const mystery = right.expr === "mystery";
  const anchors: Anchors = {
    nameL: [xl - 1.1, FLOOR - 0.05, 0.7],
    nameR: [xr + 1.1, FLOOR - 0.05, 0.7],
    bubbleL: left.bubble ? [xl - 1.05, 2.0, 0] : null,
    bubbleR: right.bubble ? [xr + 1.05, 2.0, 0] : null,
    pickL: pickLeft !== null ? [worldX(pickLeft), 0.75, 0] : null,
    pickR: pickRight !== null ? [worldX(pickRight), 0.75, 0] : null,
    piece: piece !== null ? [(xl + xr) / 2, 2.15, 0] : null,
    bite: bite !== null ? [worldX(bite), 0.15, 0] : null,
    qmark: mystery ? [xr + 1.05, 0.7, 0.9] : null,
  };

  const pickAt = (clientX: number) => {
    if (!onPick || !wrap.current) return;
    const box = wrap.current.getBoundingClientRect();
    const { x0, x1 } = ends.current;
    const t = (clientX - box.left - x0) / (x1 - x0);
    onPick(clampMm(t * STICK_MM));
  };

  const tag = (k: Tag) => (el: HTMLDivElement | null) => {
    tags.current[k] = el;
  };

  return (
    <div
      ref={wrap}
      className={`pp-3d relative w-full select-none ${onPick ? "cursor-ew-resize" : ""}`}
      style={{ aspectRatio: "500 / 290", touchAction: onPick ? "none" : "pan-y" }}
      role="img"
      aria-label={caption ?? `${left.name}·${right.name} 둘이 막대과자를 양쪽에서 물고 있어요`}
      onPointerDown={(e) => {
        if (!onPick) return;
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        pickAt(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && pickAt(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <Canvas
        className="!absolute inset-0"
        dpr={[1, 2]}
        flat
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 27, position: [0, 0.9, 13], near: 0.1, far: 60 }}
      >
        <World
          {...props}
          anchors={anchors}
          tags={tags}
          onEnds={(x0, x1) => {
            ends.current = { x0, x1 };
          }}
        />
      </Canvas>

      {/* 3D 위 글자들 — 자리는 World 가 매 프레임 옮긴다 */}
      <div ref={tag("nameL")} className="pp-tag">
        <span className="pp-name" style={{ borderColor: LOOK.left.label }}>
          {left.name}
        </span>
      </div>
      <div ref={tag("nameR")} className="pp-tag">
        <span className="pp-name" style={{ borderColor: mystery ? LOOK.mystery.label : LOOK.right.label }}>
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
      {pickLeft !== null && (
        <div ref={tag("pickL")} className="pp-tag">
          <span className="pp-picklabel pp-display" style={{ background: "#ff8fab" }}>
            {cm(pickLeft)}cm 냠
          </span>
        </div>
      )}
      {pickRight !== null && (
        <div ref={tag("pickR")} className="pp-tag">
          <span className="pp-picklabel pp-display" style={{ background: "#38a88a" }}>
            {cm(STICK_MM - pickRight)}cm 냠
          </span>
        </div>
      )}
      {piece !== null && (
        <div ref={tag("piece")} className="pp-tag">
          <span className="pp-picklabel pp-display pp-drop-in" style={{ background: "#5b3221" }}>
            {cm(piece)}cm
          </span>
        </div>
      )}
      {bite !== null && (
        <>
          <div ref={tag("bite")} className="pp-tag">
            <span className="pp-burst pp-display">{props.burst ?? "앙!"}</span>
          </div>
          <div className="pp-flash-dom pointer-events-none absolute inset-0" />
        </>
      )}
      {mystery && (
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
  pickLeft = null,
  pickRight = null,
  piece = null,
  bite = null,
  sparkle = false,
  confetti = false,
  crumbs = [],
  cam,
  anchors,
  tags,
  onEnds,
}: Props & {
  anchors: Anchors;
  tags: RefObject<Partial<Record<Tag, HTMLDivElement | null>>>;
  /** 막대 양 끝의 화면 x(px) 를 알린다 */
  onEnds: (x0: number, x1: number) => void;
}) {
  const toon = useToonGradient();
  const shake = useRef(0);
  const prevBite = useRef<number | null>(null);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const { camera, size } = state;

    // 깨무는 순간 화면이 흔들린다.
    if (bite !== null && prevBite.current === null) shake.current = 0.5;
    prevBite.current = bite;
    shake.current = Math.max(0, shake.current - dt);
    const s = shake.current * 0.5;

    // 카메라 — 천천히 좌우로 돌며 입체감을 주고, 가까워지면 다가간다.
    const zoom = cam?.zoom ?? 1;
    const focus = cam ? worldX(cam.at) : 0;
    const dist = 15 / zoom;
    const swing = Math.sin(t * 0.35) * 0.2 + 0.12;
    camera.position.set(
      focus + Math.sin(swing) * dist + (Math.random() - 0.5) * s,
      0.9 + 0.35 / zoom + (Math.random() - 0.5) * s,
      Math.cos(swing) * dist,
    );
    camera.lookAt(focus, -0.15 + 0.15 * (zoom - 1), 0);

    // 3D 자리 → 화면 px 로 글자 옮기기
    const project = (p: [number, number, number]) => {
      v.set(p[0], p[1], p[2]).project(camera);
      return [((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height] as const;
    };
    (Object.keys(anchors) as Tag[]).forEach((k) => {
      const el = tags.current?.[k];
      const p = anchors[k];
      if (!el || !p) return;
      const [x, y] = project(p);
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.visibility = "visible";
    });
    onEnds(project([worldX(0), 0, 0])[0], project([worldX(STICK_MM), 0, 0])[0]);
  });

  const xl = worldX(left.at);
  const xr = worldX(right.at);

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 6, 8]} intensity={1.6} />
      <directionalLight position={[-6, 2, -4]} intensity={0.7} color="#ffd6e0" />

      {/* 발밑 그림자 */}
      <Blob x={xl - 1.1} />
      <Blob x={xr + 1.1} />

      <Person side="left" x={xl} expr={left.expr} toon={toon} />
      <Person side="right" x={xr} expr={right.expr} toon={toon} />

      {right.at - left.at > 0 && bite === null && piece === null && (
        <Stick from={left.at} to={right.at} toon={toon} />
      )}

      {pickLeft !== null && <PickSleeve from={0} to={pickLeft} color="#ff8fab" />}
      {pickRight !== null && <PickSleeve from={pickRight} to={STICK_MM} color="#38a88a" />}

      {crumbs.map((c) => (
        <CrumbMesh key={c.id} c={c} />
      ))}
      {piece !== null && <FlyingPiece x={(xl + xr) / 2} mm={piece} toon={toon} />}
      {sparkle && <Sparkles x={(xl + xr) / 2} />}
      {confetti && <Confetti />}
    </>
  );
}

/** 3단 명암 — 만화처럼 딱 끊어지는 그늘 */
function useToonGradient() {
  return useMemo(() => {
    const tex = new THREE.DataTexture(new Uint8Array([140, 140, 140, 255, 205, 205, 205, 255, 255, 255, 255, 255]), 3, 1);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function Blob({ x }: { x: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[x, FLOOR + 0.01, 0]}>
      <circleGeometry args={[0.95, 32]} />
      <meshBasicMaterial color="#5b3221" transparent opacity={0.1} />
    </mesh>
  );
}

/* ───────────── 사람 ───────────── */

/** 테두리 선 — 뒷면만 그린 조금 큰 껍데기 */
const OUTLINE = new THREE.MeshBasicMaterial({ color: "#3d2620", side: THREE.BackSide });

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

/** 팔 각도(라디안) — 아래로 늘어뜨린 팔에서 앞으로 얼마나 들었나 */
const ARM: Record<Expr, number> = {
  idle: 0.25,
  chew: 0.3,
  nervous: 1.15, // 주먹 꼭 쥐고 앞으로
  proud: 2.75, // 주먹 번쩍
  meh: 0.1,
  ouch: 2.05, // 입을 감싼다
  oops: 1.5,
  mystery: 0.2,
};

function Person({ side, x, expr, toon }: { side: "left" | "right"; x: number; expr: Expr; toon: THREE.Texture }) {
  const look = expr === "mystery" ? LOOK.mystery : LOOK[side];
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const lipTop = useRef<THREE.Group>(null);
  const lipBot = useRef<THREE.Group>(null);
  const armNear = useRef<THREE.Group>(null);
  const armFar = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const since = useRef({ expr, t: 0 });

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (since.current.expr !== expr) since.current = { expr, t };
    const age = t - since.current.t;

    if (root.current) {
      // 깨물리면 펄쩍
      const hop = expr === "ouch" && age < 0.55 ? Math.sin((age / 0.55) * Math.PI) * 0.45 : 0;
      root.current.position.y = hop;
    }
    if (head.current) {
      const chew = expr === "chew" ? Math.sin(t * 22) * 0.025 : 0;
      const breathe = Math.sin(t * 2.4 + (side === "left" ? 0 : 1.3)) * 0.015;
      head.current.position.y = 0.55 + chew + breathe;
      const tilt = expr === "nervous" ? Math.sin(t * 30) * 0.012 : expr === "proud" ? 0.12 : expr === "meh" ? -0.08 : 0;
      head.current.rotation.z = THREE.MathUtils.lerp(head.current.rotation.z, tilt, Math.min(1, dt * 10));
    }
    const open = expr === "chew" ? (Math.sin(t * 22) + 1) * 0.03 : 0;
    if (lipTop.current) lipTop.current.position.y = 0.085 + open;
    if (lipBot.current) lipBot.current.position.y = -0.085 - open;
    const target = ARM[expr] + (expr === "proud" ? Math.sin(t * 9) * 0.12 : 0);
    [armNear.current, armFar.current].forEach((a, i) => {
      if (!a) return;
      const want = i === 1 && (expr === "ouch" || expr === "proud") ? ARM.idle : target;
      a.rotation.z = THREE.MathUtils.lerp(a.rotation.z, want, Math.min(1, dt * 12));
    });
    if (eyes.current) {
      // 깜빡
      const blink = expr === "idle" && t % 3.4 < 0.12 ? 0.15 : 1;
      eyes.current.scale.y = blink;
    }
  });

  // 오른쪽 사람은 왼쪽을 본다 — y 축으로 반 바퀴. 카메라 쪽 팔은 z 가 +인 쪽.
  const near = side === "left" ? 1 : -1;

  return (
    <group position={[x, 0, 0]} rotation-y={side === "left" ? 0 : Math.PI}>
      <group ref={root}>
        {/* 몸 */}
        <Toon
          toon={toon}
          color={look.shirt}
          position={[-1.12, -1.28, 0]}
          scale={[1, 0.92, 0.95]}
          geo={<capsuleGeometry args={[0.66, 0.3, 10, 24]} />}
        />
        {/* 팔 — 어깨를 축으로 돈다 */}
        {[near, -near].map((z, i) => (
          <group key={z} ref={i === 0 ? armNear : armFar} position={[-1.12, -0.78, z * 0.66]}>
            <Toon
              toon={toon}
              color={look.shirt}
              outline={0}
              position={[0, -0.24, 0]}
              geo={<capsuleGeometry args={[0.15, 0.3, 6, 12]} />}
            />
            <Toon toon={toon} color={look.skin} position={[0, -0.55, 0]} geo={<sphereGeometry args={[0.17, 16, 12]} />} />
          </group>
        ))}

        <group ref={head} position={[0, 0.55, 0]}>
          <Head side={side} look={look} expr={expr} toon={toon} eyes={eyes} />
        </group>

        {/* 입술 — 막대 끝을 문다 */}
        {expr !== "mystery" && (
          <group position={[-0.07, 0, 0]}>
            <group ref={lipTop}>
              <Toon toon={toon} color="#ff8ea4" outline={0.06} scale={[0.11, 0.065, 0.16]} geo={<sphereGeometry args={[1, 16, 12]} />} />
            </group>
            <group ref={lipBot}>
              <Toon toon={toon} color="#ff8ea4" outline={0.06} scale={[0.11, 0.065, 0.16]} geo={<sphereGeometry args={[1, 16, 12]} />} />
            </group>
            {expr === "ouch" && (
              <PopIn delay={0.45}>
                <Toon
                  toon={toon}
                  color="#f6d7a7"
                  position={[0.02, -0.04, 0]}
                  rotation={[0, 0, -0.35]}
                  outline={0.05}
                  geo={<boxGeometry args={[0.14, 0.42, 0.34]} />}
                />
              </PopIn>
            )}
          </group>
        )}
      </group>
    </group>
  );
}

/** 머리 — (0,0,0) 이 목 위 머리 자리, 입은 (1.05, -0.55) 쯤. 오른쪽(+x)을 본다. */
function Head({
  side,
  look,
  expr,
  toon,
  eyes,
}: {
  side: "left" | "right";
  look: { skin: string; hair: string };
  expr: Expr;
  toon: THREE.Texture;
  eyes: RefObject<THREE.Group | null>;
}) {
  const mystery = expr === "mystery";
  return (
    <group position={[-1.05, 0, 0]}>
      {/* 얼굴 */}
      <Toon toon={toon} color={look.skin} geo={<sphereGeometry args={[1, 40, 28]} />} />
      {/* 코 */}
      <Toon toon={toon} color={look.skin} position={[0.97, 0.02, 0]} outline={0.08} geo={<sphereGeometry args={[0.09, 12, 10]} />} />
      <Hair side={side} color={look.hair} toon={toon} />

      {!mystery && (
        <>
          {/* 볼 */}
          {[1, -1].map((z) => (
            <mesh key={z} position={[0.67, -0.19, z * 0.67]} scale={[0.1, 0.12, 0.2]} rotation-y={z * 0.8}>
              <sphereGeometry args={[1, 12, 10]} />
              <meshBasicMaterial color="#ff8fa3" transparent opacity={expr === "ouch" ? 0.9 : 0.6} />
            </mesh>
          ))}
          <group ref={eyes}>
            {[1, -1].map((z) => (
              <Eye key={z} z={z} expr={expr} />
            ))}
          </group>
          {[1, -1].map((z) => (
            <Brow key={z} z={z} expr={expr} />
          ))}
          {(expr === "nervous" || expr === "meh" || expr === "oops") && <Sweat />}
          {expr === "ouch" && (
            <>
              <Tear />
              <Stars />
            </>
          )}
        </>
      )}
    </group>
  );
}

const INK = "#2c1d18";

function Eye({ z, expr }: { z: number; expr: Expr }) {
  // 얼굴 겉면, 앞쪽 살짝 위. 그룹을 돌려 로컬 x 가 얼굴 바깥(법선)을 보게 한다.
  const pos: [number, number, number] = [0.85, 0.23, z * 0.46];
  const turn = -Math.atan2(pos[2], pos[0]);
  const ink = <meshBasicMaterial color={INK} />;
  let body: React.ReactNode;
  switch (expr) {
    case "chew":
    case "proud":
      // ^ 눈
      body = (
        <mesh rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.11, 0.03, 8, 16, Math.PI]} />
          {ink}
        </mesh>
      );
      break;
    case "meh":
      body = (
        <mesh rotation-x={Math.PI / 2}>
          <capsuleGeometry args={[0.028, 0.16, 4, 8]} />
          {ink}
        </mesh>
      );
      break;
    case "ouch":
      // > < 눈
      body = (
        <group rotation-y={Math.PI / 2}>
          <mesh position={[0, 0.045, 0]} rotation-z={-0.6}>
            <capsuleGeometry args={[0.028, 0.12, 4, 8]} />
            {ink}
          </mesh>
          <mesh position={[0, -0.045, 0]} rotation-z={0.6}>
            <capsuleGeometry args={[0.028, 0.12, 4, 8]} />
            {ink}
          </mesh>
        </group>
      );
      break;
    case "nervous":
    case "oops":
      // 동그래진 눈 — 흰자 + 작은 눈동자
      body = (
        <>
          <mesh scale={[0.05, 0.18, 0.15]}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          <mesh scale={[0.05, 0.18, 0.15]}>
            <sphereGeometry args={[1.12, 16, 12]} />
            <meshBasicMaterial color={INK} side={THREE.BackSide} />
          </mesh>
          <mesh position={[0.045, 0, 0]} scale={[0.03, 0.075, 0.065]}>
            <sphereGeometry args={[1, 12, 10]} />
            {ink}
          </mesh>
        </>
      );
      break;
    default:
      body = (
        <>
          <mesh scale={[0.05, 0.15, 0.1]}>
            <sphereGeometry args={[1, 16, 12]} />
            {ink}
          </mesh>
          <mesh position={[0.04, 0.055, 0.02]} scale={0.032}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
        </>
      );
  }
  return (
    <group position={pos} rotation-y={turn}>
      {body}
    </group>
  );
}

function Brow({ z, expr }: { z: number; expr: Expr }) {
  const lift = expr === "nervous" || expr === "oops" ? 0.08 : 0;
  const tilt = expr === "ouch" ? -0.5 : expr === "nervous" || expr === "oops" ? 0.35 : 0.1;
  return (
    <mesh position={[0.74, 0.5 + lift, z * 0.455]} rotation={[Math.PI / 2, z * tilt, 0]}>
      <capsuleGeometry args={[0.025, 0.16, 4, 8]} />
      <meshBasicMaterial color={INK} />
    </mesh>
  );
}

function Hair({ side, color, toon }: { side: "left" | "right"; color: string; toon: THREE.Texture }) {
  if (side === "left") {
    // 갈색 단발 — 정수리 + 뒤로 내려온 단발 + 앞머리, 빨간 머리핀
    return (
      <group>
        <Toon toon={toon} color={color} geo={<sphereGeometry args={[1.08, 40, 24, 0, Math.PI * 2, 0, 1.15]} />} />
        <Toon toon={toon} color={color} geo={<sphereGeometry args={[1.1, 40, 28, -Math.PI / 2 - 0.5, Math.PI + 1, 0, 2.25]} />} />
        <Toon toon={toon} color={color} position={[0.55, 0.62, 0]} scale={[0.42, 0.25, 0.8]} geo={<sphereGeometry args={[1, 20, 14]} />} />
        <Toon toon={toon} color="#ff4d6d" position={[0.2, 0.92, 0.55]} outline={0.08} geo={<sphereGeometry args={[0.12, 12, 10]} />} />
      </group>
    );
  }
  // 검정 짧은 머리 — 정수리 + 뒤통수 + 삐친 머리 한 가닥
  return (
    <group>
      <Toon toon={toon} color={color} geo={<sphereGeometry args={[1.08, 40, 24, 0, Math.PI * 2, 0, 1.1]} />} />
      <Toon toon={toon} color={color} geo={<sphereGeometry args={[1.09, 40, 24, -Math.PI / 2 + 0.35, Math.PI - 0.7, 0, 1.85]} />} />
      {[0.15, -0.2, 0.5].map((z, i) => (
        <Toon
          key={z}
          toon={toon}
          color={color}
          position={[0.62, 0.6 - i * 0.02, z]}
          rotation={[0, 0, -2.0]}
          scale={[0.16, 0.34, 0.2]}
          geo={<coneGeometry args={[1, 1, 10]} />}
        />
      ))}
      <Toon
        toon={toon}
        color={color}
        position={[-0.1, 1.15, 0]}
        rotation={[0, 0, 0.4]}
        outline={0.08}
        geo={<torusGeometry args={[0.2, 0.045, 8, 16, Math.PI * 1.3]} />}
      />
    </group>
  );
}

function Sweat() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const k = (state.clock.elapsedTime * 1.1) % 1;
    ref.current.position.y = 0.7 - k * 0.5;
    ref.current.scale.setScalar(0.11 * (1 - k * 0.4));
  });
  return (
    <mesh ref={ref} position={[-0.3, 0.7, 1.0]}>
      <sphereGeometry args={[1, 12, 10]} />
      <meshToonMaterial color="#8fd0ff" />
    </mesh>
  );
}

function Tear() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const k = (state.clock.elapsedTime * 1.4) % 1;
    ref.current.position.y = 0.05 - k * 0.45;
  });
  return (
    <mesh ref={ref} position={[0.78, 0.05, 0.45]} scale={0.07}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshToonMaterial color="#8fd0ff" />
    </mesh>
  );
}

/** 머리 위를 빙글빙글 도는 별 */
function Stars() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 4;
  });
  return (
    <group position={[0, 1.35, 0]}>
      <group ref={ref}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 3) * 0.75, 0, Math.sin((i * Math.PI * 2) / 3) * 0.75]} scale={0.15}>
            <octahedronGeometry args={[1, 0]} />
            <meshToonMaterial color="#ffd34d" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** 처음 나타날 때 톡 커지며 등장 */
function PopIn({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  useFrame((state) => {
    if (!ref.current) return;
    if (born.current === null) born.current = state.clock.elapsedTime;
    const k = Math.min(1, Math.max(0, (state.clock.elapsedTime - born.current - delay) / 0.25));
    const back = 1 + 2.2 * (k - 1) ** 3 + 1.2 * (k - 1) ** 2; // 살짝 튕기는 등장
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

function Stick({ from, to, toon }: { from: number; to: number; toon: THREE.Texture }) {
  const a = worldX(from);
  const b = worldX(to);
  const c = Math.max(a, worldX(HANDLE));
  return (
    <group>
      {c > a && (
        <Toon
          toon={toon}
          color="#e8b46c"
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
          geo={<cylinderGeometry args={[0.105, 0.105, b - c, 16]} />}
        />
      )}
    </group>
  );
}

function PickSleeve({ from, to, color }: { from: number; to: number; color: string }) {
  const a = worldX(from);
  const b = worldX(to);
  const edge = color === "#ff8fab" ? b : a;
  return (
    <group>
      <mesh position={[(a + b) / 2, 0, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.2, 0.2, Math.max(0.001, b - a), 20, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[edge, 0, 0]} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.24, 0.035, 8, 28]} />
        <meshBasicMaterial color={color} />
      </mesh>
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
      worldX(c.at) + c.dir * (0.4 + r(1) * 0.8) * k,
      -0.05 + (0.9 + r(2)) * k - 4.5 * k * k,
      (r(3) - 0.5) * 1.6 * k,
    );
    ref.current.rotation.set(k * 9 * r(4), k * 7, 0);
    ref.current.scale.setScalar(k > 0.8 ? 0.0001 : 0.03 + r(5) * 0.03);
  });
  return (
    <mesh ref={ref} scale={0.0001}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={r(6) < 0.6 ? "#5b3221" : "#e2ad66"} />
    </mesh>
  );
}

/** 똑 부러진 남은 조각이 빙글빙글 돌며 튀어 오른다 */
function FlyingPiece({ x, mm, toon }: { x: number; mm: number; toon: THREE.Texture }) {
  const ref = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  useFrame((state) => {
    if (!ref.current) return;
    if (born.current === null) born.current = state.clock.elapsedTime;
    const k = Math.min(1, (state.clock.elapsedTime - born.current) / 0.7);
    const ease = 1 - (1 - k) ** 3;
    ref.current.position.set(x, ease * 1.55 + Math.sin(k * Math.PI) * 0.25, 0);
    ref.current.rotation.set(0, state.clock.elapsedTime * 1.5, ease * Math.PI * 4 + Math.PI / 2);
  });
  return (
    <group ref={ref}>
      <Toon toon={toon} color="#5b3221" outline={0.08} geo={<cylinderGeometry args={[0.105, 0.105, Math.max(0.12, mm * U), 16]} />} />
    </group>
  );
}

function Sparkles({ x }: { x: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    ref.current?.children.forEach((m, i) => {
      const k = (state.clock.elapsedTime * 1.2 + i * 0.27) % 1;
      m.scale.setScalar(Math.sin(k * Math.PI) * 0.13);
      m.rotation.y = k * 3;
    });
  });
  const spots: [number, number, number][] = [
    [-0.8, 0.9, 0.4],
    [0.8, 1.0, -0.2],
    [-0.45, -0.6, 0.6],
    [0.55, -0.5, 0.5],
    [0, 1.3, 0.3],
  ];
  return (
    <group ref={ref} position={[x, 0.2, 0]}>
      {spots.map((p) => (
        <mesh key={p.join()} position={p}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#ffd34d" />
        </mesh>
      ))}
    </group>
  );
}

/** 전설 등급에 내리는 꽃가루 */
function Confetti() {
  const ref = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  const bits = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        x: ((i * 37) % 80) / 10 - 4,
        z: ((i * 53) % 30) / 10 - 1.5,
        delay: (i % 9) * 0.08,
        speed: 1.6 + (i % 5) * 0.25,
        color: ["#5b3221", "#ff8fab", "#e8b46c", "#ffd34d", "#6cc4a9"][i % 5],
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
      m.position.set(b.x + Math.sin(k * 3 + i) * 0.2, 3.6 - k * b.speed, b.z);
      m.rotation.set(k * 5 + i, k * 4, k * 3);
      m.visible = m.position.y > FLOOR;
    });
  });
  return (
    <group ref={ref}>
      {bits.map((b, i) => (
        <mesh key={i} position={[b.x, 4, b.z]}>
          <boxGeometry args={[0.1, 0.18, 0.02]} />
          <meshBasicMaterial color={b.color} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
