"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRODUCT_CATEGORIES, parseCategory } from "@/lib/categories";

function SaveForm({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSaved(false);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error || "Save failed.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      {children}
      {error ? <p className="text-sm text-dont">{error}</p> : null}
      {saved ? <p className="text-sm text-gold-bright">Saved.</p> : null}
      <button type="submit" disabled={pending} className="border border-line px-3 py-1.5 text-sm hover:border-gold disabled:opacity-60">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function ProductForm({
  product,
}: {
  product: {
    id: string;
    strain: string;
    slug: string;
    category: string;
    brandName: string;
    lineage: string | null;
    archivedLineage?: string | null;
  };
}) {
  return (
    <SaveForm url={`/api/admin/products/${product.id}`}>
      <section className="border border-line bg-panel-2 p-4 rounded-[14px]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Brand</p>
        <input
          name="brandName"
          defaultValue={product.brandName}
          placeholder="Brand unknown"
          className="mt-2 w-full bg-panel border border-line px-3 py-2 text-sm"
        />
      </section>
      <section className="border border-line bg-panel-2 p-4 rounded-[14px]">
        <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Strain</p>
        <input name="strain" defaultValue={product.strain} required className="mt-2 w-full bg-panel border border-line px-3 py-2 text-sm" />
        <label className="block mt-3 text-sm">
          <span className="text-[11px] uppercase tracking-[0.12em] text-gold">Lineage</span>
          <input
            name="lineage"
            defaultValue={product.lineage || product.archivedLineage || ""}
            placeholder="Parent strains, if you know them"
            maxLength={300}
            className="mt-1 w-full bg-panel border border-line px-3 py-2 text-sm"
          />
        </label>
        {product.archivedLineage && !product.lineage ? (
          <p className="mt-1 text-xs text-muted">Prefilled from the strain genetics archive.</p>
        ) : null}
        <label className="block mt-3 text-sm">
          <span className="text-[11px] uppercase tracking-[0.12em] text-gold">Slug</span>
          <input name="slug" defaultValue={product.slug} className="mt-1 w-full bg-panel border border-line px-3 py-2 text-sm" />
        </label>
        <label className="block mt-3 text-sm">
          <span className="text-[11px] uppercase tracking-[0.12em] text-gold">Category</span>
          <select
            name="category"
            required
            defaultValue={parseCategory(product.category)?.value ?? "FLOWER"}
            className="mt-1 w-full bg-panel border border-line px-3 py-2 text-sm"
          >
            {PRODUCT_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </section>
    </SaveForm>
  );
}

export function BrandForm({
  brand,
}: {
  brand: { id: string; name: string; legalName: string | null; license: string | null; location: string | null };
}) {
  return (
    <SaveForm url={`/api/admin/brands/${brand.id}`}>
      <input name="name" defaultValue={brand.name} className="w-full bg-panel border border-line px-3 py-2 text-sm" />
      <input name="legalName" defaultValue={brand.legalName ?? ""} placeholder="Legal name" className="w-full bg-panel border border-line px-3 py-2 text-sm" />
      <input name="license" defaultValue={brand.license ?? ""} placeholder="License" className="w-full bg-panel border border-line px-3 py-2 text-sm" />
      <input name="location" defaultValue={brand.location ?? ""} placeholder="Location" className="w-full bg-panel border border-line px-3 py-2 text-sm" />
    </SaveForm>
  );
}

export function StoreForm({
  store,
}: {
  store: { id: string; name: string; city: string; state: string };
}) {
  return (
    <SaveForm url={`/api/admin/stores/${store.id}`}>
      <input name="name" defaultValue={store.name} className="w-full bg-panel border border-line px-3 py-2 text-sm" />
      <input name="city" defaultValue={store.city} className="w-full bg-panel border border-line px-3 py-2 text-sm" />
      <input name="state" defaultValue={store.state} className="w-full bg-panel border border-line px-3 py-2 text-sm" />
    </SaveForm>
  );
}
