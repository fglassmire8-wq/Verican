import { NextRequest, NextResponse } from "next/server";
import { requireConfirm, requireFounderApi } from "@/lib/admin-auth";
import { deleteReviewAndFiles } from "@/lib/admin-reviews";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  const name = body.name !== undefined ? String(body.name).trim() : store.name;
  const city = body.city !== undefined ? String(body.city).trim() : store.city;
  const state = body.state !== undefined ? String(body.state).trim().toUpperCase() : store.state;
  if (!name || !city || !state) {
    return NextResponse.json({ error: "Name, city, and state are required." }, { status: 400 });
  }
  const clash = await prisma.store.findUnique({
    where: { name_city_state: { name, city, state } },
  });
  if (clash && clash.id !== id) {
    return NextResponse.json({ error: "A store with that name, city, and state already exists." }, { status: 409 });
  }
  const updated = await prisma.store.update({ where: { id }, data: { name, city, state } });
  return NextResponse.json({ ok: true, store: updated });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as { confirm?: unknown; cascade?: unknown } | null;
  if (!requireConfirm(body)) {
    return NextResponse.json({ error: "Confirm the delete." }, { status: 400 });
  }
  const { id } = await context.params;
  const store = await prisma.store.findUnique({
    where: { id },
    include: { reviews: { select: { id: true } } },
  });
  if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  if (store.reviews.length && !body?.cascade) {
    return NextResponse.json(
      {
        error: "This store has reviews. Confirm again and choose to delete them too.",
        reviewCount: store.reviews.length,
      },
      { status: 409 },
    );
  }
  if (body?.cascade) {
    for (const review of store.reviews) {
      await deleteReviewAndFiles(review.id);
    }
  }
  await prisma.store.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
