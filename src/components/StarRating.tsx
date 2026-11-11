const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function Star({ fill, size, clipId }: { fill: number; size: number; clipId: string }) {
  const width = Math.max(0, Math.min(1, fill)) * 24;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={width} height="24" />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill="#e5e7eb" />
      {fill > 0 ? (
        <path d={STAR_PATH} fill="#2f9e44" clipPath={`url(#${clipId})`} />
      ) : null}
    </svg>
  );
}

export function StarRating({
  value,
  size = 20,
  label,
  idPrefix,
}: {
  /** Star value from 0 to 5. Partial fills are allowed. */
  value: number;
  size?: number;
  label?: string;
  idPrefix: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            fill={Math.max(0, Math.min(1, value - i))}
            size={size}
            clipId={`${idPrefix}-star-${i}`}
          />
        ))}
      </span>
      {label ? <span className="text-sm text-cream">{label}</span> : null}
    </span>
  );
}
