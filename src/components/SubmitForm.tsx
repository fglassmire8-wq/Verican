"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubmitForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const res = await fetch("/api/reviews", { method: "POST", body: data });
    const json = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(json.error || "Could not save the review.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" encType="multipart/form-data">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Strain</span>
          <input
            name="strain"
            required
            placeholder="MAX A/C"
            className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Brand</span>
          <input
            name="brand"
            required
            placeholder="Illicit Gardens"
            className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="block text-sm sm:col-span-1">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Store</span>
          <input
            name="store"
            required
            placeholder="Cottonmouth"
            className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">City</span>
          <input
            name="storeCity"
            required
            placeholder="Runnemede"
            className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">State</span>
          <input
            name="storeState"
            required
            defaultValue="NJ"
            maxLength={2}
            className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold uppercase"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Amount</span>
          <input
            name="amount"
            required
            placeholder="28g (1 oz)"
            className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Price (USD, before tax)</span>
          <input
            name="price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            placeholder="150"
            className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-[11px] uppercase tracking-[0.2em] text-gold">Verdict</legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="verdict" value="BUY" required defaultChecked />
            <span className="text-buy tracking-[0.14em] uppercase">Buy</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="verdict" value="DONT_BUY" required />
            <span className="text-dont tracking-[0.14em] uppercase">Don&apos;t buy</span>
          </label>
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Notes</span>
        <textarea
          name="notes"
          required
          minLength={20}
          rows={6}
          placeholder="What it looked like, smelled like, how it smoked. Honest DON'T BUY notes are welcome."
          className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
        />
      </label>

      <label className="block text-sm">
        <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Photos (multiple)</span>
        <input
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => setPhotoCount(event.currentTarget.files?.length ?? 0)}
          className="mt-1 w-full bg-panel border border-line px-3 py-3 file:mr-4 file:border-0 file:bg-gold file:text-ink file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-widest"
        />
        <span className="block mt-1 text-xs text-muted">
          Up to 8 images, 10MB each, JPEG / PNG / WebP. Stored on this server&apos;s
          disk (see README for deploy limits).
          {photoCount ? ` ${photoCount} selected.` : ""}
        </span>
      </label>

      <details className="border border-line bg-panel-2 p-4">
        <summary className="cursor-pointer text-sm text-gold tracking-wide">
          Optional label details
        </summary>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Harvest</span>
            <input
              name="harvestDate"
              placeholder="07/17/24"
              className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Exp</span>
            <input
              name="expDate"
              placeholder="01/17/25"
              className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Total THC %</span>
            <input
              name="thcPercent"
              type="number"
              step="0.01"
              className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold">THCa %</span>
            <input
              name="thcaPercent"
              type="number"
              step="0.01"
              className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Top terpene</span>
            <input
              name="topTerpene"
              placeholder="trans-caryophyllene 0.79%"
              className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
            />
          </label>
        </div>
      </details>

      {error ? <p className="text-sm text-dont">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full border border-gold bg-gold text-ink py-3 text-sm tracking-[0.16em] uppercase disabled:opacity-60"
      >
        {pending ? "Saving…" : "Submit review"}
      </button>
    </form>
  );
}
