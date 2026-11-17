"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass = "mt-1 w-full bg-panel border border-line px-3 py-2 text-sm";
const boxClass = "border border-line bg-panel-2 p-4 rounded-[14px]";
const labelClass = "text-[11px] uppercase tracking-[0.12em] text-gold";

function brandMeta(parts: Array<string | null | undefined>) {
  return parts.map((part) => part?.trim()).filter(Boolean).join(" · ");
}

export function ProductDetailsBoxes({
  productId,
  strain,
  brandName,
  brandLegalName,
  brandLicense,
  brandLocation,
  lineage,
  archivedLineage,
  isFounder,
}: {
  productId: string;
  strain: string;
  brandName: string;
  brandLegalName: string | null;
  brandLicense: string | null;
  brandLocation: string | null;
  lineage: string | null;
  archivedLineage: string | null;
  isFounder: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const displayLineage = lineage || archivedLineage || "";
  const meta = brandMeta([
    brandLegalName,
    brandLicense ? `license ${brandLicense}` : null,
    brandLocation,
  ]);
  const showBrand = isFounder || Boolean(brandName);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName: String(form.get("brandName") || ""),
        strain: String(form.get("strain") || ""),
        lineage: String(form.get("lineage") || ""),
      }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error || "Could not save.");
      return;
    }
    router.refresh();
  }

  const brandBox = showBrand ? (
    <section className={boxClass}>
      <p className={labelClass}>Brand</p>
      {isFounder ? (
        <label className="block mt-2 text-sm">
          <span className="sr-only">Brand</span>
          <input name="brandName" defaultValue={brandName} placeholder="Brand unknown" className={fieldClass} />
        </label>
      ) : (
        <p className="mt-2">{brandName}</p>
      )}
      {meta ? <p className="mt-1 text-sm text-muted">{meta}</p> : null}
    </section>
  ) : null;

  const strainBox = (
    <section className={boxClass}>
      <p className={labelClass}>Strain</p>
      {isFounder ? (
        <label className="block mt-2 text-sm">
          <span className="sr-only">Strain</span>
          <input name="strain" defaultValue={strain} required className={fieldClass} />
        </label>
      ) : (
        <p className="mt-2">{strain}</p>
      )}
      {isFounder || displayLineage ? (
        <div className="mt-3">
          <p className={labelClass}>Lineage</p>
          {isFounder ? (
            <>
              <input
                name="lineage"
                defaultValue={displayLineage}
                maxLength={300}
                placeholder="Parent strains, if you know them"
                className={fieldClass}
              />
              {archivedLineage && !lineage ? (
                <p className="mt-1 text-xs text-muted">Prefilled from the strain genetics archive.</p>
              ) : null}
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">{displayLineage}</p>
          )}
        </div>
      ) : null}
    </section>
  );

  if (!isFounder) {
    return (
      <div className="mt-4 grid gap-3 max-w-xl">
        {brandBox}
        {strainBox}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 max-w-xl">
      {brandBox}
      {strainBox}
      {error ? <p className="text-sm text-dont">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start border border-gold bg-gold text-ink px-4 py-1.5 text-sm disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
