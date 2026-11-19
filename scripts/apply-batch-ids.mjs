/**
 * Idempotent fill of Product.batchId from visually confirmed label photos.
 * Sets a value only when the product exists and batchId is currently empty.
 * Never overwrites a founder-set value. Does not write onto Review rows.
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

async function main() {
  let filled = 0;
  let skipped = 0;
  let missing = 0;
  for (const row of rows) {
    const slug = String(row.slug || "").trim();
    const batchId = normalize(row.batchId);
    if (!slug || !batchId) continue;
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
  console.log(`batch-id apply done: filled=${filled} already-set=${skipped} missing=${missing}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
