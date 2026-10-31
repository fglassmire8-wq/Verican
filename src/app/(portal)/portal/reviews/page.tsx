import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PortalReviewsTable } from "@/components/PortalReviewsTable";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/lib/public-origin";
import { getSession } from "@/lib/session";

export const metadata = { title: "My reviews" };
export const dynamic = "force-dynamic";

export default async function PortalReviewsPage() {
  const session = await getSession();
  const originRequest = { headers: await headers() };
  if (!session?.user?.id) {
    redirect(publicUrl("/login?callbackUrl=/portal/reviews", originRequest).toString());
  }
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
    },
  });
  if (!user) redirect(publicUrl("/login", originRequest).toString());

  const reviews = user.reviews.map((review) => ({
    ...review,
    user: { role: user.role, affiliateStatus: user.affiliateStatus },
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Affiliate HQ</p>
        <Link
          href="/portal/submit"
          className="border border-gold bg-gold text-ink px-5 py-2.5 text-sm tracking-[0.12em] uppercase"
        >
          Add a review
        </Link>
      </div>
      <PortalReviewsTable reviews={reviews} />
    </div>
  );
}
