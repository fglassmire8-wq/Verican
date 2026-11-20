/**
 * Idempotent Product.batchId upkeep from visually confirmed label photos.
 * - Fills a real batch/lot code only when the product field is empty.
 * - Clears METRC package / state tracking IDs (values starting with 1A4…).
 * - Never writes a 1A4 value. Does not write onto Review rows.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rows = JSON.parse(readFileSync(path.join(root, "scripts/data/batch-ids.json"), "utf8"));
const prisma = new PrismaClient();

function normalize(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function looksLikeMetrcPackageId(value) {
  const key = String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
  return /^1A4[A-Z0-9]{12,}$/.test(key);
}

async function main() {
  let cleared = 0;
  const metrc = await prisma.product.findMany({
    select: { id: true, slug: true, batchId: true },
  });
  for (const product of metrc) {
    if (!looksLikeMetrcPackageId(product.batchId)) continue;
    await prisma.product.update({
      where: { id: product.id },
      data: { batchId: null },
    });
    cleared += 1;
    console.log(`batch-id cleared METRC: ${product.slug}`);
  }

  let filled = 0;
  let skipped = 0;
  let missing = 0;
  for (const row of rows) {
    const slug = String(row.slug || "").trim();
    const batchId = normalize(row.batchId);
    if (!slug || !batchId) continue;
    if (looksLikeMetrcPackageId(batchId)) {
      console.log(`batch-id skip (METRC in catalog file): ${slug}`);
      continue;
    }
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, batchId: true },
    });
    if (!product) {
      missing += 1;
      console.log(`batch-id skip (no product): ${slug}`);
      continue;
    }
    if (product.batchId) {
      skipped += 1;
      continue;
    }
    await prisma.product.update({
      where: { id: product.id },
      data: { batchId },
    });
    filled += 1;
    console.log(`batch-id filled: ${slug} = ${batchId}`);
  }
  console.log(
    `batch-id apply done: cleared-metrc=${cleared} filled=${filled} already-set=${skipped} missing=${missing}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
