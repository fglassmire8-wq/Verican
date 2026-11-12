import { NextRequest, NextResponse } from "next/server";
import { requireConfirm, requireFounderApi } from "@/lib/admin-auth";
import { deleteReviewAndFiles } from "@/lib/admin-reviews";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ROLES = ["MEMBER", "AFFILIATE", "OWNER"] as const;
const AFFILIATE = ["NONE", "PENDING", "VERIFIED", "REJECTED"] as const;

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: "Name must be 2–80 characters." }, { status: 400 });
    }
    data.name = name;
  }
  if (body.role !== undefined) {
    const role = String(body.role);
    if (!ROLES.includes(role as (typeof ROLES)[number])) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (id === auth.user!.id && role !== user.role) {
      return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
    }
    data.role = role;
  }
  if (body.affiliateStatus !== undefined) {
    const affiliateStatus = String(body.affiliateStatus);
    if (!AFFILIATE.includes(affiliateStatus as (typeof AFFILIATE)[number])) {
      return NextResponse.json({ error: "Invalid affiliate status." }, { status: 400 });
    }
    data.affiliateStatus = affiliateStatus;
  }
  if (body.disabled !== undefined) {
    const disabled = Boolean(body.disabled);
    if (id === auth.user!.id && disabled) {
      return NextResponse.json({ error: "You cannot disable your own account." }, { status: 400 });
    }
    data.disabled = disabled;
  }

  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({
    ok: true,
    user: {
      id: updated.id,
      role: updated.role,
      affiliateStatus: updated.affiliateStatus,
      disabled: updated.disabled,
    },
  });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as {
    confirm?: unknown;
    removeContent?: unknown;
  } | null;
  if (!requireConfirm(body)) {
    return NextResponse.json({ error: "Confirm the delete." }, { status: 400 });
  }
  const { id } = await context.params;
  if (id === auth.user!.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { id },
    include: { reviews: { select: { id: true } }, likes: { select: { id: true } } },
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const hasContent = user.reviews.length > 0 || user.likes.length > 0;
  if (hasContent && !body?.removeContent) {
    return NextResponse.json(
      {
        error: "This account has reviews or likes. Confirm again and choose to remove its content.",
        reviewCount: user.reviews.length,
        likeCount: user.likes.length,
      },
      { status: 409 },
    );
  }
  if (body?.removeContent) {
    for (const review of user.reviews) {
      await deleteReviewAndFiles(review.id);
    }
    await prisma.like.deleteMany({ where: { userId: id } });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
