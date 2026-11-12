"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PhotoCaptionForm({ id, alt }: { id: string; alt: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const res = await fetch(`/api/admin/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt: form.get("alt") }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error || "Save failed.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <label className="block text-sm flex-1 min-w-[12rem]">
        <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Caption</span>
        <input name="alt" defaultValue={alt} required className="mt-1 w-full bg-panel border border-line px-3 py-2" />
      </label>
      <button type="submit" disabled={pending} className="border border-line px-3 py-2 text-sm hover:border-gold disabled:opacity-60">
        {pending ? "Saving…" : "Save caption"}
      </button>
      {error ? <p className="w-full text-sm text-dont">{error}</p> : null}
    </form>
  );
}
