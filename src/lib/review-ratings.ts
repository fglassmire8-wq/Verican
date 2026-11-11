import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { averageStars } from "@/lib/rating";
import { VISITOR_COOKIE, isValidVisitorId } from "@/lib/visitor";

export type VisitorStats = {
  average: number | null;
  count: number;
  visitorHalves: number | null;
};

export async function getVisitorStats(
  reviewIds: string[],
  { includeVisitor = false }: { includeVisitor?: boolean } = {},
): Promise<Map<string, VisitorStats>> {
  const map = new Map<string, VisitorStats>();
  for (const id of reviewIds) {
    map.set(id, { average: null, count: 0, visitorHalves: null });
  }
  if (!reviewIds.length) return map;

  const groups = await prisma.reviewRating.groupBy({
    by: ["reviewId"],
    where: { reviewId: { in: reviewIds } },
    _avg: { value: true },
    _count: { _all: true },
  });

  for (const group of groups) {
    const avgHalves = group._avg.value ?? 0;
    map.set(group.reviewId, {
      average: averageStars(avgHalves),
      count: group._count._all,
      visitorHalves: null,
    });
  }

  if (includeVisitor) {
    const jar = await cookies();
    const visitorId = jar.get(VISITOR_COOKIE)?.value;
    if (isValidVisitorId(visitorId)) {
      const rows = await prisma.reviewRating.findMany({
        where: { reviewId: { in: reviewIds }, visitorId },
        select: { reviewId: true, value: true },
      });
      for (const row of rows) {
        const current = map.get(row.reviewId);
        if (current) current.visitorHalves = row.value;
      }
    }
  }

  return map;
}
