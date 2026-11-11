"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STAR_OPTIONS, halvesToStars } from "@/lib/rating";

export function ReviewerRatingControl({
  reviewId,
  initialHalves,
}: {
  reviewId: string;
  initialHalves: number | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(
    initialHalves != null ? halvesToStars(initialHalves).toFixed(1) : "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save(next: string) {
    setValue(next);
    setPending(true);
    setError("");
    const res = await fetch(`/api/reviews/${reviewId}/reviewer-rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: next === "" ? null : Number(next) }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not save the reviewer rating.");
      return;
    }
    router.refresh();
  }

  return (
    <label className="block text-sm">
      <span className="text-[11px] uppercase tracking-[0.16em] text-gold">
        Reviewer rating
      </span>
      <select
        value={value}
        disabled={pending}
        onChange={(event) => save(event.currentTarget.value)}
        className="mt-1 w-full bg-panel border border-line px-2 py-2 text-sm outline-none focus:border-gold disabled:opacity-60"
      >
        <option value="">No rating</option>
        {STAR_OPTIONS.map((stars) => {
          const label = stars.toFixed(1);
          return (
            <option key={label} value={label}>
              {label} / 5
            </option>
          );
        })}
      </select>
      {error ? <p className="mt-1 text-xs text-dont">{error}</p> : null}
    </label>
  );
}
