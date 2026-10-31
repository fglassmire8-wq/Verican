import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/EmptyState";
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
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <h1 className="font-display text-4xl sm:text-5xl max-w-3xl leading-tight text-cream">
            Third party peer reviews
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted leading-relaxed">
            Green Vault publishes independent, third-party reviews of medical and
            recreational cannabis products, purely for quality control. In New Jersey you
            usually can&apos;t see the product before you buy it, so our goal is for every
            product on the market to eventually be reviewed.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/affiliate"
              className="border border-gold bg-gold text-ink px-6 py-3 text-base tracking-[0.08em] uppercase hover:bg-gold-bright hover:border-gold-bright"
            >
              Become an affiliate — Sign up
            </Link>
            <Link
              href="/categories"
              className="border border-line bg-panel px-6 py-3 text-base tracking-[0.08em] uppercase text-cream hover:border-gold"
            >
              Browse categories
            </Link>
          </div>
          <div className="mt-10 max-w-xl border border-line p-5 bg-panel">
            <h2 className="font-display text-2xl text-gold-bright">Affiliate Program</h2>
            <p className="mt-2 text-muted">Become an affiliate. Sign up here.</p>
            <Link
              href="/affiliate"
              className="mt-4 inline-block border border-gold bg-gold text-ink px-5 py-2.5 text-sm tracking-[0.12em] uppercase"
            >
              Sign up as an affiliate
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl">Recently reviewed</h2>
          </div>
          <Link href="/categories" className="text-sm text-gold hover:text-gold-bright">
            See all categories →
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState title="No approved reviews yet">
            Reviewed flower shows up here after someone posts a public review. Green Vault
            does not add products on its own.
          </EmptyState>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => {
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
                  priority={index < 3}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
