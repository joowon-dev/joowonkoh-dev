"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="text-[var(--ink-soft)] underline underline-offset-4 transition-colors hover:text-[var(--ink)] disabled:opacity-50"
    >
      {busy ? "로그아웃 중" : "로그아웃"}
    </button>
  );
}
