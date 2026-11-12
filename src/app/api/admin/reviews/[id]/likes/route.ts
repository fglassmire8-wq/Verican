import { NextRequest, NextResponse } from "next/server";
import { requireConfirm, requireFounderApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null);
  if (!requireConfirm(body)) {
    return NextResponse.json({ error: "Confirm the reset." }, { status: 400 });
  }
  const { id } = await context.params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });
  const result = await prisma.like.deleteMany({ where: { reviewId: id } });
  return NextResponse.json({ ok: true, deleted: result.count });
}
