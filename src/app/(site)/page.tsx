import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { isTrustedReview } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: {
      reviews: { some: { status: "APPROVED" } },
    },
    include: {
      brand: true,
      reviews: {
        where: { status: "APPROVED" },
        include: {
          user: true,
          photos: { orderBy: { sortOrder: "asc" } },
          likes: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { strain: "asc" },
  });

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
            21+ · Independent · Not a store
          </p>
          <h1 className="font-display text-4xl sm:text-6xl mt-4 max-w-3xl leading-tight text-cream">
            Check the flower before you buy the jar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted leading-relaxed">
            New Jersey dispensaries seal the product. You cannot inspect it on the floor.
            VERICAN is a photo and an honest review first — then, after you buy, you post
            your own.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-3xl text-sm leading-relaxed">
            <div className="border border-line p-5 bg-panel">
              <h2 className="font-display text-2xl text-gold-bright">Members</h2>
              <p className="mt-2 text-muted">
                View reviews. You may leave an unverified, unrewarded note. Member reviews
                are visually distinct and never count toward trusted rank.
              </p>
            </div>
            <div className="border border-line p-5 bg-panel">
              <h2 className="font-display text-2xl text-gold-bright">Verified affiliates</h2>
              <p className="mt-2 text-muted">
                Separate application. Pending, then verified or rejected. Only approved
                reviews from verified affiliates get likes, drive rank, and may earn
                brand-funded discounts later. Pay is not a dollar promise.
              </p>
            </div>
          </div>
          <p className="mt-8 text-sm text-muted">
            Honest <span className="text-dont">DON&apos;T BUY</span> reviews are a feature.
            Users are the affiliates.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/markets"
              className="border border-gold bg-gold text-ink px-5 py-2.5 text-sm tracking-[0.16em] uppercase"
            >
              Search reviews
            </Link>
            <Link
              href="/affiliate"
              className="border border-line px-5 py-2.5 text-sm tracking-[0.16em] uppercase text-cream hover:border-gold"
            >
              Apply as affiliate
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Catalog</p>
            <h2 className="font-display text-3xl mt-2">Reviewed flower</h2>
          </div>
          <p className="text-sm text-muted max-w-sm text-right">
            Empty except what people actually reviewed. No sample SKUs.
          </p>
        </div>

        {products.length === 0 ? (
          <p className="text-muted">No approved reviews yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const trusted = product.reviews.filter((review) =>
                isTrustedReview(review.status, review.user),
              );
              const photo =
                trusted.flatMap((review) => review.photos)[0] ??
                product.reviews.flatMap((review) => review.photos)[0] ??
                null;
              return (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  strain={product.strain}
                  brand={product.brand.name}
                  photo={photo}
                  trustedBuy={trusted.filter((r) => r.verdict === "BUY").length}
                  trustedDontBuy={trusted.filter((r) => r.verdict === "DONT_BUY").length}
                  trustedLikes={trusted.reduce((sum, r) => sum + r.likes.length, 0)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
