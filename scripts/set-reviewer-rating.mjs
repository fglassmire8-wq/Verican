#!/usr/bin/env node
/**
 * Set or clear the optional reviewer rating on an existing review.
 *
 * Usage:
 *   node scripts/set-reviewer-rating.mjs --slug max-ac --rating 4.5
 *   node scripts/set-reviewer-rating.mjs --id <reviewId> --rating 4.5
 *   node scripts/set-reviewer-rating.mjs --slug max-ac --rating none
 *
 * Uses DATABASE_URL from the environment. Does not change any other review fields.
 */
import { PrismaClient } from "@prisma/client";

const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const slug = get("--slug");
const id = get("--id");
const ratingArg = get("--rating");

if ((!slug && !id) || ratingArg == null) {
  console.error(
    "Usage: node scripts/set-reviewer-rating.mjs (--slug <product-slug> | --id <reviewId>) --rating <0.5-5.0|none>",
  );
  process.exit(1);
}

let halves = null;
if (ratingArg !== "none" && ratingArg !== "") {
  const n = Number(ratingArg);
  const rounded = Math.round(n * 2);
  if (!Number.isFinite(n) || Math.abs(n * 2 - rounded) > 1e-6 || rounded < 1 || rounded > 10) {
    console.error("Rating must be 0.5 to 5.0 in half-point steps, or 'none'.");
    process.exit(1);
  }
  halves = rounded;
}

const prisma = new PrismaClient();

try {
  const review = id
    ? await prisma.review.findUnique({
        where: { id },
        include: { product: { include: { brand: true } } },
      })
    : await prisma.review.findFirst({
        where: { product: { slug } },
        include: { product: { include: { brand: true } } },
        orderBy: { createdAt: "asc" },
      });

  if (!review) {
    console.error("Review not found.");
    process.exit(1);
  }

  const updated = await prisma.review.update({
    where: { id: review.id },
    data: { rating: halves },
  });

  const label = updated.rating != null ? `${updated.rating / 2} / 5` : "none";
  console.log(
    `Set reviewer rating on ${review.product.strain} (${review.product.brand.name}) [${review.id}] to ${label}.`,
  );
} finally {
  await prisma.$disconnect();
}
