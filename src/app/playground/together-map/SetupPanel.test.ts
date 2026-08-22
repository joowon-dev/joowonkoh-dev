import { describe, expect, it } from "vitest";
import { clampToRange, parseIfInRange } from "./SetupPanel";

describe("clampToRange", () => {
  it("빈 문자열은 0이 아니라 최소값으로 떨어진다", () => {
    // Number("") === 0 을 그대로 쓰면 지우는 도중에 판정 거리가 0이 되어
    // 항상 0건이 나오는 등 도구가 조용히 망가진다.
    expect(clampToRange("", 10, 2000)).toBe(10);
  });

  it("숫자가 아닌 입력도 최소값으로 떨어진다", () => {
    expect(clampToRange("abc", 50, 5000)).toBe(50);
  });

  it("최소값보다 작은 값은 최소값으로 올라간다", () => {
    expect(clampToRange("0", 10, 2000)).toBe(10);
  });

  it("최대값보다 큰 값은 최대값으로 내려간다", () => {
    expect(clampToRange("9999", 50, 5000)).toBe(5000);
  });

  it("범위 안의 값은 그대로 통과한다", () => {
    expect(clampToRange("150", 10, 2000)).toBe(150);
  });
});

describe("parseIfInRange", () => {
  it("빈 문자열은 타이핑 중이므로 null — 부모에 아무것도 올리지 않는다", () => {
    expect(parseIfInRange("", 10, 2000)).toBeNull();
  });

  it("숫자가 아닌 입력도 null이다", () => {
    expect(parseIfInRange("abc", 10, 2000)).toBeNull();
  });

  it("최소값 미만으로 아직 다 안 친 값은 null이다 — settings를 건드리지 않는다", () => {
    // min이 10인 필드에 "1"만 친 상태. clampToRange였다면 즉시 10으로
    // 눌러 담겨 커서가 튀었을 상황이다. parseIfInRange는 여기서 null을
    // 돌려줘 사용자가 이어서 "0"을 치게 놔둔다.
    expect(parseIfInRange("1", 10, 2000)).toBeNull();
  });

  it("최대값을 넘는 값도 null이다 — 범위 밖 값을 settings에 쓰지 않는다", () => {
    expect(parseIfInRange("99999", 0, 5000)).toBeNull();
  });

  it("파싱되고 이미 범위 안이면 그 숫자를 그대로 올린다", () => {
    expect(parseIfInRange("100", 10, 2000)).toBe(100);
  });

  it("경계값 자체는 범위 안으로 친다", () => {
    expect(parseIfInRange("10", 10, 2000)).toBe(10);
    expect(parseIfInRange("2000", 10, 2000)).toBe(2000);
  });
});

/**
 * NumberField의 동작을 키 입력 시퀀스로 재현한다.
 *
 * 실제 컴포넌트는 렌더 테스트 대상이 아니므로(이 프로젝트는 순수 함수만
 * 테스트한다), NumberField의 onChange/onBlur 안에서 실제로 호출하는 두 순수
 * 함수(parseIfInRange, clampToRange)를 같은 순서로 불러 "settings에 실제로
 * 무엇이 쓰이는가"를 검증한다.
 */
describe("NumberField 키 입력 시퀀스 (meetRadiusM, min=10, max=2000)", () => {
  function typeAndTrackSettings(keystrokes: string[]): number[] {
    // NumberField.onChange가 매 키 입력마다 하는 일: 파싱되고 범위 안일
    // 때만 settings를 갱신한다. 그 외에는 이전 값을 그대로 유지한다.
    let settingsValue = 100; // 시작값: 필드에 "100"이 표시돼 있다고 가정
    const history: number[] = [];
    for (const text of keystrokes) {
      const n = parseIfInRange(text, 10, 2000);
      if (n !== null) settingsValue = n;
      history.push(settingsValue);
    }
    return history;
  }

  it("100을 전체 선택하고 1, 0, 0을 차례로 치면: settings는 100→100→10→100", () => {
    // "1" 단계: parseIfInRange("1",10,2000)=null → settings는 이전 값(100) 유지
    // "10" 단계: parseIfInRange("10",10,2000)=10 → settings=10
    // "100" 단계: parseIfInRange("100",10,2000)=100 → settings=100
    const history = typeAndTrackSettings(["1", "10", "100"]);
    expect(history).toEqual([100, 10, 100]);
  });

  it("블러 시점에는 그 순간의 버퍼가 clampToRange로 확정된다", () => {
    // "1"만 치고 블러하면 텍스트 버퍼는 "1"이다. clampToRange("1",10,2000)=10.
    expect(clampToRange("1", 10, 2000)).toBe(10);
    // 이어서 "10"까지 치고 블러하면 그대로 10.
    expect(clampToRange("10", 10, 2000)).toBe(10);
    // "100"까지 마저 치고 블러하면 그대로 100 — 사용자가 원했던 값이다.
    expect(clampToRange("100", 10, 2000)).toBe(100);
  });

  it("필드를 비우고 아무것도 안 친 채 탭으로 빠져나가면 최소값으로 정착한다", () => {
    // onChange("")가 한 번 오고(버퍼="", settings는 이전 값 유지), 그 다음
    // onBlur가 온다. 블러 시점의 버퍼("")를 clampToRange가 최소값으로 정착시킨다.
    const n = parseIfInRange("", 10, 2000);
    expect(n).toBeNull(); // 타이핑 중에는 settings를 건드리지 않았다
    expect(clampToRange("", 10, 2000)).toBe(10); // 블러에서 최소값으로 정착
  });
});
