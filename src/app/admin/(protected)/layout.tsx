import { redirect } from "next/navigation";
import { checkAdmin } from "@/lib/admin/auth";
import SignOutButton from "./SignOutButton";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const check = await checkAdmin();

  if (!check.ok) {
    redirect(check.reason === "no-session" ? "/admin/login" : "/admin/denied");
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="mb-8 flex items-baseline justify-between border-b border-neutral-800 pb-4">
        <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
        <div className="flex items-baseline gap-3 text-xs text-neutral-500">
          <span>{check.identity.email}</span>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
