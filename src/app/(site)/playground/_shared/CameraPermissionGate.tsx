"use client";

/**
 * 카메라를 못 쓸 때 화면을 덮는 안내.
 *
 * 무대 위에 절대 위치로 깔리므로, 감싸는 쪽이 `relative`여야 한다.
 * `note`를 받는 이유: 무엇을 위해 카메라를 켜는지는 게임마다 다르고,
 * 권한을 물을 때야말로 그걸 가장 알고 싶다.
 */
export function CameraPermissionGate({
  status,
  onRetry,
  note,
}: {
  status: "denied" | "unsupported";
  onRetry: () => void;
  /** 이 페이지가 카메라로 무엇을 하는지 한 줄. 허용 안내 앞에 붙는다. */
  note: string;
}) {
  const denied = status === "denied";
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-6">
      <div className="max-w-xs rounded-2xl bg-card-bg p-6 text-center shadow-ambient animate-fade-in-up">
        <div className="text-3xl">📷</div>
        <h3 className="mt-3 font-display text-lg font-bold">
          {denied ? "카메라가 필요해요" : "카메라를 쓸 수 없어요"}
        </h3>
        <p className="mt-2 text-sm text-text-secondary">
          {denied
            ? `${note} 브라우저 설정에서 카메라를 허용한 뒤 다시 시도해 주세요.`
            : "이 브라우저는 카메라 입력을 지원하지 않아요. 다른 브라우저에서 열어 주세요."}
        </p>
        {denied && (
          <button
            onClick={onRetry}
            className="mt-5 w-full rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white spring-transition hover:scale-[1.02] active:scale-[0.98]"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}
