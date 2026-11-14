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
      className="group block border border-line bg-panel hover:border-gold/50 transition-colors"
    >
      <div className="relative aspect-[4/5] bg-panel-2 overflow-hidden">
        <span className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-ink text-sm font-bold">
          {number}
        </span>
        <span className="absolute right-3 top-3 z-10 rounded-full bg-white/95 border border-line px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-navy">
          {categoryLabel(category)}
        </span>
        {photo ? (
          <CatalogImage
            src={photo.path}
            alt={photo.alt}
            fill
            priority={priority}
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">
            No photo yet
          </div>
        )}
      </div>
      <div className="p-4 space-y-1">
        <p className="text-[11px] uppercase tracking-[0.12em] text-gold">{brand}</p>
        <h2 className="font-display text-2xl text-cream">{strain}</h2>
      </div>
    </Link>
  );
}
