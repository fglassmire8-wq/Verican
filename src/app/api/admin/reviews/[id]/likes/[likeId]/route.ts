import { NextRequest, NextResponse } from "next/server";
import { requireConfirm, requireFounderApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; likeId: string }> },
) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null);
  if (!requireConfirm(body)) {
    return NextResponse.json({ error: "Confirm the delete." }, { status: 400 });
  }
  const { id, likeId } = await context.params;
  const like = await prisma.like.findUnique({ where: { id: likeId } });
  if (!like || like.reviewId !== id) {
    return NextResponse.json({ error: "Like not found." }, { status: 404 });
  }
  await prisma.like.delete({ where: { id: likeId } });
  return NextResponse.json({ ok: true });
}
