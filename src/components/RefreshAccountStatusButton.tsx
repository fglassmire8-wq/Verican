"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshAccountStatusButton() {
  const router = useRouter();
  const { update } = useSession();
  const [pending, setPending] = useState(false);

  async function refresh() {
    setPending(true);
    await update();
    router.refresh();
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={pending}
      className="mt-6 border border-line px-5 py-3 text-sm tracking-[0.16em] uppercase hover:border-gold disabled:opacity-60"
    >
      {pending ? "Checking…" : "Check verification status"}
    </button>
  );
}
