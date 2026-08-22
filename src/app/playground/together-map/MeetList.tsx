import type { Lang, Strings } from "./i18n";
import type { Meeting } from "./meet";

// 목록에 처음부터 다 펼치면 만남이 많은 사용자는 스크롤이 끝없이 길어진다.
// 10건까지만 보여주고 나머지는 <details>로 접는다 — GameHelp.tsx와 같은 방식으로,
// useState 없이 브라우저 기본 토글만으로 접고 편다.
export const VISIBLE_ROWS = 10;

/**
 * 접을 기준선에서 목록을 둘로 나눈다.
 *
 * 컴포넌트 자체는 이 프로젝트에서 렌더 테스트를 하지 않으므로, "몇 건까지
 * 보여줄지"라는 결정 자체를 순수 함수로 뽑아내 여기서 테스트한다.
 */
export function splitMeetings(
  meetings: Meeting[],
  visibleCount: number,
): { visible: Meeting[]; hidden: Meeting[] } {
  return { visible: meetings.slice(0, visibleCount), hidden: meetings.slice(visibleCount) };
}

/** 만남 지속시간을 "1시간 30분" 형태로 만든다. 순수 함수라 따로 테스트한다. */
export function formatMeetDuration(ms: number, strings: Strings): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}${strings.minutesUnit}`;
  if (minutes === 0) return `${hours}${strings.hoursUnit}`;
  return `${hours}${strings.hoursUnit} ${minutes}${strings.minutesUnit}`;
}

/** 가장 가까웠던 거리를 표시 단위로 바꾼다. 1km 미만이면 m, 그 이상이면 km. */
export function formatMeetDistance(meters: number, strings: Strings): string {
  if (meters >= 1000) {
    const km = Math.round((meters / 1000) * 10) / 10;
    return `${km}${strings.kmUnit}`;
  }
  return `${Math.round(Math.max(0, meters))}${strings.metersUnit}`;
}

function dateLabel(ts: number, lang: Lang): string {
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ts));
}

function timeLabel(ts: number, lang: Lang): string {
  return new Intl.DateTimeFormat(lang, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

function MeetingRow({ meeting, lang, strings }: { meeting: Meeting; lang: Lang; strings: Strings }) {
  const startDate = dateLabel(meeting.start, lang);
  const endDate = dateLabel(meeting.end, lang);
  // 자정을 넘긴 만남은 시작일 하나만 보여주면 "23:50–00:15"처럼 시간이
  // 거꾸로 가는 것처럼 읽힌다. 종료일이 다를 때만 날짜를 하나 더 붙인다 —
  // 대다수인 하루 안 만남에는 줄이 늘어나지 않는다.
  const dateText = endDate === startDate ? startDate : `${startDate} – ${endDate}`;

  return (
    <li className="flex flex-col gap-1 rounded-2xl border border-border bg-card-bg p-3 text-sm">
      <span className="font-semibold text-text-primary">{dateText}</span>
      <span className="text-text-secondary">
        {timeLabel(meeting.start, lang)} – {timeLabel(meeting.end, lang)}
      </span>
      <span className="text-xs text-text-muted">
        {formatMeetDuration(meeting.end - meeting.start, strings)} · {formatMeetDistance(meeting.minDistance, strings)}
      </span>
    </li>
  );
}

interface MeetListProps {
  meetings: Meeting[];
  lang: Lang;
  strings: Strings;
}

export default function MeetList({ meetings, lang, strings }: MeetListProps) {
  if (meetings.length === 0) {
    // 0건은 "검출이 잘못됐다"를 사용자가 처음 마주하는 화면이다. 빈 상자만 두면
    // 사용자가 원인을 짐작할 길이 없으므로, 있을 법한 이유를 먼저 나열한다.
    return (
      <div className="mt-6 rounded-2xl border border-border bg-card-bg p-5 text-center">
        <p className="font-semibold text-text-primary">{strings.noMeetings}</p>
        <p className="mt-3 text-xs font-medium text-text-muted">{strings.noMeetingsReasonHeading}</p>
        <ul className="mt-2 space-y-1.5 text-left text-sm text-text-secondary">
          <li>· {strings.noMeetingsReasonDateRange}</li>
          <li>· {strings.noMeetingsReasonRadius}</li>
          <li>· {strings.noMeetingsReasonAccuracy}</li>
          <li>· {strings.noMeetingsReasonGenuine}</li>
        </ul>
      </div>
    );
  }

  const { visible, hidden: rest } = splitMeetings(meetings, VISIBLE_ROWS);

  return (
    <div className="mt-6">
      <p className="text-xs font-medium text-text-muted">
        {strings.meetingsFound.replace("{n}", String(meetings.length))}
      </p>
      <ul className="mt-2 space-y-2">
        {visible.map((m) => (
          <MeetingRow key={m.start} meeting={m} lang={lang} strings={strings} />
        ))}
      </ul>

      {rest.length > 0 && (
        <details className="group mt-2">
          <summary className="cursor-pointer list-none rounded-full border border-border px-3 py-1.5 text-center text-xs font-medium text-text-secondary spring-transition hover:border-accent/40 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">
              {strings.showMoreMeetings.replace("{n}", String(rest.length))}
            </span>
            <span className="hidden group-open:inline">{strings.showLessMeetings}</span>
          </summary>
          <ul className="mt-2 space-y-2">
            {rest.map((m) => (
              <MeetingRow key={m.start} meeting={m} lang={lang} strings={strings} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
