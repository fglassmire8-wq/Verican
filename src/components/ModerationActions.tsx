"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ModerationActions({
  endpoint,
  approveValue,
  rejectValue,
  approveLabel,
  rejectLabel,
}: {
  endpoint: string;
  approveValue: string;
  rejectValue: string;
  approveLabel: string;
  rejectLabel: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");

  async function decide(decision: string) {
    setPending(decision);
    setError("");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    const data = await res.json().catch(() => ({}));
    setPending("");
    if (!res.ok) {
      setError(data.error || "Could not save that decision.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={Boolean(pending)}
        onClick={() => decide(approveValue)}
        className="border border-gold bg-gold text-ink px-4 py-2 text-xs tracking-[0.16em] uppercase disabled:opacity-60"
      >
        {pending === approveValue ? "Saving…" : approveLabel}
      </button>
      <button
        type="button"
        disabled={Boolean(pending)}
        onClick={() => decide(rejectValue)}
        className="border border-line px-4 py-2 text-xs tracking-[0.16em] uppercase text-dont disabled:opacity-60"
      >
        {pending === rejectValue ? "Saving…" : rejectLabel}
      </button>
      {error ? <p className="text-xs text-dont w-full">{error}</p> : null}
    </div>
  );
}
