import { NextRequest, NextResponse } from "next/server";
import { requireConfirm, requireFounderApi } from "@/lib/admin-auth";
import { deleteReviewAndFiles, REVIEW_STATUSES } from "@/lib/admin-reviews";
import { prisma } from "@/lib/prisma";
import { parseStarRating } from "@/lib/rating";

export const dynamic = "force-dynamic";

function optionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const review = await prisma.review.findUnique({ where: { id }, include: { store: true } });
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (body.notes !== undefined) {
    const notes = String(body.notes ?? "").trim();
    if (!notes) return NextResponse.json({ error: "Notes are required." }, { status: 400 });
    data.notes = notes;
  }
  if (body.amount !== undefined) {
    const amount = String(body.amount ?? "").trim();
    if (!amount) return NextResponse.json({ error: "Amount is required." }, { status: 400 });
    data.amount = amount;
  }
  if (body.price !== undefined || body.priceCents !== undefined) {
    const price = body.priceCents !== undefined ? Number(body.priceCents) / 100 : Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Enter a valid price in dollars." }, { status: 400 });
    }
    data.priceCents = Math.round(price * 100);
  }
  if (body.priceIncludesTax !== undefined) data.priceIncludesTax = Boolean(body.priceIncludesTax);
  if (body.pricePerGramCents !== undefined) {
    if (body.pricePerGramCents === null || body.pricePerGramCents === "") data.pricePerGramCents = null;
    else {
      const n = Number(body.pricePerGramCents);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: "Enter a valid price per gram." }, { status: 400 });
      }
      data.pricePerGramCents = Math.round(n);
    }
  }
  if (body.pricePerGram !== undefined) {
    if (body.pricePerGram === null || body.pricePerGram === "") data.pricePerGramCents = null;
    else {
      const n = Number(body.pricePerGram);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: "Enter a valid price per gram." }, { status: 400 });
      }
      data.pricePerGramCents = Math.round(n * 100);
    }
  }
  if (body.verdict !== undefined) {
    const verdict = String(body.verdict);
    if (verdict !== "BUY" && verdict !== "DONT_BUY") {
      return NextResponse.json({ error: "Verdict must be BUY or DON'T BUY." }, { status: 400 });
    }
    data.verdict = verdict;
  }
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!REVIEW_STATUSES.includes(status as (typeof REVIEW_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = status;
  }
  if (body.harvestDate !== undefined) data.harvestDate = optionalString(body.harvestDate);
  if (body.expDate !== undefined) data.expDate = optionalString(body.expDate);
  if (body.topTerpene !== undefined) data.topTerpene = optionalString(body.topTerpene);
  if (body.thcPercent !== undefined) {
    if (body.thcPercent === null || body.thcPercent === "") data.thcPercent = null;
    else {
      const n = Number(body.thcPercent);
      if (!Number.isFinite(n)) return NextResponse.json({ error: "THC % must be a number." }, { status: 400 });
      data.thcPercent = n;
    }
  }
  if (body.thcaPercent !== undefined) {
    if (body.thcaPercent === null || body.thcaPercent === "") data.thcaPercent = null;
    else {
      const n = Number(body.thcaPercent);
      if (!Number.isFinite(n)) return NextResponse.json({ error: "THCa % must be a number." }, { status: 400 });
      data.thcaPercent = n;
    }
  }
  if (body.rating !== undefined) {
    const parsed = parseStarRating(body.rating === "" || body.rating === null ? null : body.rating);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    data.rating = parsed.halves;
  }
  if (body.createdAt !== undefined) {
    const createdAt = new Date(String(body.createdAt));
    if (Number.isNaN(createdAt.getTime())) {
      return NextResponse.json({ error: "Enter a valid purchase date." }, { status: 400 });
    }
    data.createdAt = createdAt;
  }
  if (body.storeName !== undefined || body.storeCity !== undefined || body.storeState !== undefined) {
    const name = String(body.storeName ?? review.store.name).trim();
    const city = String(body.storeCity ?? review.store.city).trim();
    const state = String(body.storeState ?? review.store.state).trim().toUpperCase();
    if (!name || !city || !state) {
      return NextResponse.json({ error: "Store name, city, and state are required." }, { status: 400 });
    }
    const store = await prisma.store.upsert({
      where: { name_city_state: { name, city, state } },
      update: {},
      create: { name, city, state },
    });
    data.storeId = store.id;
  }

  const updated = await prisma.review.update({ where: { id }, data });
  return NextResponse.json({ ok: true, review: { id: updated.id, status: updated.status } });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null);
  if (!requireConfirm(body)) {
    return NextResponse.json({ error: "Confirm the delete." }, { status: 400 });
  }
  const { id } = await context.params;
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });
  await deleteReviewAndFiles(id);
  return NextResponse.json({ ok: true });
}
