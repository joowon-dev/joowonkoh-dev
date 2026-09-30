import LoginButton from "./LoginButton";

export default function AdminLoginPage() {
  return (
    <main className="admin-graph flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--paper)] p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">joowonkoh.com 관리</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          등록된 구글 계정으로만 들어올 수 있어요.
        </p>
        <div className="mt-8">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
