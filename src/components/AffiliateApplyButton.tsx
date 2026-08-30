"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AffiliateApplyButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function apply() {
    setPending(true);
    setError("");
    const res = await fetch("/api/affiliate/apply", { method: "POST" });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not submit application.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={apply}
        disabled={pending}
        className="border border-gold bg-gold text-ink px-5 py-3 text-sm tracking-[0.16em] uppercase disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Apply with this account"}
      </button>
      {error ? <p className="mt-3 text-sm text-dont">{error}</p> : null}
    </div>
  );
}
