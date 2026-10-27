import SignOutButton from "../(protected)/SignOutButton";

export default function AdminDeniedPage() {
  return (
    <main className="admin-graph flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--paper)] p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">관리자 계정이 아니에요</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          로그인은 됐지만 이 구글 계정은 관리자 목록에 없어요. 다른 계정으로 다시 로그인해 주세요.
        </p>
        <div className="mt-8 text-xs">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
