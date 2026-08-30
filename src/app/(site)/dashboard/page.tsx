import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatDate, formatPrice, isTrustedAffiliate, isTrustedReview, roleLabel, verdictLabel } from "@/lib/utils";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      reviews: {
        include: {
          product: { include: { brand: true } },
          store: true,
          likes: true,
          photos: true,
        },
        orderBy: { createdAt: "desc" },
      },
      likes: true,
    },
  });
  if (!user) redirect("/login");

  const trusted = isTrustedAffiliate(user);

  const affiliates = await prisma.user.findMany({
    where: {
      OR: [{ role: "OWNER" }, { affiliateStatus: "VERIFIED" }],
    },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        include: { _count: { select: { likes: true } } },
      },
    },
  });

  const ranked = affiliates
    .map((affiliate) => ({
      id: affiliate.id,
      likes: affiliate.reviews.reduce((sum, review) => sum + review._count.likes, 0),
    }))
    .sort((a, b) => b.likes - a.likes || a.id.localeCompare(b.id));

  const myLikes = ranked.find((row) => row.id === user.id)?.likes ?? 0;
  const myRank = trusted
    ? ranked.findIndex((row) => row.id === user.id) + 1
    : null;

  const likesGiven = user.likes.length;
  const likesReceived = user.reviews.reduce((sum, review) => {
    return isTrustedReview(review.status, user) ? sum + review.likes.length : sum;
  }, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Your account</p>
      <h1 className="font-display text-4xl mt-2">{user.name}</h1>
      <p className="mt-2 text-sm text-muted">
        {roleLabel(user.role, user.affiliateStatus)} · {user.email}
      </p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="border border-line bg-panel p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Reward status</p>
          <p className="font-display text-3xl mt-2">
            {trusted
              ? myRank
                ? `Rank ${myRank}`
                : "Unranked"
              : "Unverified"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {trusted
              ? `${myLikes} like${myLikes === 1 ? "" : "s"} on approved reviews`
              : "Member notes do not rank"}
          </p>
        </div>
        <div className="border border-line bg-panel p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Likes received</p>
          <p className="font-display text-3xl mt-2">{likesReceived}</p>
          <p className="mt-2 text-sm text-muted">Trusted reviews only</p>
        </div>
        <div className="border border-line bg-panel p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Likes given</p>
          <p className="font-display text-3xl mt-2">{likesGiven}</p>
          <p className="mt-2 text-sm text-muted">On verified reviews</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted leading-relaxed">
        Rank is ordering by likes on approved verified-affiliate reviews. There is
        no dollar amount here. Brand-funded discounts are configured later.
        {user.affiliateStatus === "PENDING"
          ? " Your affiliate application is pending — you do not need to sign out. After the owner verifies you, refresh this page or open Affiliate status."
          : ""}
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href="/submit"
          className="border border-gold bg-gold text-ink px-5 py-2.5 text-sm tracking-[0.16em] uppercase"
        >
          Submit a review
        </Link>
        {!trusted ? (
          <Link
            href="/affiliate"
            className="border border-line px-5 py-2.5 text-sm tracking-[0.16em] uppercase hover:border-gold"
          >
            Affiliate status
          </Link>
        ) : null}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Your reviews</h2>
        {user.reviews.length === 0 ? (
          <p className="mt-4 text-muted">You have not posted a review yet.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {user.reviews.map((review) => {
              const trustedReview = isTrustedReview(review.status, user);
              return (
                <li key={review.id} className="border border-line bg-panel p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/product/${review.product.slug}`}
                        className="font-display text-2xl text-cream hover:text-gold-bright"
                      >
                        {review.product.strain}
                      </Link>
                      <p className="text-sm text-muted mt-1">
                        {review.product.brand.name} · {review.store.name},{" "}
                        {review.store.city}
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
                  <p className="mt-3 text-sm text-muted">
                    {review.amount} · {formatPrice(review.priceCents, review.currency)} ·{" "}
                    {review.photos.length} photo{review.photos.length === 1 ? "" : "s"} ·{" "}
                    {formatDate(review.createdAt)}
                  </p>
                  <p className="mt-2 text-sm">
                    Status:{" "}
                    {review.status === "PENDING"
                      ? "Pending owner approval"
                      : review.status === "REJECTED"
                        ? "Rejected"
                        : trustedReview
                          ? `Approved · ${review.likes.length} like${review.likes.length === 1 ? "" : "s"}`
                          : "Published as unverified member note"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
