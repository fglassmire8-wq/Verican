import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseStarRating } from "@/lib/rating";
import { getSession } from "@/lib/session";

export async function POST(
  request: Request,
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

  const isOwner = session.user.role === "OWNER";
  if (review.userId !== session.user.id && !isOwner) {
    return NextResponse.json({ error: "You can only rate your own review." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseStarRating(body?.rating);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { rating: parsed.halves },
    select: { id: true, rating: true },
  });

  return NextResponse.json({
    ok: true,
    rating: updated.rating != null ? updated.rating / 2 : null,
  });
}
