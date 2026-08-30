import { notFound } from "next/navigation";
import { ModerationActions } from "@/components/ModerationActions";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import { formatDate, formatPrice, verdictLabel } from "@/lib/utils";

export const metadata = { title: "Moderation" };
export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const owner = await requireOwner();
  if (!owner) notFound();

  const [pendingAffiliates, pendingReviews] = await Promise.all([
    prisma.user.findMany({
      where: { affiliateStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.review.findMany({
      where: { status: "PENDING" },
      include: {
        user: true,
        product: { include: { brand: true } },
        store: true,
        photos: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Owner only</p>
      <h1 className="font-display text-4xl mt-2">Moderation</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Approve or reject affiliate applications and pending reviews. Member notes
        publish unverified on their own. Verified-affiliate reviews stay here until
        you decide.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Affiliate applications</h2>
        {pendingAffiliates.length === 0 ? (
          <p className="mt-4 text-muted">No pending applications.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {pendingAffiliates.map((user) => (
              <li key={user.id} className="border border-line bg-panel p-5">
                <p className="font-display text-2xl">{user.name}</p>
                <p className="text-sm text-muted mt-1">
                  {user.email} · applied {formatDate(user.createdAt)}
                </p>
                <div className="mt-4">
                  <ModerationActions
                    endpoint={`/api/moderation/affiliates/${user.id}`}
                    approveValue="VERIFIED"
                    rejectValue="REJECTED"
                    approveLabel="Verify"
                    rejectLabel="Reject"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Pending reviews</h2>
        {pendingReviews.length === 0 ? (
          <p className="mt-4 text-muted">No pending reviews.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {pendingReviews.map((review) => (
              <li key={review.id} className="border border-line bg-panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl">
                      {review.product.strain}{" "}
                      <span className="text-muted text-lg">
                        · {review.product.brand.name}
                      </span>
                    </p>
                    <p className="text-sm text-muted mt-1">
                      {review.user.name} · {review.store.name}, {review.store.city},{" "}
                      {review.store.state} · {review.amount} ·{" "}
                      {formatPrice(review.priceCents, review.currency)} ·{" "}
                      {review.photos.length} photo
                      {review.photos.length === 1 ? "" : "s"} ·{" "}
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-sm tracking-[0.16em] uppercase ${
                      review.verdict === "BUY" ? "text-buy" : "text-dont"
                    }`}
                  >
                    {verdictLabel(review.verdict)}
                  </span>
                </div>
                <p className="mt-4 text-cream/90 whitespace-pre-wrap">{review.notes}</p>
                <div className="mt-4">
                  <ModerationActions
                    endpoint={`/api/moderation/reviews/${review.id}`}
                    approveValue="APPROVED"
                    rejectValue="REJECTED"
                    approveLabel="Approve"
                    rejectLabel="Reject"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
