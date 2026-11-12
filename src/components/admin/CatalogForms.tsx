"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  product: { id: string; strain: string; slug: string; category: string; brandId: string };
}) {
  return (
    <SaveForm url={`/api/admin/products/${product.id}`}>
      <input name="strain" defaultValue={product.strain} className="w-full bg-panel border border-line px-3 py-2 text-sm" />
      <input name="slug" defaultValue={product.slug} className="w-full bg-panel border border-line px-3 py-2 text-sm" />
      <input name="category" defaultValue={product.category} className="w-full bg-panel border border-line px-3 py-2 text-sm" />
      <input type="hidden" name="brandId" value={product.brandId} />
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
