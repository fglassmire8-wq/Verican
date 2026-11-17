import { NextRequest, NextResponse } from "next/server";
import { requireConfirm, requireFounderApi } from "@/lib/admin-auth";
import { deleteReviewAndFiles } from "@/lib/admin-reviews";
import { prisma } from "@/lib/prisma";
import { parseCategory } from "@/lib/categories";
import { normalizeLineage } from "@/lib/product-lineage";
import { upsertStrainGenetics } from "@/lib/strain-genetics";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (body.strain !== undefined) {
    const strain = String(body.strain).trim();
    if (!strain) return NextResponse.json({ error: "Strain is required." }, { status: 400 });
    data.strain = strain;
  }
  if (body.category !== undefined) {
    const category = parseCategory(body.category);
    if (!category) return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
    data.category = category.value;
  }
  if (body.slug !== undefined) {
    const slug = slugify(String(body.slug)) || slugify(String(body.strain ?? product.strain));
    if (!slug) return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    const clash = await prisma.product.findUnique({ where: { slug } });
    if (clash && clash.id !== id) {
      return NextResponse.json({ error: "That slug is already in use." }, { status: 409 });
    }
    data.slug = slug;
  }
  if (body.brandName !== undefined) {
    const name = String(body.brandName).trim();
    const brand = await prisma.brand.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    data.brandId = brand.id;
  } else if (body.brandId !== undefined) {
    const brand = await prisma.brand.findUnique({ where: { id: String(body.brandId) } });
    if (!brand) return NextResponse.json({ error: "Brand not found." }, { status: 404 });
    data.brandId = brand.id;
  }
  if (body.lineage !== undefined) {
    const lineage = normalizeLineage(body.lineage);
    if (!lineage.ok) return NextResponse.json({ error: lineage.error }, { status: 400 });
    data.lineage = lineage.lineage;
  }
  let updated;
  try {
    updated = await prisma.product.update({ where: { id }, data });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "A product with that strain and brand already exists." }, { status: 409 });
    }
    throw error;
  }
  if (data.lineage) {
    const archived = await upsertStrainGenetics({
      strainName: String(updated.strain),
      lineage: String(data.lineage),
      userId: auth.user?.id,
    });
    if (!archived.ok) return NextResponse.json({ error: archived.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, product: { id: updated.id, slug: updated.slug } });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => null)) as { confirm?: unknown; cascade?: unknown } | null;
  if (!requireConfirm(body)) {
    return NextResponse.json({ error: "Confirm the delete." }, { status: 400 });
  }
  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { reviews: { select: { id: true } } },
  });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  if (product.reviews.length && !body?.cascade) {
    return NextResponse.json(
      {
        error: "This product has reviews. Confirm again and choose to delete them too.",
        reviewCount: product.reviews.length,
      },
      { status: 409 },
    );
  }
  if (body?.cascade) {
    for (const review of product.reviews) {
      await deleteReviewAndFiles(review.id);
    }
  }
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
