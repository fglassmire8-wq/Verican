import { NextRequest, NextResponse } from "next/server";
import { requireConfirm, requireFounderApi } from "@/lib/admin-auth";
import { deleteReviewAndFiles } from "@/lib/admin-reviews";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    data.name = name;
  }
  if (body.legalName !== undefined) data.legalName = String(body.legalName).trim() || null;
  if (body.license !== undefined) data.license = String(body.license).trim() || null;
  if (body.location !== undefined) data.location = String(body.location).trim() || null;
  const updated = await prisma.brand.update({ where: { id }, data });
  return NextResponse.json({ ok: true, brand: { id: updated.id, name: updated.name } });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as { confirm?: unknown; cascade?: unknown } | null;
  if (!requireConfirm(body)) {
    return NextResponse.json({ error: "Confirm the delete." }, { status: 400 });
  }
  const { id } = await context.params;
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: { products: { include: { reviews: { select: { id: true } } } } },
  });
  if (!brand) return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  const reviewCount = brand.products.reduce((sum, product) => sum + product.reviews.length, 0);
  if ((brand.products.length || reviewCount) && !body?.cascade) {
    return NextResponse.json(
      {
        error: "This brand has products or reviews. Confirm again and choose to delete them too.",
        productCount: brand.products.length,
        reviewCount,
      },
      { status: 409 },
    );
  }
  if (body?.cascade) {
    for (const product of brand.products) {
      for (const review of product.reviews) {
        await deleteReviewAndFiles(review.id);
      }
      await prisma.product.delete({ where: { id: product.id } });
    }
  }
  await prisma.brand.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
