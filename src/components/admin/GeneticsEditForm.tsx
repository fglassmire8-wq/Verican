"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GeneticsEditForm({
  id,
  lineage,
  displayName,
}: {
  id: string;
  lineage: string;
  displayName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("lineage") || "");
    setPending(true);
    setError("");
    const res = await fetch(`/api/admin/genetics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineage: value, displayName }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error || "Could not save.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <input
        name="lineage"
        defaultValue={lineage}
        maxLength={300}
        className="w-full bg-panel border border-line px-3 py-2 text-sm"
      />
      {error ? <p className="text-sm text-dont">{error}</p> : null}
      <button type="submit" disabled={pending} className="border border-line px-3 py-1.5 text-sm hover:border-gold disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
