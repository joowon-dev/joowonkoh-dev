"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginButton() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setError(null);

    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-medium transition-colors hover:bg-neutral-800 disabled:opacity-50"
      >
        {busy ? "이동 중..." : "Google로 계속하기"}
      </button>
      {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
    </>
  );
}
