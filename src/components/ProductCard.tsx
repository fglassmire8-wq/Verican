import Link from "next/link";
import { CatalogImage } from "@/components/CatalogImage";
import { verdictLabel } from "@/lib/utils";

type ProductCardProps = {
  slug: string;
  strain: string;
  brand: string;
  photo?: { path: string; alt: string } | null;
  trustedBuy: number;
  trustedDontBuy: number;
  trustedLikes: number;
  /** First row of the catalog. Those photos are on screen immediately. */
  priority?: boolean;
};

export function ProductCard({
  slug,
  strain,
  brand,
  photo,
  trustedBuy,
  trustedDontBuy,
  trustedLikes,
  priority = false,
}: ProductCardProps) {
  const trustedCount = trustedBuy + trustedDontBuy;
  return (
    <Link
      href={`/product/${slug}`}
      className="group block border border-line bg-panel hover:border-gold/50 transition-colors"
    >
      <div className="relative aspect-[4/5] bg-panel-2 overflow-hidden">
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
      <div className="p-4 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">{brand}</p>
        <h2 className="font-display text-2xl text-cream">{strain}</h2>
        <p className="text-sm text-muted">
          {trustedCount === 0
            ? "No verified reviews yet"
            : `${trustedCount} verified · ${trustedBuy} ${verdictLabel("BUY")}${
                trustedDontBuy ? ` · ${trustedDontBuy} ${verdictLabel("DONT_BUY")}` : ""
              } · ${trustedLikes} like${trustedLikes === 1 ? "" : "s"}`}
        </p>
      </div>
    </Link>
  );
}
