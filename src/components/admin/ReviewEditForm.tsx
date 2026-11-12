"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { halvesToStars } from "@/lib/rating";

const STATUSES = [
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
  { value: "HIDDEN", label: "Hidden" },
];

export function ReviewEditForm({
  review,
}: {
  review: {
    id: string;
    notes: string;
    amount: string;
    priceCents: number;
    priceIncludesTax: boolean;
    pricePerGramCents: number | null;
    verdict: string;
    status: string;
    harvestDate: string | null;
    expDate: string | null;
    thcPercent: number | null;
    thcaPercent: number | null;
    topTerpene: string | null;
    rating: number | null;
    createdAt: string;
    store: { name: string; city: string; state: string };
  };
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
    const ratingRaw = String(form.get("rating") ?? "").trim();
    const pricePerGramRaw = String(form.get("pricePerGram") ?? "").trim();
    const res = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: form.get("notes"),
        amount: form.get("amount"),
        price: form.get("price"),
        priceIncludesTax: form.get("priceIncludesTax") === "on",
        pricePerGram: pricePerGramRaw === "" ? null : pricePerGramRaw,
        verdict: form.get("verdict"),
        status: form.get("status"),
        harvestDate: form.get("harvestDate"),
        expDate: form.get("expDate"),
        thcPercent: String(form.get("thcPercent") ?? "").trim() || null,
        thcaPercent: String(form.get("thcaPercent") ?? "").trim() || null,
        topTerpene: form.get("topTerpene"),
        rating: ratingRaw === "" ? null : ratingRaw,
        createdAt: form.get("createdAt"),
        storeName: form.get("storeName"),
        storeCity: form.get("storeCity"),
        storeState: form.get("storeState"),
      }),
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

  const purchaseLocal = new Date(review.createdAt);
  const createdValue = Number.isNaN(purchaseLocal.getTime())
    ? ""
    : new Date(purchaseLocal.getTime() - purchaseLocal.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Notes</span>
        <textarea name="notes" defaultValue={review.notes} rows={6} required className="mt-1 w-full bg-panel border border-line px-3 py-2" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Amount</span>
          <input name="amount" defaultValue={review.amount} required className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Price (dollars)</span>
          <input name="price" type="number" step="0.01" min="0" defaultValue={(review.priceCents / 100).toFixed(2)} required className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Price per gram (dollars)</span>
          <input name="pricePerGram" type="number" step="0.01" min="0" defaultValue={review.pricePerGramCents != null ? (review.pricePerGramCents / 100).toFixed(2) : ""} className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 text-sm mt-6">
          <input type="checkbox" name="priceIncludesTax" defaultChecked={review.priceIncludesTax} />
          Price includes tax (out the door)
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Verdict</span>
          <select name="verdict" defaultValue={review.verdict} className="mt-1 w-full bg-panel border border-line px-3 py-2">
            <option value="BUY">BUY</option>
            <option value="DONT_BUY">DON&apos;T BUY</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Status</span>
          <select name="status" defaultValue={review.status} className="mt-1 w-full bg-panel border border-line px-3 py-2">
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Reviewer rating</span>
          <select name="rating" defaultValue={review.rating == null ? "" : String(halvesToStars(review.rating))} className="mt-1 w-full bg-panel border border-line px-3 py-2">
            <option value="">None</option>
            {Array.from({ length: 10 }, (_, i) => (i + 1) / 2).map((n) => (
              <option key={n} value={n.toFixed(1)}>{n.toFixed(1)}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Purchased</span>
          <input name="createdAt" type="datetime-local" defaultValue={createdValue} className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Store</span>
          <input name="storeName" defaultValue={review.store.name} required className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">City</span>
          <input name="storeCity" defaultValue={review.store.city} required className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">State</span>
          <input name="storeState" defaultValue={review.store.state} required className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Harvest date</span>
          <input name="harvestDate" defaultValue={review.harvestDate ?? ""} className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Exp date</span>
          <input name="expDate" defaultValue={review.expDate ?? ""} className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">THC %</span>
          <input name="thcPercent" defaultValue={review.thcPercent ?? ""} className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.16em] text-gold">THCa %</span>
          <input name="thcaPercent" defaultValue={review.thcaPercent ?? ""} className="mt-1 w-full bg-panel border border-line px-3 py-2" />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Top terpenes / lab notes</span>
        <input name="topTerpene" defaultValue={review.topTerpene ?? ""} className="mt-1 w-full bg-panel border border-line px-3 py-2" />
      </label>
      {error ? <p className="text-sm text-dont">{error}</p> : null}
      {saved ? <p className="text-sm text-gold-bright">Saved.</p> : null}
      <button type="submit" disabled={pending} className="border border-gold bg-gold text-ink px-5 py-2.5 text-sm tracking-[0.12em] uppercase disabled:opacity-60">
        {pending ? "Saving…" : "Save review"}
      </button>
    </form>
  );
}
