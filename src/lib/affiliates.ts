import { prisma } from "@/lib/prisma";
import { isTrustedAffiliate } from "@/lib/utils";

export const verifiedAffiliateWhere = {
  OR: [{ role: "OWNER" as const }, { affiliateStatus: "VERIFIED" as const }],
};

export type LeaderboardRow = {
  id: string;
  name: string;
  role: string;
  affiliateStatus: string;
  likes: number;
  approvedReviews: number;
  rank: number;
};

export async function getVerifiedAffiliateLeaderboard(): Promise<LeaderboardRow[]> {
  const affiliates = await prisma.user.findMany({
    where: verifiedAffiliateWhere,
    include: {
      reviews: {
        where: { status: "APPROVED" },
        include: { _count: { select: { likes: true } } },
      },
    },
  });

  return affiliates
    .map((affiliate) => ({
      id: affiliate.id,
      name: affiliate.name,
      role: affiliate.role,
      affiliateStatus: affiliate.affiliateStatus,
      likes: affiliate.reviews.reduce((sum, review) => sum + review._count.likes, 0),
      approvedReviews: affiliate.reviews.length,
    }))
    .sort((a, b) => b.likes - a.likes || a.id.localeCompare(b.id))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function leaderboardEntryFor(
  board: LeaderboardRow[],
  userId: string,
  user: { role: string; affiliateStatus: string },
): LeaderboardRow | null {
  if (!isTrustedAffiliate(user)) return null;
  return board.find((row) => row.id === userId) ?? null;
}

export function countReviewsByStatus(reviews: { status: string }[]) {
  return {
    pending: reviews.filter((review) => review.status === "PENDING").length,
    approved: reviews.filter((review) => review.status === "APPROVED").length,
    rejected: reviews.filter((review) => review.status === "REJECTED").length,
  };
}

export function trustedLikesReceived(
  reviews: { status: string; likes: unknown[] }[],
  user: { role: string; affiliateStatus: string },
): number {
  if (!isTrustedAffiliate(user)) return 0;
  return reviews.reduce((sum, review) => {
    return review.status === "APPROVED" ? sum + review.likes.length : sum;
  }, 0);
}
