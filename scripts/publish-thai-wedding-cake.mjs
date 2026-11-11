/**
 * Idempotent publish of Francis's approved Miss Grass Thai Wedding Cake review.
 * Safe on every boot. Never changes other reviews. Updates this review to the
 * approved spec, including the 4.0 reviewer rating he gave for this one.
 */
import { PrismaClient } from "@prisma/client";

const NOTES = `It's exactly what the description says. It's wedding cake with a little bit of Thai in it. You can clearly see the Thai coming out of it with the longer leaves and the longer red hairs and the more cushy appearance. Overall, Miss Grass always puts out some good weed. I really like this. I would buy this again, and I'm actually gonna look for other products from Miss Grass.

Note: They grow in the same building as Garden Green, but they are not grown by Garden Green from what I understand.`;

const PHOTOS = [
  { file: "01-front-of-bag.jpg", alt: "Front of the bag" },
  { file: "02-back-label.jpg", alt: "Back label with test results" },
  { file: "03-bud-between-fingers.jpg", alt: "Bud between the fingers" },
  { file: "04-bud-up-close.jpg", alt: "Bud up close" },
  { file: "05-whole-bag-of-buds.jpg", alt: "The whole bag of buds" },
  { file: "06-bud-on-thumb.jpg", alt: "Bud on the thumb" },
];

const PURCHASED_AT = new Date("2026-11-09T12:00:00-05:00");

const prisma = new PrismaClient();

try {
  const francis = await prisma.user.findUnique({
    where: { email: "frankg2152@icloud.com" },
  });
  if (!francis) {
    throw new Error("Owner account frankg2152@icloud.com not found; skip is not allowed.");
  }

  const brand = await prisma.brand.upsert({
    where: { name: "Miss Grass" },
    update: {
      legalName: "Packaged by Garden Greens, LLC",
      license: "C000017-LIC",
      location: "Vineland, NJ",
    },
    create: {
      name: "Miss Grass",
      legalName: "Packaged by Garden Greens, LLC",
      license: "C000017-LIC",
      location: "Vineland, NJ",
    },
  });

  const store = await prisma.store.upsert({
    where: {
      name_city_state: {
        name: "Eastern Green Dispensary",
        city: "Voorhees",
        state: "NJ",
      },
    },
    update: {},
    create: {
      name: "Eastern Green Dispensary",
      city: "Voorhees",
      state: "NJ",
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: "thai-wedding-cake" },
    update: {
      strain: "Thai Wedding Cake",
      brandId: brand.id,
      category: "FLOWER",
    },
    create: {
      slug: "thai-wedding-cake",
      strain: "Thai Wedding Cake",
      brandId: brand.id,
      category: "FLOWER",
    },
  });

  const existing = await prisma.review.findFirst({
    where: { userId: francis.id, productId: product.id },
    orderBy: { createdAt: "asc" },
  });

  const data = {
    productId: product.id,
    userId: francis.id,
    storeId: store.id,
    amount: "14g indoor smalls · Balanced Hybrid",
    priceCents: 7300,
    currency: "USD",
    priceIncludesTax: true,
    pricePerGramCents: null,
    notes: NOTES,
    verdict: "BUY",
    harvestDate: "10/19/26",
    expDate: "04/19/27",
    thcPercent: 28.85,
    thcaPercent: 32.66,
    topTerpene:
      "total cannabinoids 34.55%; total terpenes 2.5%; myrcene 1.02%, limonene 0.56%, caryophyllene 0.29%, linalool 0.29%",
    status: "APPROVED",
    rating: 8,
  };

  const review = existing
    ? await prisma.review.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.review.create({
        data: {
          ...data,
          createdAt: PURCHASED_AT,
        },
      });

  await prisma.photo.deleteMany({ where: { reviewId: review.id } });
  await prisma.photo.createMany({
    data: PHOTOS.map((photo, i) => ({
      reviewId: review.id,
      path: `/uploads/thai-wedding-cake/${photo.file}`,
      alt: photo.alt,
      sortOrder: i,
    })),
  });

  console.error(
    `Published Thai Wedding Cake review ${review.id} (slug thai-wedding-cake, ${PHOTOS.length} photos, reviewer rating 4.0).`,
  );
} finally {
  await prisma.$disconnect();
}
