import { NextRequest, NextResponse } from "next/server";
import { requireConfirm, requireFounderApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; ratingId: string }> },
) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null);
  if (!requireConfirm(body)) {
    return NextResponse.json({ error: "Confirm the delete." }, { status: 400 });
  }
  const { id, ratingId } = await context.params;
  const rating = await prisma.reviewRating.findUnique({ where: { id: ratingId } });
  if (!rating || rating.reviewId !== id) {
    return NextResponse.json({ error: "Rating not found." }, { status: 404 });
  }
  await prisma.reviewRating.delete({ where: { id: ratingId } });
  return NextResponse.json({ ok: true });
}
