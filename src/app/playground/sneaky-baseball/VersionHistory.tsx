import { RELEASES } from "./releases";

/**
 * 「버전 전체 보기」. 접혀 있다가 펴면 지난 버전까지 한 줄씩 나온다.
 *
 * 받는 사람 대부분은 최신만 받으면 되므로 기본은 접어 둔다. 펴야 하는 사람은
 * 두 부류다 — 새 버전에서 뭐가 달라졌는지 보려는 사람, 그리고 새 버전이 자기
 * 환경에서 안 돌아 이전 버전으로 돌아가려는 사람. 둘 다 목록이 있어야 한다.
 *
 * `<details>` 를 쓰는 건 자바스크립트 없이도 펴지기 때문이다. 이 페이지에서
 * 상태를 들고 있어야 하는 건 플랫폼 탭 하나로 충분하다.
 */
export default function VersionHistory() {
  return (
    <details className="group mt-8 rounded-2xl border border-border bg-card-bg shadow-ambient">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-display text-sm font-semibold text-text-primary">
            버전 전체 보기
          </span>
          <span className="mt-1 block text-xs text-text-secondary">
            {RELEASES.length}개 버전 · 지난 버전도 그대로 받을 수 있습니다
          </span>
        </span>
        <span
          aria-hidden
          className="shrink-0 text-xs text-text-secondary spring-transition group-open:rotate-180"
        >
          ▾
        </span>
      </summary>

      <ul className="border-t border-border">
        {RELEASES.map((release) => (
          <li key={release.version} className="border-b border-border p-5 last:border-b-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-display text-sm font-semibold text-text-primary">
                {release.version}
              </h3>
              {release.latest && (
                <span className="rounded-full bg-text-primary px-2 py-0.5 text-[10px] font-semibold text-card-bg">
                  최신
                </span>
              )}
              <time className="text-xs text-text-secondary" dateTime={release.date}>
                {release.date}
              </time>
            </div>

            <ul className="mt-3 space-y-1.5">
              {release.notes.map((note) => (
                <li
                  key={note}
                  className="text-sm leading-relaxed text-text-secondary before:mr-2 before:text-text-secondary before:content-['·']"
                >
                  {note}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <DownloadLink
                href={release.mac.href}
                label="macOS"
                size={release.mac.size}
              />
              <DownloadLink
                href={release.windows.href}
                label="Windows"
                size={release.windows.size}
              />
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}

function DownloadLink({
  href,
  label,
  size,
}: {
  href: string;
  label: string;
  size: string;
}) {
  return (
    <a
      href={href}
      download
      className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text-primary spring-transition hover:bg-page-bg active:scale-[0.98]"
    >
      {label}
      <span className="ml-2 font-normal text-text-secondary">{size}</span>
    </a>
  );
}
