import { useEffect, useState } from "react";
import type { LangPref } from "./i18n";
import { LANGS, type Strings } from "./i18n";
import { DURATIONS, SIZES } from "./encode";
import type { CameraMode } from "./camera";

// 이 파일은 순수한 표현 컴포넌트다. 상태를 갖지 않는다 — settings와 onChange를
// 받아 그리기만 하고, 무엇을 바꿀지는 부모가 정한다.

export interface Settings {
  langPref: LangPref;
  useRawData: boolean;
  accuracyLimitM: number;
  outlier: "conservative" | "off";
  exactDates: boolean;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  videoTitle: string;
  durationSec: number;
  camera: CameraMode;
  sizeIndex: number;
  nameA: string;
  nameB: string;
  colorA: string;
  colorB: string;
  meetRadiusM: number;
  meetMinMinutes: number;
  hideHome: boolean;
  hideHomeRadiusM: number;
  showSummary: boolean;
}

interface SetupPanelProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  strings: Strings;
}

const fieldsetClass = "mt-6 rounded-2xl border border-border bg-card-bg p-4";
const legendClass = "px-1 text-xs font-medium text-text-muted";
const labelClass = "mt-3 block text-sm text-text-primary";
const numberInputClass =
  "mt-1.5 w-full rounded-2xl border border-border bg-card-bg px-3 py-2 text-sm text-text-primary outline-none spring-transition focus:border-accent";
const checkboxRowClass = "mt-3 flex items-center gap-2 text-sm text-text-primary";

/**
 * 숫자 입력을 min~max로 눌러 담는다.
 *
 * <input type="number">의 min/max는 화살표 버튼과 폼 제출 검증에만 관여하고,
 * 타이핑 중에는 아무 값이나 그대로 들어온다. 특히 지우는 중에는 빈 문자열이
 * Number("") === 0 이 되어 선언한 최소값 아래로 그대로 settings에 박힌다.
 * 만남 판정 거리가 0이 되면 항상 0건이 나오고, 집 반경이 0이 되면 프라이버시
 * 원이 사라지는데 체크박스는 여전히 켜진 것처럼 보인다 — 둘 다 조용히
 * 위험하다. 빈 문자열은 0이 아니라 "다시 입력하는 중"으로 보고 최소값으로
 * 떨어뜨려, 사용자가 마저 타이핑하는 동안에도 도구가 정상 범위를 유지하게 한다.
 */
export function clampToRange(raw: string, min: number, max: number): number {
  if (raw === "") return min;
  const n = Number(raw);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/**
 * 타이핑 도중에 이 값을 부모(settings)로 올려도 되는지 결정한다.
 *
 * clampToRange를 타이핑 중 onChange에 바로 쓰면 다른 문제가 생긴다 — 100을
 * 110으로 고치려고 필드를 전체 선택한 뒤 "1"만 친 순간, min이 10이라면
 * clampToRange("1", 10, 2000)이 즉시 10을 돌려주고 입력창이 10으로 다시
 * 그려진다. 커서가 튀고 사용자가 이어서 치는 숫자는 엉뚱한 자리에 붙는다.
 * 그래서 "파싱되고 이미 범위 안에 있는 값"일 때만 올린다 — 그 외에는 null을
 * 반환해 부모를 건드리지 않고, 사용자가 마저 입력하게 놔둔다.
 */
export function parseIfInRange(raw: string, min: number, max: number): number | null {
  if (raw === "") return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

/**
 * 숫자 입력 하나. 화면에 보이는 글자는 settings가 아니라 이 컴포넌트만의
 * 임시 버퍼(text)다 — 그래서 "100"을 지우고 "1"만 친 상태처럼 아직 범위
 * 밖인 문자열도 화면에는 그대로 남는다.
 *
 * - onChange: 버퍼는 항상 갱신한다. 부모에는 파싱되고 범위 안일 때만 올린다.
 * - onBlur: 그 순간의 버퍼를 clampToRange로 확정한다 — 비어 있거나 범위
 *   밖으로 포커스를 떠나면 그제서야 유효한 값으로 정착한다.
 * - value(prop)가 바깥에서 바뀌면(예: 부모가 settings를 리셋) 버퍼도 따라간다.
 */
function NumberField({
  id,
  min,
  max,
  value,
  onChange,
  disabled,
}: {
  id: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <input
      id={id}
      type="number"
      min={min}
      max={max}
      disabled={disabled}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const n = parseIfInRange(raw, min, max);
        if (n !== null) onChange(n);
      }}
      onBlur={() => {
        const clamped = clampToRange(text, min, max);
        setText(String(clamped));
        onChange(clamped);
      }}
      className={`${numberInputClass} disabled:cursor-not-allowed disabled:opacity-40`}
    />
  );
}

/** 라디오 버튼 묶음. 코드가 반복되는 사람/카메라/거리비/이상치/영상 길이 다섯 군데서 쓴다. */
function RadioGroup<T extends string | number>({
  name,
  options,
  value,
  onSelect,
}: {
  name: string;
  options: { value: T; label: string }[];
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup">
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        const selected = opt.value === value;
        return (
          <label
            key={id}
            htmlFor={id}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium spring-transition ${
              selected
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-text-secondary hover:border-accent/40"
            }`}
          >
            <input
              id={id}
              type="radio"
              name={name}
              className="sr-only"
              checked={selected}
              onChange={() => onSelect(opt.value)}
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

export default function SetupPanel({ settings, onChange, strings }: SetupPanelProps) {
  const sizeLabel = (shape: (typeof SIZES)[number]["shape"]) =>
    shape === "square"
      ? strings.sizeSquare
      : shape === "portrait"
        ? strings.sizePortrait
        : strings.sizeLandscape;

  return (
    <div className="w-full">
      {/* 사람 */}
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{strings.personA} · {strings.personB}</legend>

        <label htmlFor="nameA" className={labelClass}>
          {strings.personA}
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            id="nameA"
            type="text"
            value={settings.nameA}
            onChange={(e) => onChange({ nameA: e.target.value })}
            className="w-full rounded-2xl border border-border bg-card-bg px-3 py-2 text-sm text-text-primary outline-none spring-transition focus:border-accent"
          />
          {/* 색은 이름과 짝을 이루는 보조 값이라 별도 문구를 새로 만들지 않고
              같은 사람의 이름 문구를 접근성 라벨로 재사용한다. */}
          <label htmlFor="colorA" className="sr-only">
            {strings.personA}
          </label>
          <input
            id="colorA"
            type="color"
            value={settings.colorA}
            onChange={(e) => onChange({ colorA: e.target.value })}
            className="h-9 w-11 shrink-0 rounded-lg border border-border bg-card-bg p-0.5"
          />
        </div>

        <label htmlFor="nameB" className={labelClass}>
          {strings.personB}
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            id="nameB"
            type="text"
            value={settings.nameB}
            onChange={(e) => onChange({ nameB: e.target.value })}
            className="w-full rounded-2xl border border-border bg-card-bg px-3 py-2 text-sm text-text-primary outline-none spring-transition focus:border-accent"
          />
          <label htmlFor="colorB" className="sr-only">
            {strings.personB}
          </label>
          <input
            id="colorB"
            type="color"
            value={settings.colorB}
            onChange={(e) => onChange({ colorB: e.target.value })}
            className="h-9 w-11 shrink-0 rounded-lg border border-border bg-card-bg p-0.5"
          />
        </div>

        <label htmlFor="langPref" className={labelClass}>
          {strings.language}
        </label>
        <select
          id="langPref"
          value={settings.langPref}
          onChange={(e) => onChange({ langPref: e.target.value as LangPref })}
          className={numberInputClass}
        >
          <option value="system">{strings.systemDefault}</option>
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </fieldset>

      {/* 데이터 */}
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{strings.accuracyLimit}</legend>

        <label htmlFor="useRawData" className={checkboxRowClass}>
          <input
            id="useRawData"
            type="checkbox"
            checked={settings.useRawData}
            onChange={(e) => onChange({ useRawData: e.target.checked })}
            className="accent-accent"
          />
          {strings.useRawData}
        </label>

        <label htmlFor="accuracyLimitM" className={labelClass}>
          {strings.accuracyLimit}
        </label>
        <NumberField
          id="accuracyLimitM"
          min={0}
          max={5000}
          value={settings.accuracyLimitM}
          onChange={(v) => onChange({ accuracyLimitM: v })}
        />

        <span className={`${labelClass} mb-0`}>{strings.outlierFilter}</span>
        <RadioGroup
          name="outlier"
          value={settings.outlier}
          onSelect={(v) => onChange({ outlier: v })}
          options={[
            { value: "conservative", label: strings.outlierConservative },
            { value: "off", label: strings.outlierOff },
          ]}
        />
      </fieldset>

      {/* 기간 */}
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{strings.exactDates}</legend>

        <label htmlFor="exactDates" className={checkboxRowClass}>
          <input
            id="exactDates"
            type="checkbox"
            checked={settings.exactDates}
            onChange={(e) => onChange({ exactDates: e.target.checked })}
            className="accent-accent"
          />
          {strings.exactDates}
        </label>

        <label htmlFor="startDate" className={labelClass}>
          {strings.startDate}
        </label>
        <input
          id="startDate"
          type="date"
          disabled={!settings.exactDates}
          value={settings.startDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
          className={`${numberInputClass} disabled:cursor-not-allowed disabled:opacity-40`}
        />

        <label htmlFor="endDate" className={labelClass}>
          {strings.endDate}
        </label>
        <input
          id="endDate"
          type="date"
          disabled={!settings.exactDates}
          value={settings.endDate}
          onChange={(e) => onChange({ endDate: e.target.value })}
          className={`${numberInputClass} disabled:cursor-not-allowed disabled:opacity-40`}
        />
      </fieldset>

      {/* 만남 */}
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{strings.meetRadius}</legend>

        <label htmlFor="meetRadiusM" className={labelClass}>
          {strings.meetRadius}
        </label>
        <NumberField
          id="meetRadiusM"
          min={10}
          max={2000}
          value={settings.meetRadiusM}
          onChange={(v) => onChange({ meetRadiusM: v })}
        />

        <label htmlFor="meetMinMinutes" className={labelClass}>
          {strings.meetMinDuration}
        </label>
        <NumberField
          id="meetMinMinutes"
          min={1}
          max={240}
          value={settings.meetMinMinutes}
          onChange={(v) => onChange({ meetMinMinutes: v })}
        />
      </fieldset>

      {/* 영상 */}
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{strings.videoTitle}</legend>

        <label htmlFor="videoTitle" className={labelClass}>
          {strings.videoTitle}
        </label>
        <input
          id="videoTitle"
          type="text"
          value={settings.videoTitle}
          onChange={(e) => onChange({ videoTitle: e.target.value })}
          className={numberInputClass}
        />

        <span className={`${labelClass} mb-0`}>{strings.duration}</span>
        <RadioGroup
          name="durationSec"
          value={settings.durationSec}
          onSelect={(v) => onChange({ durationSec: v })}
          options={DURATIONS.map((d) => ({
            value: d,
            label: strings.seconds.replace("{n}", String(d)),
          }))}
        />

        <span className={`${labelClass} mb-0`}>{strings.cameraMotion}</span>
        <RadioGroup
          name="camera"
          value={settings.camera}
          onSelect={(v) => onChange({ camera: v })}
          options={[
            { value: "fixed", label: strings.cameraFixed },
            { value: "steady", label: strings.cameraSteady },
            { value: "dynamic", label: strings.cameraDynamic },
          ]}
        />

        <span className={`${labelClass} mb-0`}>{strings.videoSize}</span>
        <RadioGroup
          name="sizeIndex"
          value={settings.sizeIndex}
          onSelect={(v) => onChange({ sizeIndex: v })}
          options={SIZES.map((s, i) => ({
            value: i,
            label: `${sizeLabel(s.shape)} ${s.w}×${s.h}`,
          }))}
        />

        <label htmlFor="showSummary" className={checkboxRowClass}>
          <input
            id="showSummary"
            type="checkbox"
            checked={settings.showSummary}
            onChange={(e) => onChange({ showSummary: e.target.checked })}
            className="accent-accent"
          />
          {strings.showSummary}
        </label>
      </fieldset>

      {/* 가리기 */}
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{strings.hideHome}</legend>

        <label htmlFor="hideHome" className={checkboxRowClass}>
          <input
            id="hideHome"
            type="checkbox"
            checked={settings.hideHome}
            onChange={(e) => onChange({ hideHome: e.target.checked })}
            className="accent-accent"
          />
          {strings.hideHome}
        </label>

        <label htmlFor="hideHomeRadiusM" className={labelClass}>
          {strings.hideHomeRadius}
        </label>
        <NumberField
          id="hideHomeRadiusM"
          min={50}
          max={5000}
          disabled={!settings.hideHome}
          value={settings.hideHomeRadiusM}
          onChange={(v) => onChange({ hideHomeRadiusM: v })}
        />
      </fieldset>
    </div>
  );
}
