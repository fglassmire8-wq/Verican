import Image from "next/image";
import Link from "next/link";
import { verdictLabel } from "@/lib/utils";

type ProductCardProps = {
  slug: string;
  strain: string;
  brand: string;
  photo?: { path: string; alt: string } | null;
  trustedBuy: number;
  trustedDontBuy: number;
  trustedLikes: number;
};

export function ProductCard({
  slug,
  strain,
  brand,
  photo,
  trustedBuy,
  trustedDontBuy,
  trustedLikes,
}: ProductCardProps) {
  const trustedCount = trustedBuy + trustedDontBuy;
  return (
    <Link
      href={`/product/${slug}`}
      className="group block border border-line bg-panel hover:border-gold/50 transition-colors"
    >
      <div className="relative aspect-[4/5] bg-panel-2 overflow-hidden">
        {photo ? (
          <Image
            src={photo.path}
            alt={photo.alt}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
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
