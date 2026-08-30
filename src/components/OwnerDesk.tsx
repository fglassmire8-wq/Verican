import Link from "next/link";
import { ModerationActions } from "@/components/ModerationActions";
import { formatDate, formatPrice, plural, verdictLabel } from "@/lib/utils";
import type { LeaderboardRow } from "@/lib/affiliates";

type PendingAffiliate = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

type PendingReview = {
  id: string;
  notes: string;
  verdict: string;
  amount: string;
  priceCents: number;
  currency: string;
  createdAt: Date;
  user: { name: string };
  product: { strain: string; brand: { name: string } };
  store: { name: string; city: string; state: string };
  photos: unknown[];
};

export function OwnerDesk({
  pendingAffiliates,
  pendingReviews,
  verified,
}: {
  pendingAffiliates: PendingAffiliate[];
  pendingReviews: PendingReview[];
  verified: LeaderboardRow[];
}) {
  return (
    <section className="border border-gold/30 bg-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Owner</p>
          <h2 className="font-display text-3xl mt-2">Desk</h2>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            Applications, pending reviews, and verified affiliates. Full tools stay
            on Moderation.
          </p>
        </div>
        <Link
          href="/moderation"
          className="border border-gold bg-gold text-ink px-4 py-2 text-xs tracking-[0.16em] uppercase"
        >
          Open moderation
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="font-display text-2xl">Pending applications</h3>
          {pendingAffiliates.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No pending applications.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingAffiliates.map((user) => (
                <li key={user.id} className="border border-line bg-panel-2 p-4">
                  <p className="font-display text-xl">{user.name}</p>
                  <p className="text-sm text-muted mt-1">
                    {user.email} · applied {formatDate(user.createdAt)}
                  </p>
                  <div className="mt-3">
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
        </div>

        <div>
          <h3 className="font-display text-2xl">Pending reviews</h3>
          {pendingReviews.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No pending reviews.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingReviews.map((review) => (
                <li key={review.id} className="border border-line bg-panel-2 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-xl">
                        {review.product.strain}{" "}
                        <span className="text-muted text-base">
                          · {review.product.brand.name}
                        </span>
                      </p>
                      <p className="text-sm text-muted mt-1">
                        {review.user.name} · {review.store.name}, {review.store.city}{" "}
                        · {review.photos.length} {plural(review.photos.length, "photo")}{" "}
                        · {formatPrice(review.priceCents, review.currency)} ·{" "}
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`text-xs tracking-[0.14em] uppercase ${
                        review.verdict === "BUY" ? "text-buy" : "text-dont"
                      }`}
                    >
                      {verdictLabel(review.verdict)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-cream/80 line-clamp-3 whitespace-pre-wrap">
                    {review.notes}
                  </p>
                  <div className="mt-3">
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
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-display text-2xl">Verified affiliates</h3>
        {verified.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No verified affiliates yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border border-line">
            {verified.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 bg-panel-2"
              >
                <p className="text-cream">
                  #{row.rank} {row.name}
                  {row.role === "OWNER" ? (
                    <span className="ml-2 text-xs uppercase tracking-[0.16em] text-gold">
                      Owner
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-muted">
                  {row.likes} {plural(row.likes, "like")} · {row.approvedReviews}{" "}
                  {plural(row.approvedReviews, "approved review")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
