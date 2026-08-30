import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Brands" };

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    where: {
      products: {
        some: {
          reviews: { some: { status: "APPROVED" } },
        },
      },
    },
    include: {
      products: {
        where: { reviews: { some: { status: "APPROVED" } } },
        include: {
          _count: { select: { reviews: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Cultivators</p>
      <h1 className="font-display text-4xl mt-2">Brands</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Brands appear here only after an approved public review. No placeholder catalog.
      </p>

      <div className="mt-10 space-y-4">
        {brands.length === 0 ? (
          <p className="text-muted">No brands with approved reviews yet.</p>
        ) : (
          brands.map((brand) => (
            <article key={brand.id} className="border border-line bg-panel p-6">
              <h2 className="font-display text-3xl">{brand.name}</h2>
              <p className="mt-2 text-sm text-muted">
                {[brand.legalName, brand.license ? `license ${brand.license}` : null, brand.location]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <ul className="mt-4 space-y-2">
                {brand.products.map((product) => (
                  <li key={product.id}>
                    <Link href={`/product/${product.slug}`} className="text-gold hover:text-gold-bright">
                      {product.strain}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
