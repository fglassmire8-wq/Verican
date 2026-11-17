import { NextRequest, NextResponse } from "next/server";
import { requireFounderApi } from "@/lib/admin-auth";
import { optimizeImageForWeb } from "@/lib/optimize-image";
import { prisma } from "@/lib/prisma";
import { writeReviewPhoto } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: { photos: true, product: true },
  });
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  const form = await request.formData();
  const files = form
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0);
  if (!files.length) {
    return NextResponse.json({ error: "Choose at least one photo." }, { status: 400 });
  }

  const start = review.photos.reduce((max, photo) => Math.max(max, photo.sortOrder), -1) + 1;
  const created = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const raw = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeImageForWeb(raw);
    const filename = `${Date.now()}-${String(start + i).padStart(2, "0")}.${optimized.ext}`;
    const photoPath = await writeReviewPhoto(review.id, filename, optimized.bytes);
    const photo = await prisma.photo.create({
      data: {
        reviewId: review.id,
        path: photoPath,
        alt: `${review.product.strain} photo ${start + i + 1}`,
        sortOrder: start + i,
      },
    });
    created.push({ id: photo.id, path: photo.path, sortOrder: photo.sortOrder });
  }
  return NextResponse.json({ ok: true, photos: created });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as { coverId?: unknown; order?: unknown } | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });

  let ids: string[] | null = null;
  if (Array.isArray(body.order)) {
    ids = body.order.map((value) => String(value));
  } else if (body.coverId) {
    const coverId = String(body.coverId);
    ids = [coverId, ...review.photos.map((photo) => photo.id).filter((photoId) => photoId !== coverId)];
  }
  if (!ids) return NextResponse.json({ error: "Provide order or coverId." }, { status: 400 });

  const current = new Set(review.photos.map((photo) => photo.id));
  if (ids.length !== current.size || ids.some((photoId) => !current.has(photoId))) {
    return NextResponse.json({ error: "Order must include every photo once." }, { status: 400 });
  }
  await prisma.$transaction(
    ids.map((photoId, index) => prisma.photo.update({ where: { id: photoId }, data: { sortOrder: index } })),
  );
  return NextResponse.json({ ok: true });
}
