"use client";

import { useState } from "react";
import { StarRating } from "@/components/StarRating";
import { STAR_OPTIONS, formatVisitorAverage, halvesToStars } from "@/lib/rating";

export function VisitorRating({
  reviewId,
  average,
  count,
  visitorHalves,
  interactive,
}: {
  reviewId: string;
  average: number | null;
  count: number;
  visitorHalves: number | null;
  interactive: boolean;
}) {
  const [avg, setAvg] = useState(average);
  const [total, setTotal] = useState(count);
  const [mine, setMine] = useState(visitorHalves);
  const [hover, setHover] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const display = hover != null ? hover / 2 : mine != null ? halvesToStars(mine) : avg ?? 0;
  const summary =
    total === 0 || avg == null
      ? "Be the first to rate"
      : formatVisitorAverage(avg, total);

  async function submit(stars: number) {
    if (pending) return;
    setPending(true);
    setError("");
    const res = await fetch(`/api/reviews/${reviewId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: stars }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not save your rating.");
      return;
    }
    setMine(Math.round(data.value * 2));
    setAvg(data.average);
    setTotal(data.count);
  }

  if (!interactive) {
    return (
      <div>
        <p className="uppercase tracking-widest text-[10px] text-gold">Visitor rating</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {total > 0 && avg != null ? (
            <StarRating
              value={avg}
              size={18}
              idPrefix={`list-${reviewId}`}
              label={summary}
            />
          ) : (
            <p className="text-sm text-muted">{summary}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="uppercase tracking-widest text-[10px] text-gold">Visitor rating</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {total > 0 && avg != null ? (
          <StarRating
            value={avg}
            size={18}
            idPrefix={`avg-${reviewId}`}
            label={summary}
          />
        ) : (
          <p className="text-sm text-muted">{summary}</p>
        )}
      </div>

      <fieldset className="mt-3" disabled={pending}>
        <legend className="text-sm text-cream">
          {mine != null ? `Your rating: ${halvesToStars(mine).toFixed(1)} / 5` : "Rate this review"}
        </legend>
        <div
          className="relative mt-1 inline-flex"
          onPointerLeave={() => setHover(null)}
        >
          <div className="pointer-events-none">
            <StarRating value={display} size={28} idPrefix={`pick-${reviewId}`} />
          </div>
          <div
            className="absolute inset-0 flex"
            role="radiogroup"
            aria-label="Rate this review from 0.5 to 5 stars"
          >
            {STAR_OPTIONS.map((stars) => {
              const halves = Math.round(stars * 2);
              const checked = mine === halves;
              return (
                <label
                  key={halves}
                  className="relative flex-1 cursor-pointer"
                  title={`${stars.toFixed(1)} stars`}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setHover(halves);
                  }}
                >
                  <input
                    type="radio"
                    name={`visitor-rating-${reviewId}`}
                    value={stars}
                    checked={checked}
                    onChange={() => submit(stars)}
                    className="sr-only"
                  />
                  <span className="sr-only">{stars.toFixed(1)} stars</span>
                </label>
              );
            })}
          </div>
        </div>
      </fieldset>
      {error ? <p className="mt-2 text-xs text-dont">{error}</p> : null}
    </div>
  );
}
