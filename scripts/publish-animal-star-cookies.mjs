/**
 * Idempotent publish of Francis's approved Animal Star Cookies review.
 * Safe to run on every boot: creates the review and photos only if they have
 * never been published (PublishLock). Does not overwrite later founder edits
 * or recreate a review the founder deleted.
 */
import { PrismaClient } from "@prisma/client";

const NOTES =
  "If you're an Animal Cookies fan, this is a good buy. It doesn't have outstanding trichome coverage, but it's good enough for an Animal Cookies cross. You can see a lot of the Stardog properties in this weed, which is a good breath of relief if you're used to smoking this kind of weed. If you see this for a good price, I would buy it anytime.";

const PHOTOS = [
  { file: "01-front-label.jpg", alt: "Front label" },
  { file: "02-back-label.jpg", alt: "Back label with test results" },
  { file: "03-open-jar.jpg", alt: "Open jar" },
  { file: "04-jar-from-above.jpg", alt: "Jar in hand, from above" },
  { file: "05-four-buds-in-hand.jpg", alt: "Four buds in hand" },
  { file: "06-bud-on-palm.jpg", alt: "Bud on the palm, up close" },
  { file: "07-bud-between-fingers.jpg", alt: "Bud between the fingers" },
  { file: "08-bud-on-thumb.jpg", alt: "Bud on the thumb" },
  { file: "09-buds-in-jar.jpg", alt: "Buds in the jar, up close" },
  { file: "10-bud-up-close-by-the-window.jpg", alt: "Bud up close by the window" },
  { file: "11-bud-between-the-fingers-daylight.jpg", alt: "Bud between the fingers, daylight" },
  { file: "12-bud-on-the-thumb-daylight.jpg", alt: "Bud on the thumb, daylight" },
];

const PURCHASED_AT = new Date("2026-11-10T12:00:00-05:00");

const prisma = new PrismaClient();

try {
  const francis = await prisma.user.findUnique({
    where: { email: "frankg2152@icloud.com" },
  });
  if (!francis) {
    throw new Error("Owner account frankg2152@icloud.com not found; skip is not allowed.");
  }

  const brand = await prisma.brand.upsert({
    where: { name: "Illicit Gardens" },
    update: {},
    create: {
      name: "Illicit Gardens",
      legalName: "Illicit Gardens NJ, LLC",
      license: "C0000329",
      location: "Lafayette, NJ",
    },
  });

  // Single confirmed NJ store: 500 N Black Horse Pike, Mount Ephraim, NJ
  // (brotherlybud.com, NJ CRC Class 5 license RE000229).
  const store = await prisma.store.upsert({
    where: {
      name_city_state: {
        name: "Brotherly Bud",
        city: "Mount Ephraim",
        state: "NJ",
      },
    },
    update: {},
    create: {
      name: "Brotherly Bud",
      city: "Mount Ephraim",
      state: "NJ",
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: "animal-star-cookies" },
    update: {},
    create: {
      slug: "animal-star-cookies",
      strain: "Animal Star Cookies",
      brandId: brand.id,
      category: "FLOWER",
    },
  });

  const lockKey = "animal-star-cookies";
  const lock = await prisma.publishLock.findUnique({ where: { key: lockKey } });
  if (lock) {
    console.error(
      `Animal Star Cookies already published (lock ${lockKey}); leaving review unchanged.`,
    );
  } else {
    const existing = await prisma.review.findFirst({
      where: { userId: francis.id, productId: product.id },
      orderBy: { createdAt: "asc" },
    });
    if (existing) {
      await prisma.publishLock.create({
        data: { key: lockKey, reviewId: existing.id },
      });
      console.error(
        `Animal Star Cookies review already exists (${existing.id}); recorded lock and left it unchanged.`,
      );
    } else {
      const review = await prisma.review.create({
        data: {
          productId: product.id,
          userId: francis.id,
          storeId: store.id,
          amount: "28g",
          priceCents: 13000,
          priceIncludesTax: false,
          pricePerGramCents: 464,
          currency: "USD",
          notes: NOTES,
          verdict: "BUY",
          harvestDate: "08/09/26",
          expDate: "08/09/27",
          thcPercent: 28.55,
          thcaPercent: 33.1,
          topTerpene:
            "limonene 0.53%, trans-caryophyllene 0.51%, myrcene 0.42%, humulene 0.21%",
          status: "APPROVED",
          createdAt: PURCHASED_AT,
        },
      });
      await prisma.photo.createMany({
        data: PHOTOS.map((photo, i) => ({
          reviewId: review.id,
          path: `/uploads/animal-star-cookies/${photo.file}`,
          alt: photo.alt,
          sortOrder: i,
        })),
      });
      await prisma.publishLock.create({
        data: { key: lockKey, reviewId: review.id },
      });
      console.error(
        `Published Animal Star Cookies review ${review.id} (slug animal-star-cookies, ${PHOTOS.length} photos).`,
      );
    }
  }
} finally {
  await prisma.$disconnect();
}
