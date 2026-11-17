import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { categoryLabel } from "@/lib/categories";
import { publicLineage } from "@/lib/product-lineage";
import { archivedLineageFor } from "@/lib/strain-genetics";
import { ProductPhotoEditor } from "@/components/admin/ProductPhotoEditor";
import { ProductLineageEditor } from "@/components/admin/ProductLineageEditor";
import { isTrustedReview, verdictLabel } from "@/lib/utils";
import { PhotoGallery } from "@/components/PhotoGallery";
import { ReviewCard } from "@/components/ReviewCard";
import { getVisitorStats } from "@/lib/review-ratings";
import type { Metadata } from "next";

function productShareDescription(strain: string, brand: string) {
  return `User opinions of ${strain} by ${brand}. Independent 21+ reviews. Green Vault is not a store and does not sell cannabis.`;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      reviews: {
        where: { status: "APPROVED" },
        include: { photos: { orderBy: { sortOrder: "asc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!product) return { title: "Page not found" };
  const title = product.brand.name ? `${product.strain} — ${product.brand.name}` : product.strain;
  const description = product.brand.name
    ? productShareDescription(product.strain, product.brand.name)
    : `Photos of ${product.strain}. Independent 21+ reviews. Green Vault is not a store and does not sell cannabis.`;
  const photo = product.reviews.flatMap((review) => review.photos)[0];
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: photo ? [{ url: photo.path, alt: photo.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: photo ? [photo.path] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      reviews: {
        where: { status: "APPROVED" },
        include: {
          user: true,
          store: true,
          photos: { orderBy: { sortOrder: "asc" } },
          likes: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  const visitorStats = await getVisitorStats(
    product.reviews.map((review) => review.id),
    { includeVisitor: true },
  );

  const written = product.reviews.filter((review) => !review.photoOnly);
  const trusted = written.filter((review) =>
    isTrustedReview(review.status, review.user),
  );
  const member = written.filter(
    (review) => !isTrustedReview(review.status, review.user),
  );
  const photos = product.reviews.flatMap((review) => review.photos);
  const uniquePhotos = photos.filter(
    (photo, i) => photos.findIndex((p) => p.path === photo.path) === i,
  );

  const buy = trusted.filter((r) => r.verdict === "BUY").length;
  const dont = trusted.filter((r) => r.verdict === "DONT_BUY").length;
  const likes = trusted.reduce((sum, r) => sum + r.likes.length, 0);
  const archived = publicLineage(product.lineage)
    ? null
    : await archivedLineageFor(product.strain);
  const lineage = publicLineage(product.lineage) ?? publicLineage(archived);
  const isFounder = session?.user?.role === "OWNER";
  const manageReview =
    product.reviews.find((review) => review.photoOnly) ?? product.reviews[0] ?? null;
  const photoOnlySize = product.reviews.find((review) => review.photoOnly && review.amount)?.amount ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {product.brand.name ? (
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">
        {product.brand.name}
        {product.brand.location ? ` · ${product.brand.location}` : ""}
      </p>
      ) : null}
      <h1 className="font-display text-4xl sm:text-5xl mt-2">{product.strain}</h1>
      <p className="mt-2 text-muted text-sm">
        {categoryLabel(product.category)}
        {photoOnlySize ? ` · ${photoOnlySize}` : ""}
        {product.brand.legalName ? ` · ${product.brand.legalName}` : ""}
        {product.brand.license ? ` · license ${product.brand.license}` : ""}
      </p>
      {lineage ? (
        <p className="mt-2 text-muted text-sm">
          <span className="text-[11px] uppercase tracking-[0.12em] text-gold">Lineage</span>
          <span className="ml-2">{lineage}</span>
        </p>
      ) : null}
      {isFounder ? (
        <ProductLineageEditor
          productId={product.id}
          strain={product.strain}
          lineage={product.lineage}
          archivedLineage={archived}
        />
      ) : null}

      {trusted.length === 0 ? (
        uniquePhotos.length ? (
          <p className="mt-4 text-sm text-muted">No written review yet.</p>
        ) : (
          <p className="mt-4 text-sm text-cream/80">No verified-affiliate reviews yet.</p>
        )
      ) : (
        <>
          <p className="mt-4 text-sm text-cream/80">
            {`${trusted.length} verified review${trusted.length === 1 ? "" : "s"} · ${buy} ${verdictLabel("BUY")}${
              dont ? ` · ${dont} ${verdictLabel("DONT_BUY")}` : ""
            } · ${likes} like${likes === 1 ? "" : "s"}`}
          </p>
          <p className="mt-1 text-xs text-muted">
            Trusted rank uses approved verified-affiliate reviews only. There is no invented score.
          </p>
        </>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <PhotoGallery
          photos={uniquePhotos.map((p) => ({ path: p.path, alt: p.alt }))}
        />
        <div className="space-y-6">
          {trusted.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={session?.user?.id}
              visitorAverage={visitorStats.get(review.id)?.average ?? null}
              visitorCount={visitorStats.get(review.id)?.count ?? 0}
              visitorHalves={visitorStats.get(review.id)?.visitorHalves ?? null}
              interactiveRatings
            />
          ))}
        </div>
      </div>

      {isFounder && manageReview ? (
        <ProductPhotoEditor
          reviewId={manageReview.id}
          photos={manageReview.photos.map((photo) => ({
            id: photo.id,
            path: photo.path,
            alt: photo.alt,
            sortOrder: photo.sortOrder,
          }))}
        />
      ) : null}

      {member.length ? (
        <section className="mt-16">
          <h2 className="font-display text-3xl">Member notes</h2>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Unverified, unrewarded, and excluded from trusted rank. Shown so you can still
            read what members posted after a purchase.
          </p>
          <div className="mt-6 space-y-4">
            {member.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={session?.user?.id}
                visitorAverage={visitorStats.get(review.id)?.average ?? null}
                visitorCount={visitorStats.get(review.id)?.count ?? 0}
                visitorHalves={visitorStats.get(review.id)?.visitorHalves ?? null}
                interactiveRatings
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
