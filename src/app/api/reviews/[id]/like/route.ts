import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isTrustedReview } from "@/lib/utils";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { id } = await context.params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }
  if (!isTrustedReview(review.status, review.user)) {
    return NextResponse.json(
      { error: "Only approved verified-affiliate reviews can be liked." },
      { status: 400 },
    );
  }

  const existing = await prisma.like.findUnique({
    where: { reviewId_userId: { reviewId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({
      data: { reviewId: id, userId: session.user.id },
    });
  }

  const count = await prisma.like.count({ where: { reviewId: id } });
  return NextResponse.json({ liked: !existing, count });
}
