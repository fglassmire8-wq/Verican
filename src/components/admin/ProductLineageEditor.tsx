"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductLineageEditor({
  productId,
  strain,
  lineage,
  archivedLineage,
}: {
  productId: string;
  strain: string;
  lineage: string | null;
  archivedLineage: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const defaultValue = lineage || archivedLineage || "";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const value = String(new FormData(form).get("lineage") || "");
    setPending(true);
    setError("");
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineage: value }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error || "Could not save lineage.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 border border-line bg-panel-2 p-4 rounded-[14px] max-w-xl">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Founder only · Genetics</p>
      <label className="block mt-2 text-sm">
        <span className="sr-only">Lineage for {strain}</span>
        <input
          name="lineage"
          defaultValue={defaultValue}
          maxLength={300}
          placeholder="Parent strains, if you know them"
          className="mt-1 w-full bg-panel border border-line px-3 py-2 text-sm"
        />
      </label>
      {archivedLineage && !lineage ? (
        <p className="mt-1 text-xs text-muted">Prefilled from the strain genetics archive.</p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-dont">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 border border-gold bg-gold text-ink px-4 py-1.5 text-sm disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save lineage"}
      </button>
    </form>
  );
}
