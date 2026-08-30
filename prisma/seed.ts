import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SEED_OWNER_PASSWORD;
  if (!password) {
    throw new Error("SEED_OWNER_PASSWORD is required to seed the owner account.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const francis = await prisma.user.upsert({
    where: { email: "frankg2152@icloud.com" },
    update: {
      passwordHash,
      name: "Francis",
      role: "OWNER",
      affiliateStatus: "VERIFIED",
    },
    create: {
      email: "frankg2152@icloud.com",
      passwordHash,
      name: "Francis",
      role: "OWNER",
      affiliateStatus: "VERIFIED",
    },
  });

  const brand = await prisma.brand.upsert({
    where: { name: "Illicit Gardens" },
    update: {
      legalName: "Illicit Gardens NJ, LLC",
      license: "C0000329",
      location: "Lafayette, NJ",
    },
    create: {
      name: "Illicit Gardens",
      legalName: "Illicit Gardens NJ, LLC",
      license: "C0000329",
      location: "Lafayette, NJ",
    },
  });

  const store = await prisma.store.upsert({
    where: {
      name_city_state: {
        name: "Cottonmouth",
        city: "Runnemede",
        state: "NJ",
      },
    },
    update: {},
    create: {
      name: "Cottonmouth",
      city: "Runnemede",
      state: "NJ",
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: "max-ac" },
    update: {
      strain: "MAX A/C",
      brandId: brand.id,
      category: "FLOWER",
    },
    create: {
      slug: "max-ac",
      strain: "MAX A/C",
      brandId: brand.id,
      category: "FLOWER",
    },
  });

  const existing = await prisma.review.findFirst({
    where: { userId: francis.id, productId: product.id },
  });

  const notes =
    "Extremely frosty trichomes. Smells like Gatorade and cookies. Extremely sticky. Smoked. Very worth the purchase. Might be the best hybrid of the year.";

  const review =
    existing ??
    (await prisma.review.create({
      data: {
        productId: product.id,
        userId: francis.id,
        storeId: store.id,
        amount: "28g (1 oz)",
        priceCents: 15000,
        currency: "USD",
        notes,
        verdict: "BUY",
        harvestDate: "07/17/24",
        expDate: "01/17/25",
        thcPercent: 28.29,
        thcaPercent: 31.95,
        topTerpene: "trans-caryophyllene 0.79%",
        status: "APPROVED",
      },
    }));

  if (existing) {
    await prisma.review.update({
      where: { id: existing.id },
      data: {
        storeId: store.id,
        amount: "28g (1 oz)",
        priceCents: 15000,
        notes,
        verdict: "BUY",
        harvestDate: "07/17/24",
        expDate: "01/17/25",
        thcPercent: 28.29,
        thcaPercent: 31.95,
        topTerpene: "trans-caryophyllene 0.79%",
        status: "APPROVED",
      },
    });
  }

  await prisma.photo.deleteMany({ where: { reviewId: review.id } });

  await prisma.photo.createMany({
    data: [
      {
        reviewId: review.id,
        path: "/uploads/max-ac/jar.jpg",
        alt: "Illicit MAX AC Hybrid 28g jar",
        sortOrder: 0,
      },
      {
        reviewId: review.id,
        path: "/uploads/max-ac/label.jpg",
        alt: "MAX AC lab label: harvest 07/17/24, total THC 28.29%, THCa 31.95%",
        sortOrder: 1,
      },
      {
        reviewId: review.id,
        path: "/uploads/max-ac/nugs-in-jar.jpg",
        alt: "MAX AC nugs in the jar, heavy frost",
        sortOrder: 2,
      },
      {
        reviewId: review.id,
        path: "/uploads/max-ac/nug-in-palm.jpg",
        alt: "MAX AC nug in palm",
        sortOrder: 3,
      },
      {
        reviewId: review.id,
        path: "/uploads/max-ac/finger-macro.jpg",
        alt: "MAX AC finger-macro of a frosty nug",
        sortOrder: 4,
      },
      {
        reviewId: review.id,
        path: "/uploads/max-ac/nug-macro.jpg",
        alt: "MAX AC close-up macro of the flower",
        sortOrder: 5,
      },
    ],
  });

  await prisma.rewardRule.upsert({
    where: { key: "likes_toward_rank" },
    update: {
      label: "Approved likes on verified-affiliate reviews drive rank",
      config: JSON.stringify({ likesTowardRank: true }),
    },
    create: {
      key: "likes_toward_rank",
      label: "Approved likes on verified-affiliate reviews drive rank",
      config: JSON.stringify({ likesTowardRank: true }),
    },
  });

  await prisma.rewardRule.upsert({
    where: { key: "brand_funded_discounts" },
    update: {
      label: "Brand-funded discounts are configured later",
      config: JSON.stringify({
        enabled: false,
        note: "Brands negotiate discounts later. No dollar amount is promised.",
      }),
    },
    create: {
      key: "brand_funded_discounts",
      label: "Brand-funded discounts are configured later",
      config: JSON.stringify({
        enabled: false,
        note: "Brands negotiate discounts later. No dollar amount is promised.",
      }),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
