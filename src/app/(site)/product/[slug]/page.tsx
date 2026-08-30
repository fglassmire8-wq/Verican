import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isTrustedReview, verdictLabel } from "@/lib/utils";
import { PhotoGallery } from "@/components/PhotoGallery";
import { ReviewCard } from "@/components/ReviewCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true },
  });
  if (!product) return { title: "Product" };
  return { title: `${product.strain} — ${product.brand.name}` };
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

  const trusted = product.reviews.filter((review) =>
    isTrustedReview(review.status, review.user),
  );
  const member = product.reviews.filter(
    (review) => !isTrustedReview(review.status, review.user),
  );
  const photos = trusted.flatMap((review) => review.photos);
  const uniquePhotos = photos.filter(
    (photo, i) => photos.findIndex((p) => p.path === photo.path) === i,
  );

  const buy = trusted.filter((r) => r.verdict === "BUY").length;
  const dont = trusted.filter((r) => r.verdict === "DONT_BUY").length;
  const likes = trusted.reduce((sum, r) => sum + r.likes.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
        {product.brand.name}
        {product.brand.location ? ` · ${product.brand.location}` : ""}
      </p>
      <h1 className="font-display text-4xl sm:text-5xl mt-2">{product.strain}</h1>
      <p className="mt-2 text-muted text-sm">
        {product.category === "FLOWER" ? "Flower" : product.category}
        {product.brand.legalName ? ` · ${product.brand.legalName}` : ""}
        {product.brand.license ? ` · license ${product.brand.license}` : ""}
      </p>

      <p className="mt-4 text-sm text-cream/80">
        {trusted.length === 0
          ? "No verified-affiliate reviews yet."
          : `${trusted.length} verified review${trusted.length === 1 ? "" : "s"} · ${buy} ${verdictLabel("BUY")}${
              dont ? ` · ${dont} ${verdictLabel("DONT_BUY")}` : ""
            } · ${likes} like${likes === 1 ? "" : "s"}`}
      </p>
      <p className="mt-1 text-xs text-muted">
        Trusted rank uses approved verified-affiliate reviews only. There is no invented score.
      </p>

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
            />
          ))}
        </div>
      </div>

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
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
