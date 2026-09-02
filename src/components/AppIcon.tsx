import type { IconName, Project } from "@/lib/projects";

/**
 * 플레이그라운드 앱 아이콘.
 *
 * 이모지를 쓰지 않았다. 이모지는 기기마다 그림이 달라서 아이콘이라기보다
 * 스티커처럼 보이고, 무엇보다 "그 프로젝트 안에 실제로 뭐가 있는지"를
 * 못 담는다. 각 그림은 해당 프로젝트가 화면에서 실제로 보여주는 것
 * (똥 말랑의 고양이, 코인 밀기의 코인더미)을 그대로 줄인 것이다.
 *
 * 모두 64×64 좌표계에 그린다. 타일 배경은 프로젝트별 색이라 여기서 안 그리고,
 * 그림만 투명 배경으로 얹는다.
 */

/** 똥 말랑 — 힘주는 고양이 얼굴 */
function Cat() {
  return (
    <>
      <path d="M14 26 L16 12 L28 20 Z" fill="#f7dcc8" stroke="#c98f7c" strokeWidth="2" />
      <path d="M50 26 L48 12 L36 20 Z" fill="#f7dcc8" stroke="#c98f7c" strokeWidth="2" />
      <ellipse cx="32" cy="36" rx="20" ry="17" fill="#f7dcc8" stroke="#c98f7c" strokeWidth="2" />
      {/* 힘주느라 꼭 감은 눈 */}
      <path
        d="M20 33 Q24 29 28 33 M36 33 Q40 29 44 33"
        stroke="#4a352c"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="19" cy="41" rx="4" ry="2.6" fill="#e08f86" opacity="0.75" />
      <ellipse cx="45" cy="41" rx="4" ry="2.6" fill="#e08f86" opacity="0.75" />
      <path d="M30 39 L34 39 L32 42 Z" fill="#e08f86" />
    </>
  );
}

/** 타자 농구 — 백보드와 림, 그리고 공 */
function Hoop() {
  return (
    <>
      <rect x="14" y="12" width="36" height="24" rx="2" fill="#eef3fa" />
      <rect x="26" y="20" width="12" height="10" fill="none" stroke="#e8622c" strokeWidth="2.4" />
      <rect x="22" y="35" width="20" height="3.4" rx="1.7" fill="#f0682c" />
      <path d="M24 39 L27 47 M32 39 L32 48 M40 39 L37 47" stroke="#f2efe6" strokeWidth="1.8" />
      <circle cx="32" cy="54" r="7" fill="#d9762e" />
      <path d="M25 54 H39 M32 47 V61" stroke="#89441a" strokeWidth="1.6" />
    </>
  );
}

/** 낙서 댄스 — 종이 위 낙서 한 줄 */
function Doodle() {
  return (
    <>
      <rect x="12" y="10" width="40" height="44" rx="3" fill="#fffdf5" stroke="#d8cdb0" strokeWidth="2" />
      <path
        d="M20 42 Q24 22 30 34 T40 26 Q45 22 46 36"
        stroke="#2f2a22"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="46" cy="36" r="3" fill="#e8532e" />
    </>
  );
}

/** 개바리 댄스 — 귀 늘어진 강아지 */
function Dog() {
  return (
    <>
      <ellipse cx="16" cy="34" rx="6.5" ry="12" fill="#b98a5e" />
      <ellipse cx="48" cy="34" rx="6.5" ry="12" fill="#b98a5e" />
      <ellipse cx="32" cy="33" rx="18" ry="16" fill="#e8c39a" />
      <circle cx="25" cy="30" r="3" fill="#3a2b1d" />
      <circle cx="39" cy="30" r="3" fill="#3a2b1d" />
      <ellipse cx="32" cy="41" rx="9" ry="7" fill="#f6e0c6" />
      <ellipse cx="32" cy="38" rx="3.4" ry="2.6" fill="#3a2b1d" />
      <path d="M32 41 v3" stroke="#3a2b1d" strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
}

/** WebSwing — 거미줄 */
function Web() {
  return (
    <>
      <g stroke="#9fb4e8" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M32 6 V54 M10 12 L54 52 M54 12 L10 52 M6 32 H58" />
        <path d="M32 16 L45 24 L48 38 L32 46 L16 38 L19 24 Z" />
        <path d="M32 26 L39 30 L40 38 L32 42 L24 38 L25 30 Z" />
      </g>
      <circle cx="32" cy="34" r="3.4" fill="#e8532e" />
    </>
  );
}

/** 구슬 폭포 추첨기 — 양동이에 떨어지는 구슬 */
function Marble() {
  return (
    <>
      <circle cx="22" cy="15" r="6" fill="#e8532e" />
      <circle cx="40" cy="22" r="6" fill="#4fa8d8" />
      <circle cx="29" cy="30" r="6" fill="#f2b134" />
      <path d="M14 38 H50 L45 58 H19 Z" fill="#cfe0f2" stroke="#7f97b5" strokeWidth="2.2" />
      <circle cx="26" cy="48" r="5" fill="#7ac74f" />
      <circle cx="38" cy="49" r="5" fill="#d8618f" />
    </>
  );
}

/** 코인 밀기 추첨기 — 쌓인 코인 */
function Coin() {
  return (
    <>
      {[42, 33, 24].map((y, i) => (
        <g key={y}>
          <ellipse cx="32" cy={y + 5} rx="19" ry="7" fill="#c98a1e" />
          <ellipse cx="32" cy={y} rx="19" ry="7" fill="#f2c14e" stroke="#c98a1e" strokeWidth="1.6" />
          {i === 2 && <ellipse cx="32" cy={y} rx="9" ry="3.2" fill="#ffe49a" />}
        </g>
      ))}
    </>
  );
}

/** 부장님 째려보기 — 옆을 흘겨보는 눈 */
function Eye() {
  return (
    <>
      <path
        d="M6 32 Q32 12 58 32 Q32 52 6 32 Z"
        fill="#ffffff"
        stroke="#8a5a55"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="42" cy="32" r="9" fill="#4a352c" />
      <circle cx="45" cy="29" r="3" fill="#ffffff" />
      {/* 치켜뜬 눈썹이 있어야 '째려본다'가 된다 */}
      <path d="M12 18 Q30 10 50 16" stroke="#8a5a55" strokeWidth="3" strokeLinecap="round" fill="none" />
    </>
  );
}

/** 종이비행기 날리기 — 접힌 종이비행기 */
function Plane() {
  return (
    <>
      <path d="M8 30 L56 12 L34 52 Z" fill="#ffffff" stroke="#7aa8c4" strokeWidth="2" strokeLinejoin="round" />
      <path d="M56 12 L28 36 L34 52 Z" fill="#dceefb" stroke="#7aa8c4" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 30 L28 36" stroke="#7aa8c4" strokeWidth="2" />
      <path d="M10 46 Q18 42 24 46" stroke="#9dc7de" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </>
  );
}

/** joowonkoh.com — 코드 */
function Code() {
  return (
    <>
      <path
        d="M24 20 L12 32 L24 44 M40 20 L52 32 L40 44"
        stroke="#3b3f4a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M36 16 L28 48" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

/** 오늘의 찜질방 — 김 오르는 양머리 수건 */
function Sauna() {
  return (
    <>
      <path
        d="M23 22 Q19 17 23 12 Q27 7 23 3 M41 22 Q45 17 41 12 Q37 7 41 3"
        stroke="#c9a06a"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* 양머리로 말아 올린 양쪽 귀 */}
      <circle cx="18" cy="36" r="8" fill="#ffffff" stroke="#c9a06a" strokeWidth="2" />
      <circle cx="46" cy="36" r="8" fill="#ffffff" stroke="#c9a06a" strokeWidth="2" />
      <path
        d="M12 40 Q32 30 52 40 Q52 54 32 54 Q12 54 12 40 Z"
        fill="#ffffff"
        stroke="#c9a06a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M22 46 H42" stroke="#e2c39a" strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}

/** DeskTroy — 널빤지를 두른 트로이 목마와 창턱에 꽂힌 깃발 */
function Horse() {
  return (
    <>
      {/* 받침대 */}
      <rect x="10" y="52" width="44" height="5" rx="2" fill="#8a5a2b" />
      {/* 뒷다리 · 몸통 · 목 · 머리를 한 덩어리로. 작은 크기에서는 실루엣만 읽힌다 */}
      <path
        d="M26 52 L28 38 Q26 26 34 22 L36 12 L42 18 L48 20 Q52 26 48 32 L46 52"
        fill="none"
        stroke="#8a5a2b"
        strokeWidth="2"
      />
      <path
        d="M28 38 Q26 26 34 22 L36 12 L42 18 L48 20 Q52 26 48 32 Q46 44 34 44 Q28 44 28 38 Z"
        fill="#c08a4e"
        stroke="#6f4520"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 널빤지 띠 — 통짜 갈색 덩어리는 진짜 말로 읽힌다 */}
      <path
        d="M31 25 Q37 22 42 24 M30 32 Q38 29 46 31 M30 38 Q38 36 46 37"
        stroke="#6f4520"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* 들어올린 앞다리. 목보다 짙어야 목에 달라붙지 않는다 */}
      <path
        d="M32 40 L22 34 L18 38"
        stroke="#8a5a2b"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 뒷다리 */}
      <path d="M42 43 L44 52 M34 43 L32 52" stroke="#8a5a2b" strokeWidth="3.4" strokeLinecap="round" />
      {/* 해치 */}
      <rect x="35" y="31" width="7" height="7" rx="1" fill="#3a2410" />
      {/* 깃발 */}
      <path d="M14 52 V30" stroke="#6f4520" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 31 L24 34 L14 38 Z" fill="#c8402f" />
    </>
  );
}

/** 포수 시점 — 코앞까지 날아온 공과, 그 뒤로 남은 자국 */
function Mitt() {
  return (
    <>
      {/*
        멀리서 코앞까지 오는 동안 공이 커지는 그 가속이 이 페이지의 전부라,
        아이콘도 작은 공 하나와 큰 공 하나로 그 간격만 보여준다.
      */}
      <path
        d="M18 13 Q26 26 34 44"
        stroke="#ff5c4d"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <circle cx="18" cy="13" r="3.2" fill="#f2efe8" opacity="0.55" />
      {/* 포수 미트 — 공 뒤에 반쯤 가려 놓는다 */}
      <path
        d="M12 52 Q12 34 30 33 Q48 34 50 50 Q50 58 31 58 Q13 58 12 52 Z"
        fill="#8a5a30"
      />
      <path d="M20 40 Q31 36 42 41" stroke="#5f3c1e" strokeWidth="2" fill="none" />
      {/* 코앞의 공 */}
      <circle cx="34" cy="44" r="14" fill="#f7f5f0" />
      <path
        d="M25 35 Q31 44 25 53 M43 35 Q37 44 43 53"
        stroke="#c0292c"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="29" cy="39" r="5" fill="#ffffff" opacity="0.45" />
    </>
  );
}

/** 아이맥스 1열 — 1열에서 올려다본 곡면 스크린과 그 위에 걸린 얼굴 */
function Imax() {
  return (
    <>
      {/*
        아래가 넓고 위가 좁은 사다리꼴. 위아래 모서리가 활처럼 휘어 있다.
        페이지가 실제로 만들어내는 화면이 딱 이 모양이라 그대로 옮겼다.
      */}
      <path d="M5 53 Q32 61 59 53 L47 15 Q32 10 17 15 Z" fill="#5b6d92" />
      {/*
        얼굴은 스크린보다 작게 둔다. 꽉 채우면 스크린 테두리와 얼굴 윤곽이
        하나로 붙어서, 극장이 아니라 유령 한 마리로 읽힌다.
      */}
      <ellipse cx="32" cy="35" rx="13.5" ry="16" fill="#f3d3ae" />
      {/* 멀어서 작아진 눈 */}
      <ellipse cx="27" cy="29" rx="2.4" ry="1.6" fill="#2b3145" />
      <ellipse cx="37" cy="29" rx="2.4" ry="1.6" fill="#2b3145" />
      {/* 코앞이라 거대해진 입 */}
      <ellipse cx="32" cy="42" rx="7" ry="4.6" fill="#8c3b3b" />
      {/* 스크린을 두르는 검은 마스킹 */}
      <path
        d="M5 53 Q32 61 59 53 L47 15 Q32 10 17 15 Z"
        fill="none"
        stroke="#161a26"
        strokeWidth="3"
      />
      {/* 1열이라 앞에 뒤통수가 없다. 아래에 보이는 건 무대 앞턱과 스피커다 */}
      <path d="M2 61 Q32 54 62 61 L62 64 L2 64 Z" fill="#0d1018" />
      {/* EXIT 등. 스크린 밖 옆벽에 있다 */}
      <circle cx="4" cy="48" r="1.8" fill="#3ad17f" />
      <circle cx="60" cy="48" r="1.8" fill="#3ad17f" />
    </>
  );
}

/** 몰래 야구 — 검은 공에 실밥 두 줄. 앱 아이콘과 같은 그림이다. */
function Baseball() {
  return (
    <>
      <circle cx="32" cy="32" r="21" fill="#101013" />
      <path
        d="M17 17 A22 22 0 0 1 17 47"
        fill="none"
        stroke="#f6f6f2"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M47 17 A22 22 0 0 0 47 47"
        fill="none"
        stroke="#f6f6f2"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </>
  );
}

const ICONS: Record<IconName, () => React.ReactElement> = {
  cat: Cat,
  hoop: Hoop,
  doodle: Doodle,
  dog: Dog,
  web: Web,
  marble: Marble,
  coin: Coin,
  eye: Eye,
  plane: Plane,
  code: Code,
  sauna: Sauna,
  horse: Horse,
  imax: Imax,
  baseball: Baseball,
  mitt: Mitt,
};

/**
 * 아이콘 타일 하나. 정사각형이고 모서리는 22% 둥글다 —
 * iOS 홈 화면과 같은 비율이라 '앱'으로 읽힌다.
 */
export default function AppIcon({ project }: { project: Project }) {
  const Glyph = ICONS[project.icon];
  return (
    <span
      aria-hidden
      className="block aspect-square w-full overflow-hidden rounded-[22%] shadow-ambient ring-1 ring-black/5"
      style={{ background: `linear-gradient(160deg, ${project.tile[0]}, ${project.tile[1]})` }}
    >
      <svg viewBox="0 0 64 64" className="h-full w-full p-[14%]">
        <Glyph />
      </svg>
    </span>
  );
}
