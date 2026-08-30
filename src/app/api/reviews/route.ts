import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isTrustedAffiliate, slugify } from "@/lib/utils";

const MAX_PHOTOS = 8;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

function extFor(type: string, filename: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  const fromName = filename.split(".").pop()?.toLowerCase();
  if (fromName === "png" || fromName === "webp" || fromName === "jpg" || fromName === "jpeg") {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  return "jpg";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const form = await request.formData();
  const strain = String(form.get("strain") || "").trim();
  const brandName = String(form.get("brand") || "").trim();
  const storeName = String(form.get("store") || "").trim();
  const storeCity = String(form.get("storeCity") || "").trim();
  const storeState = String(form.get("storeState") || "NJ").trim().toUpperCase();
  const amount = String(form.get("amount") || "").trim();
  const priceRaw = String(form.get("price") || "").trim();
  const notes = String(form.get("notes") || "").trim();
  const verdict = String(form.get("verdict") || "").trim();
  const harvestDate = String(form.get("harvestDate") || "").trim() || null;
  const expDate = String(form.get("expDate") || "").trim() || null;
  const thcRaw = String(form.get("thcPercent") || "").trim();
  const thcaRaw = String(form.get("thcaPercent") || "").trim();
  const topTerpene = String(form.get("topTerpene") || "").trim() || null;

  if (!strain || !brandName || !storeName || !storeCity || !amount || !notes) {
    return NextResponse.json({ error: "Strain, brand, store, city, amount, and notes are required." }, { status: 400 });
  }
  if (verdict !== "BUY" && verdict !== "DONT_BUY") {
    return NextResponse.json({ error: "Verdict must be BUY or DON'T BUY." }, { status: 400 });
  }

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Enter a valid price in dollars." }, { status: 400 });
  }
  const priceCents = Math.round(price * 100);

  const thcPercent = thcRaw ? Number(thcRaw) : null;
  const thcaPercent = thcaRaw ? Number(thcaRaw) : null;
  if (thcRaw && !Number.isFinite(thcPercent)) {
    return NextResponse.json({ error: "THC % must be a number." }, { status: 400 });
  }
  if (thcaRaw && !Number.isFinite(thcaPercent)) {
    return NextResponse.json({ error: "THCa % must be a number." }, { status: 400 });
  }

  const files = form
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (files.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `Up to ${MAX_PHOTOS} photos.` }, { status: 400 });
  }
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Each photo must be 10MB or smaller." }, { status: 400 });
    }
    if (file.type && !ALLOWED.has(file.type) && file.type !== "application/octet-stream") {
      return NextResponse.json({ error: "Photos must be JPEG, PNG, or WebP." }, { status: 400 });
    }
  }

  const brand = await prisma.brand.upsert({
    where: { name: brandName },
    update: {},
    create: { name: brandName },
  });

  const store = await prisma.store.upsert({
    where: {
      name_city_state: { name: storeName, city: storeCity, state: storeState },
    },
    update: {},
    create: { name: storeName, city: storeCity, state: storeState },
  });

  const slugBase = slugify(`${strain} ${brandName}`) || "review";
  let product = await prisma.product.findUnique({
    where: { strain_brandId: { strain, brandId: brand.id } },
  });
  if (!product) {
    let slug = slugBase;
    let n = 2;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${n++}`;
    }
    product = await prisma.product.create({
      data: { slug, strain, brandId: brand.id, category: "FLOWER" },
    });
  }

  // Owner reviews publish immediately as trusted.
  // Members (and pending/rejected affiliates) publish immediately as unverified notes.
  // Verified affiliates stay pending until the owner approves.
  const trusted = isTrustedAffiliate(user);
  const status = user.role === "OWNER" || !trusted ? "APPROVED" : "PENDING";
  const review = await prisma.review.create({
    data: {
      productId: product.id,
      userId: user.id,
      storeId: store.id,
      amount,
      priceCents,
      currency: "USD",
      notes,
      verdict,
      harvestDate,
      expDate,
      thcPercent,
      thcaPercent,
      topTerpene,
      status,
    },
  });

  if (files.length) {
    const dir = path.join(process.cwd(), "public", "uploads", review.id);
    await mkdir(dir, { recursive: true });
    const photos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = extFor(file.type, file.name);
      const filename = `${String(i + 1).padStart(2, "0")}.${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, filename), buf);
      photos.push({
        reviewId: review.id,
        path: `/uploads/${review.id}/${filename}`,
        alt: `${strain} photo ${i + 1}`,
        sortOrder: i,
      });
    }
    await prisma.photo.createMany({ data: photos });
  }

  return NextResponse.json({
    ok: true,
    slug: product.slug,
    status: review.status,
    trusted,
  });
}
