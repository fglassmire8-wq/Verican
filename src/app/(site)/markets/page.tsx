import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { isTrustedReview } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Markets" };

export default async function MarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const products = await prisma.product.findMany({
    where: {
      reviews: { some: { status: "APPROVED" } },
      ...(query
        ? {
            OR: [
              { strain: { contains: query } },
              { brand: { name: { contains: query } } },
              {
                reviews: {
                  some: {
                    status: "APPROVED",
                    store: {
                      OR: [
                        { name: { contains: query } },
                        { city: { contains: query } },
                      ],
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      brand: true,
      reviews: {
        where: { status: "APPROVED" },
        include: {
          user: true,
          photos: { orderBy: { sortOrder: "asc" } },
          likes: true,
          store: true,
        },
      },
    },
    orderBy: { strain: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Search</p>
      <h1 className="font-display text-4xl mt-2">Markets</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Search strain, brand, or store. Only flower with an approved public review appears.
      </p>

      <form className="mt-8 flex gap-2" action="/markets">
        <input
          name="q"
          defaultValue={query}
          placeholder="MAX A/C, Illicit Gardens, Cottonmouth…"
          className="flex-1 bg-panel border border-line px-4 py-3 text-cream placeholder:text-muted/60 outline-none focus:border-gold"
        />
        <button
          type="submit"
          className="border border-gold bg-gold text-ink px-5 py-3 text-sm tracking-[0.16em] uppercase"
        >
          Search
        </button>
      </form>

      <div className="mt-10">
        {products.length === 0 ? (
          <p className="text-muted">
            {query
              ? "No matching products. The catalog only includes reviewed flower."
              : "No approved reviews yet."}
          </p>
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
      </div>
    </div>
  );
}
