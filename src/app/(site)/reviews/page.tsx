import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { ReviewCard } from "@/components/ReviewCard";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await getSession();
  const reviews = await prisma.review.findMany({
    where: { status: "APPROVED" },
    include: {
      user: true,
      store: true,
      likes: true,
      product: { include: { brand: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
      <h1 className="font-display text-4xl">Reviews</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Every approved, public review on Green Vault, newest first.
      </p>
      <div className="mt-10">
        {reviews.length === 0 ? (
          <EmptyState title="No reviews here yet">
            Be the first.{" "}
            <Link href="/portal/submit" className="text-gold hover:text-gold-bright underline">
              Submit a review
            </Link>
            . Green Vault does not add products on its own.
          </EmptyState>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id}>
                <Link
                  href={`/product/${review.product.slug}`}
                  className="mb-2 block text-sm font-semibold text-gold hover:text-gold-bright"
                >
                  {review.product.strain} · {review.product.brand.name}
                </Link>
                <ReviewCard review={review} currentUserId={session?.user?.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
