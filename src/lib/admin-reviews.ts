import { prisma } from "@/lib/prisma";
import { deleteStoredPhoto } from "@/lib/uploads";

export const REVIEW_STATUSES = ["APPROVED", "PENDING", "REJECTED", "HIDDEN"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export async function deleteReviewAndFiles(reviewId: string) {
  const photos = await prisma.photo.findMany({ where: { reviewId } });
  for (const photo of photos) {
    await deleteStoredPhoto(photo.path);
  }
  await prisma.review.delete({ where: { id: reviewId } });
}
