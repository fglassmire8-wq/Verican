import { formatDate, formatPrice, isTrustedReview, verdictLabel } from "@/lib/utils";
import { LikeButton } from "@/components/LikeButton";

type ReviewCardProps = {
  review: {
    id: string;
    notes: string;
    verdict: string;
    amount: string;
    priceCents: number;
    currency: string;
    harvestDate: string | null;
    expDate: string | null;
    thcPercent: number | null;
    thcaPercent: number | null;
    topTerpene: string | null;
    status: string;
    createdAt: Date;
    user: { name: string; role: string; affiliateStatus: string };
    store: { name: string; city: string; state: string };
    likes: { userId: string }[];
  };
  currentUserId?: string;
};

export function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const trusted = isTrustedReview(review.status, review.user);
  const liked = currentUserId
    ? review.likes.some((like) => like.userId === currentUserId)
    : false;

  return (
    <article
      className={`border p-5 sm:p-6 ${
        trusted ? "border-line bg-panel" : "border-dashed border-muted/40 bg-panel-2"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p className="font-display text-xl text-cream">{review.user.name}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted mt-1">
            {trusted ? "Verified affiliate" : "Unverified member review"}
            {review.user.role === "OWNER" ? " · Owner" : ""}
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

      <p className="mt-5 text-[17px] leading-relaxed text-cream/90 whitespace-pre-wrap">
        {review.notes}
      </p>

      <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted">
        <div>
          <dt className="uppercase tracking-widest text-[10px] text-gold">Bought</dt>
          <dd>
            {review.store.name}, {review.store.city}, {review.store.state}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-widest text-[10px] text-gold">Amount / price</dt>
          <dd>
            {review.amount} · {formatPrice(review.priceCents, review.currency)} plus tax
          </dd>
        </div>
        {review.harvestDate ? (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-gold">Harvest</dt>
            <dd>{review.harvestDate}</dd>
          </div>
        ) : null}
        {review.expDate ? (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-gold">Exp</dt>
            <dd>{review.expDate}</dd>
          </div>
        ) : null}
        {review.thcPercent != null ? (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-gold">Total THC</dt>
            <dd>{review.thcPercent}%</dd>
          </div>
        ) : null}
        {review.thcaPercent != null ? (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-gold">THCa</dt>
            <dd>{review.thcaPercent}%</dd>
          </div>
        ) : null}
        {review.topTerpene ? (
          <div className="sm:col-span-2">
            <dt className="uppercase tracking-widest text-[10px] text-gold">Top terpene</dt>
            <dd>{review.topTerpene}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
        {trusted ? (
          <LikeButton
            reviewId={review.id}
            initialCount={review.likes.length}
            initialLiked={liked}
            canLike={Boolean(currentUserId)}
          />
        ) : (
          <p className="text-xs text-muted">Not counted in trusted rank</p>
        )}
      </div>
    </article>
  );
}
