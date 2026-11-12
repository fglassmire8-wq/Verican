import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { PhotoCaptionForm } from "@/components/admin/PhotoCaptionForm";
import { ReviewEditForm } from "@/components/admin/ReviewEditForm";
import { requireFounderPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { halvesToStars } from "@/lib/rating";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Edit review · Founder admin" };
export const dynamic = "force-dynamic";

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireFounderPage("/portal/admin/reviews");
  const { id } = await params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      user: true,
      store: true,
      product: { include: { brand: true } },
      photos: { orderBy: { sortOrder: "asc" } },
      likes: { include: { user: true }, orderBy: { id: "asc" } },
      ratings: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!review) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Founder only</p>
      <h1 className="font-display text-4xl mt-2">{review.product.strain}</h1>
      <p className="mt-2 text-sm text-muted">
        {review.product.brand.name} · posted by {review.user.name} ({review.user.email})
      </p>
      <AdminNav path="/portal/admin/reviews" />

      <section className="mt-10">
        <h2 className="font-display text-2xl">Review</h2>
        <div className="mt-4">
          <ReviewEditForm
            review={{
              ...review,
              createdAt: review.createdAt.toISOString(),
            }}
          />
        </div>
        <div className="mt-6">
          <ConfirmButton
            url={`/api/admin/reviews/${review.id}`}
            confirmText={`Delete this review of ${review.product.strain}? This cannot be undone.`}
            label="Delete review"
            redirectTo="/portal/admin/reviews"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Photos</h2>
        {review.photos.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No photos.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {review.photos.map((photo) => (
              <li key={photo.id} className="border border-line bg-panel p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.path} alt={photo.alt} className="max-h-48 w-auto mb-3" />
                <PhotoCaptionForm id={photo.id} alt={photo.alt} />
                <div className="mt-3">
                  <ConfirmButton
                    url={`/api/admin/photos/${photo.id}`}
                    confirmText={`Delete this photo (${photo.alt})? The file will be removed too.`}
                    label="Delete photo"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Likes</h2>
        <p className="mt-1 text-sm text-muted">{review.likes.length} total</p>
        {review.likes.length === 0 ? null : (
          <>
            <ul className="mt-3 divide-y divide-line border border-line">
              {review.likes.map((like) => (
                <li key={like.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-panel-2">
                  <span className="text-sm">{like.user.name} · {like.user.email}</span>
                  <ConfirmButton
                    url={`/api/admin/reviews/${review.id}/likes/${like.id}`}
                    confirmText={`Remove ${like.user.name}'s like?`}
                    label="Remove"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <ConfirmButton
                url={`/api/admin/reviews/${review.id}/likes`}
                confirmText="Reset all likes on this review?"
                label="Reset all likes"
              />
            </div>
          </>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Visitor ratings</h2>
        <p className="mt-1 text-sm text-muted">{review.ratings.length} total</p>
        {review.ratings.length === 0 ? null : (
          <>
            <ul className="mt-3 divide-y divide-line border border-line">
              {review.ratings.map((rating) => (
                <li key={rating.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-panel-2">
                  <span className="text-sm">
                    {halvesToStars(rating.value).toFixed(1)} / 5 · {formatDate(rating.createdAt)} · visitor{" "}
                    {rating.visitorId.slice(0, 8)}
                  </span>
                  <ConfirmButton
                    url={`/api/admin/reviews/${review.id}/ratings/${rating.id}`}
                    confirmText="Remove this visitor rating?"
                    label="Remove"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <ConfirmButton
                url={`/api/admin/reviews/${review.id}/ratings`}
                confirmText="Reset all visitor ratings on this review?"
                label="Reset all ratings"
              />
            </div>
          </>
        )}
      </section>

      <p className="mt-10 text-sm">
        <Link href="/portal/admin/reviews" className="text-gold hover:text-gold-bright underline">
          ← All reviews
        </Link>
      </p>
    </div>
  );
}
