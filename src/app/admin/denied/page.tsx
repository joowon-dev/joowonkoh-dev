import SignOutButton from "../(protected)/SignOutButton";

export default function AdminDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold tracking-tight">접근 권한 없음</h1>
        <p className="mt-2 text-sm text-neutral-500">
          로그인은 되었지만 이 계정은 관리자로 등록되어 있지 않습니다.
        </p>
        <div className="mt-8 text-xs">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
