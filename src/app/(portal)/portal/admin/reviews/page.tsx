import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireFounderPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatDate, reviewDeskStatus } from "@/lib/utils";

export const metadata = { title: "Reviews · Founder admin" };
export const dynamic = "force-dynamic";

const STATUSES = ["ALL", "APPROVED", "PENDING", "REJECTED", "HIDDEN"] as const;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireFounderPage("/portal/admin/reviews");
  const { status: raw = "ALL" } = await searchParams;
  const status = STATUSES.includes(raw as (typeof STATUSES)[number]) ? raw : "ALL";
  const reviews = await prisma.review.findMany({
    where: status === "ALL" ? undefined : { status },
    include: {
      user: true,
      store: true,
      product: { include: { brand: true } },
      _count: { select: { photos: true, likes: true, ratings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Founder only</p>
      <h1 className="font-display text-4xl mt-2">Reviews</h1>
      <AdminNav path="/portal/admin/reviews" />
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {STATUSES.map((value) => (
          <Link
            key={value}
            href={value === "ALL" ? "/portal/admin/reviews" : `/portal/admin/reviews?status=${value}`}
            className={`border px-3 py-1.5 ${
              status === value ? "border-gold bg-gold text-ink" : "border-line hover:border-gold"
            }`}
          >
            {value === "ALL" ? "All" : value.charAt(0) + value.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>
      {reviews.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No reviews in this filter.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border border-line">
          {reviews.map((review) => (
            <li key={review.id} className="bg-panel-2 px-4 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-xl">
                  {review.product.strain}{" "}
                  <span className="text-base text-muted">· {review.product.brand.name}</span>
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-gold">
                  {reviewDeskStatus(review.status, review.user)}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted">
                {review.user.name} · {review.store.name}, {review.store.city} ·{" "}
                {formatDate(review.createdAt)} · {review._count.photos} photos · {review._count.likes}{" "}
                likes · {review._count.ratings} ratings
              </p>
              <Link
                href={`/portal/admin/reviews/${review.id}`}
                className="mt-2 inline-block text-sm text-gold hover:text-gold-bright underline"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
