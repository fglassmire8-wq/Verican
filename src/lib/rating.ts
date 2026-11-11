export const MIN_HALVES = 1;
export const MAX_HALVES = 10;

export type ParseRating =
  | { ok: true; halves: number | null }
  | { ok: false; error: string };

/** Parse a 0.5–5.0 star value into integer halves (1–10). Empty becomes null. */
export function parseStarRating(input: unknown): ParseRating {
  if (input == null) return { ok: true, halves: null };
  if (typeof input === "string" && input.trim() === "") {
    return { ok: true, halves: null };
  }
  const n = typeof input === "number" ? input : Number(String(input).trim());
  if (!Number.isFinite(n)) {
    return { ok: false, error: "Rating must be a number." };
  }
  const halves = Math.round(n * 2);
  if (Math.abs(n * 2 - halves) > 1e-6 || halves < MIN_HALVES || halves > MAX_HALVES) {
    return {
      ok: false,
      error: "Rating must be between 0.5 and 5.0 in half-point steps.",
    };
  }
  return { ok: true, halves };
}

export function halvesToStars(halves: number): number {
  return halves / 2;
}

export function starsToHalves(stars: number): number {
  return Math.round(stars * 2);
}

export function formatReviewerRating(halves: number): string {
  return `${halvesToStars(halves).toFixed(1)} / 5`;
}

/** Average of integer halves, as stars rounded to one decimal. */
export function averageStars(avgHalves: number): number {
  return Math.round((avgHalves / 2) * 10) / 10;
}

export function formatVisitorAverage(avgStars: number, count: number): string {
  const word = count === 1 ? "rating" : "ratings";
  return `${avgStars.toFixed(1)} \u2605 from ${count} ${word}`;
}

export const STAR_OPTIONS: number[] = Array.from(
  { length: MAX_HALVES },
  (_, i) => (i + 1) / 2,
);
