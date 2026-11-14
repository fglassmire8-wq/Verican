import Link from "next/link";
import { CatalogImage } from "@/components/CatalogImage";
import { categoryLabel } from "@/lib/categories";

export function ReviewThumbCard({
  number,
  slug,
  strain,
  brand,
  category,
  photo,
  priority = false,
}: {
  number: number;
  slug: string;
  strain: string;
  brand: string;
  category: string;
  photo?: { path: string; alt: string } | null;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/product/${slug}`}
      className="review-photo-tile group relative block aspect-square overflow-hidden rounded-[3px] bg-panel-2"
      aria-label={`${strain} by ${brand}`}
    >
      {photo ? (
        <CatalogImage
          src={photo.path}
          alt={photo.alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 767px) 33vw, (max-width: 1023px) 20vw, 180px"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-1 text-center text-[10px] text-muted">
          No photo yet
        </span>
      )}
      <span className="absolute left-1 top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold tabular-nums leading-none text-ink">
        {number}
      </span>
      <span className="absolute right-1 top-1 z-10 max-w-[calc(100%-1.75rem)] truncate rounded bg-black/45 px-1 py-px text-[9px] font-medium uppercase tracking-wide text-white">
        {categoryLabel(category)}
      </span>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-1.5 pb-1 pt-6">
        <span className="block truncate text-[11px] font-semibold leading-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
          {strain}
        </span>
        <span className="block truncate text-[9px] leading-tight text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
          {brand}
        </span>
      </span>
    </Link>
  );
}
