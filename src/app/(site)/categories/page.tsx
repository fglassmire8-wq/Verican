import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { isTrustedReview } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Categories" };

const BASE_CATEGORIES: { value: string; label: string }[] = [
  { value: "FLOWER", label: "Flower" },
  { value: "VAPE", label: "Vapes" },
  { value: "CONCENTRATE", label: "Concentrates" },
  { value: "EDIBLE", label: "Edibles" },
  { value: "PREROLL", label: "Pre-rolls" },
];

function labelFor(value: string) {
  return (
    BASE_CATEGORIES.find((c) => c.value === value)?.label ??
    value.charAt(0) + value.slice(1).toLowerCase()
  );
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string }>;
}) {
  const { q = "", c = "" } = await searchParams;
  const query = q.trim();
  const category = c.trim().toUpperCase();

  const used = await prisma.product.findMany({
    where: { reviews: { some: { status: "APPROVED" } } },
    select: { category: true },
    distinct: ["category"],
  });
  const categories = [...BASE_CATEGORIES];
  for (const { category: value } of used) {
    if (!categories.some((x) => x.value === value)) categories.push({ value, label: labelFor(value) });
  }

  const products = await prisma.product.findMany({
    where: {
      reviews: { some: { status: "APPROVED" } },
      ...(category ? { category } : {}),
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
      <h1 className="font-display text-4xl">Categories</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Pick a category to see its reviewed products.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Product categories">
        {[{ value: "", label: "All" }, ...categories].map((item) => {
          const active = item.value === category;
          const href = item.value ? `/categories?c=${item.value.toLowerCase()}` : "/categories";
          return (
            <Link
              key={item.value || "all"}
              href={href}
              className={`rounded-full border px-4 py-2 text-sm ${
                active ? "border-gold bg-gold text-ink" : "border-line bg-panel text-cream hover:border-gold"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form className="mt-6 flex gap-2" action="/categories">
        {category ? <input type="hidden" name="c" value={category.toLowerCase()} /> : null}
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
          <EmptyState title={query ? "No matches" : category ? `No reviewed ${labelFor(category).toLowerCase()} yet` : "No approved reviews yet"}>
            {query
              ? `Nothing public matches “${query}”. Search covers strain, brand, and store on approved reviews only.`
              : "When a review is public, the strain, brand, and store can be searched here."}
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
      </div>
    </div>
  );
}
