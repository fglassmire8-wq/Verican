import Link from "next/link";
import { isTrustedReview, plural, reviewDeskStatus, verdictLabel } from "@/lib/utils";

type PortalReview = {
  id: string;
  status: string;
  verdict: string;
  createdAt: Date;
  product: { slug: string; strain: string; brand: { name: string } };
  store: { name: string; city: string; state: string };
  photos: unknown[];
  likes: unknown[];
  user: { role: string; affiliateStatus: string };
};

export function PortalReviewsTable({ reviews }: { reviews: PortalReview[] }) {
  return (
    <section>
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Work</p>
      <h2 className="font-display text-3xl mt-2">Your reviews</h2>
      {reviews.length === 0 ? (
        <p className="mt-4 text-muted">You have not posted a review yet.</p>
      ) : (
        <>
          <ul className="mt-6 space-y-3 md:hidden">
            {reviews.map((review) => (
              <ReviewCardRow key={review.id} review={review} />
            ))}
          </ul>
          <div className="mt-6 hidden md:block overflow-x-auto border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-panel-2 text-[11px] uppercase tracking-[0.16em] text-gold">
                <tr>
                  <th className="px-4 py-3 font-medium">Strain</th>
                  <th className="px-4 py-3 font-medium">Store</th>
                  <th className="px-4 py-3 font-medium">Verdict</th>
                  <th className="px-4 py-3 font-medium">Photos</th>
                  <th className="px-4 py-3 font-medium">Likes</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-panel">
                {reviews.map((review) => {
                  const trusted = isTrustedReview(review.status, review.user);
                  return (
                    <tr key={review.id}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/product/${review.product.slug}`}
                          className="text-cream hover:text-gold-bright"
                        >
                          {review.product.strain}
                        </Link>
                        <p className="text-xs text-muted mt-0.5">
                          {review.product.brand.name}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {review.store.name}, {review.store.city}
                      </td>
                      <td
                        className={`px-4 py-3 tracking-[0.14em] uppercase text-xs ${
                          review.verdict === "BUY" ? "text-buy" : "text-dont"
                        }`}
                      >
                        {verdictLabel(review.verdict)}
                      </td>
                      <td className="px-4 py-3 text-muted">{review.photos.length}</td>
                      <td className="px-4 py-3 text-muted">
                        {trusted ? review.likes.length : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {reviewDeskStatus(review.status, review.user)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function ReviewCardRow({ review }: { review: PortalReview }) {
  const trusted = isTrustedReview(review.status, review.user);
  return (
    <li className="border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/product/${review.product.slug}`}
            className="font-display text-xl text-cream hover:text-gold-bright"
          >
            {review.product.strain}
          </Link>
          <p className="text-xs text-muted mt-1">
            {review.product.brand.name} · {review.store.name}, {review.store.city}
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
      <p className="mt-3 text-sm text-muted">
        {review.photos.length} {plural(review.photos.length, "photo")} ·{" "}
        {trusted ? `${review.likes.length} ${plural(review.likes.length, "like")}` : "likes not counted"}{" "}
        · {reviewDeskStatus(review.status, review.user)}
      </p>
    </li>
  );
}
