import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { ReviewThumbCard } from "@/components/ReviewThumbCard";
import { PRODUCT_CATEGORIES, parseCategory } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { reviewGridColumnCounts } from "@/lib/review-grid";

export const metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam = "" } = await searchParams;
  const selected = parseCategory(categoryParam);

  const reviews = await prisma.review.findMany({
    where: { status: "APPROVED" },
    include: {
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      product: { include: { brand: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = Object.fromEntries(
    PRODUCT_CATEGORIES.map((item) => [
      item.value,
      reviews.filter((review) => review.product.category === item.value).length,
    ]),
  ) as Record<string, number>;

  const filtered = selected
    ? reviews.filter((review) => review.product.category === selected.value)
    : reviews;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
      <h1 className="font-display text-4xl">Reviews</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Every approved, public review on Green Vault, newest first.
      </p>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Filter reviews by category">
        <FilterChip href="/reviews" label="All" count={reviews.length} active={!selected} />
        {PRODUCT_CATEGORIES.map((item) => (
          <FilterChip
            key={item.value}
            href={`/reviews?category=${item.slug}`}
            label={item.label}
            count={counts[item.value] ?? 0}
            active={selected?.value === item.value}
          />
        ))}
      </nav>

      <div className="mt-5">
        {filtered.length === 0 ? (
          <EmptyState title={selected ? `No ${selected.label.toLowerCase()} reviews yet` : "No reviews here yet"}>
            {selected ? (
              <>Nothing in {selected.label} yet.{" "}
                <Link href="/reviews" className="text-gold hover:text-gold-bright underline">
                  See all reviews
                </Link>
                .
              </>
            ) : (
              <>
                Be the first.{" "}
                <Link href="/portal/submit" className="text-gold hover:text-gold-bright underline">
                  Submit a review
                </Link>
                . Green Vault does not add products on its own.
              </>
            )}
          </EmptyState>
        ) : (
          <ReviewPhotoGrid count={filtered.length}>
            {filtered.map((review, index) => {
              const photo = review.photos[0] ?? null;
              return (
                <ReviewThumbCard
                  key={review.id}
                  number={index + 1}
                  slug={review.product.slug}
                  strain={review.product.strain}
                  brand={review.product.brand.name}
                  category={review.product.category}
                  photo={photo}
                  priority={index < 8}
                />
              );
            })}
          </ReviewPhotoGrid>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
        active
          ? "border-gold bg-gold text-ink"
          : "border-line bg-panel text-cream hover:bg-panel-2 hover:border-gold"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 text-xs tabular-nums ${
          active ? "bg-white/20 text-ink" : "bg-panel-2 text-muted"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function ReviewPhotoGrid({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const cols = reviewGridColumnCounts(count);
  return (
    <div
      className="review-photo-grid"
      style={
        {
          "--review-cols-mobile": String(cols.mobile),
          "--review-cols-tablet": String(cols.tablet),
          "--review-cols-desktop": String(cols.desktop),
          "--review-cols-wide": String(cols.wide),
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
