import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { averageStars, parseStarRating } from "@/lib/rating";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import {
  AGE_COOKIE,
  VISITOR_COOKIE,
  isValidVisitorId,
  newVisitorId,
  visitorCookieOptions,
} from "@/lib/visitor";

async function reviewPublic(id: string) {
  const review = await prisma.review.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!review || review.status !== "APPROVED") return null;
  return review;
}

async function stats(reviewId: string) {
  const aggregate = await prisma.reviewRating.aggregate({
    where: { reviewId },
    _avg: { value: true },
    _count: true,
  });
  const count = aggregate._count;
  return {
    average: count && aggregate._avg.value != null ? averageStars(aggregate._avg.value) : null,
    count,
  };
}

function requireAge(request: NextRequest) {
  return request.cookies.get(AGE_COOKIE)?.value === "1";
}

function visitorFrom(request: NextRequest): { id: string; fresh: boolean } {
  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  if (isValidVisitorId(existing)) return { id: existing, fresh: false };
  return { id: newVisitorId(), fresh: true };
}

function withVisitorCookie(response: NextResponse, visitor: { id: string; fresh: boolean }) {
  if (visitor.fresh) {
    response.cookies.set(VISITOR_COOKIE, visitor.id, visitorCookieOptions());
  }
  return response;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!requireAge(request)) {
    return NextResponse.json({ error: "Age verification required." }, { status: 403 });
  }

  const ip = clientIp(request);
  if (!allowRequest(`rate:${ip}`)) {
    return NextResponse.json({ error: "Too many ratings. Try again later." }, { status: 429 });
  }

  const { id } = await context.params;
  const review = await reviewPublic(id);
  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseStarRating(body?.value);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (parsed.halves == null) {
    return NextResponse.json({ error: "Choose a rating from 0.5 to 5.0." }, { status: 400 });
  }

  const visitor = visitorFrom(request);
  await prisma.reviewRating.upsert({
    where: { reviewId_visitorId: { reviewId: id, visitorId: visitor.id } },
    update: { value: parsed.halves },
    create: { reviewId: id, visitorId: visitor.id, value: parsed.halves },
  });

  const summary = await stats(id);
  const response = NextResponse.json({
    ok: true,
    value: parsed.halves / 2,
    average: summary.average,
    count: summary.count,
  });
  return withVisitorCookie(response, visitor);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!requireAge(request)) {
    return NextResponse.json({ error: "Age verification required." }, { status: 403 });
  }

  const ip = clientIp(request);
  if (!allowRequest(`rate:${ip}`)) {
    return NextResponse.json({ error: "Too many ratings. Try again later." }, { status: 429 });
  }

  const { id } = await context.params;
  const review = await reviewPublic(id);
  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  if (isValidVisitorId(existing)) {
    await prisma.reviewRating.deleteMany({
      where: { reviewId: id, visitorId: existing },
    });
  }

  const summary = await stats(id);
  return NextResponse.json({
    ok: true,
    value: null,
    average: summary.average,
    count: summary.count,
  });
}
