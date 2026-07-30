"use client";

export function CameraPermissionGate({
  status,
  onRetry,
}: {
  status: "denied" | "unsupported";
  onRetry: () => void;
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
            ? "개바리는 웹캠에 잡힌 얼굴 개수만 셉니다. 브라우저 설정에서 카메라를 허용한 뒤 다시 시도해 주세요."
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
