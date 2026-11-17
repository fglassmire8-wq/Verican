/**
 * Idempotent publish of Francis-approved Nov 15 photo-only product pages.
 * Safe on every boot. Creates a product + photo-only review only when that
 * slug has never been published (PublishLock). Does not overwrite later
 * founder edits, photo deletes, or existing review pages.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(path.join(root, "scripts/data/nov15-catalog.json"), "utf8"));
const prisma = new PrismaClient();

const UNBRANDED = "";
const CAP_JUNKY_KEY = "cap junky";
const CAP_JUNKY_LINEAGE = "ALIEN COOKIES x KUSH MINTS #11";

function normalizeStrainKey(name) {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function archiveMatches(strainName, key) {
  const hay = normalizeStrainKey(strainName);
  if (!hay || !key) return false;
  if (hay === key) return true;
  if (key.length < 4) return false;
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^| )${escaped}(?: |$)`).test(hay);
}

async function seedCapJunky(userId) {
  const existing = await prisma.strainGenetics.findUnique({ where: { key: CAP_JUNKY_KEY } });
  if (existing) return existing;
  return prisma.strainGenetics.create({
    data: {
      key: CAP_JUNKY_KEY,
      displayName: "Cap Junky",
      lineage: CAP_JUNKY_LINEAGE,
      updatedById: userId ?? null,
    },
  });
}

async function upsertArchive({ strainName, lineage, userId, sourceReviewId }) {
  const text = String(lineage || "").trim();
  if (!text) return;
  const key = normalizeStrainKey(strainName);
  if (!key) return;
  const existing = await prisma.strainGenetics.findUnique({ where: { key } });
  if (!existing) {
    await prisma.strainGenetics.create({
      data: {
        key,
        displayName: strainName.trim(),
        lineage: text,
        sourceReviewId: sourceReviewId ?? null,
        updatedById: userId ?? null,
      },
    });
    return;
  }
  if (existing.lineage === text) return;
  await prisma.$transaction([
    prisma.strainGeneticsHistory.create({
      data: {
        geneticsId: existing.id,
        lineage: existing.lineage,
        displayName: existing.displayName,
        sourceReviewId: existing.sourceReviewId,
        addedById: existing.updatedById,
        addedAt: existing.updatedAt,
      },
    }),
    prisma.strainGenetics.update({
      where: { id: existing.id },
      data: {
        lineage: text,
        displayName: strainName.trim() || existing.displayName,
        sourceReviewId: sourceReviewId ?? existing.sourceReviewId,
        updatedById: userId ?? existing.updatedById,
      },
    }),
  ]);
}

try {
  const francis = await prisma.user.findUnique({
    where: { email: "frankg2152@icloud.com" },
  });
  if (!francis) {
    throw new Error("Owner account frankg2152@icloud.com not found; skip is not allowed.");
  }

  await seedCapJunky(francis.id);
  const archive = await prisma.strainGenetics.findMany();

  let created = 0;
  let skipped = 0;

  for (const item of catalog) {
    const brand = await prisma.brand.upsert({
      where: { name: item.brand || UNBRANDED },
      update: {},
      create: {
        name: item.brand || UNBRANDED,
        legalName: item.legalName || null,
      },
    });

    const archived = archive
      .filter((row) => archiveMatches(item.strain, row.key))
      .sort((a, b) => b.key.length - a.key.length)[0] ?? null;
    const initialLineage = item.lineage_from_label || archived?.lineage || null;

    let product = await prisma.product.findUnique({ where: { slug: item.slug } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          slug: item.slug,
          strain: item.strain,
          brandId: brand.id,
          category: item.category,
          lineage: initialLineage,
        },
      });
    } else if (!product.lineage && initialLineage) {
      product = await prisma.product.update({
        where: { id: product.id },
        data: { lineage: initialLineage },
      });
    }

    if (initialLineage) {
      await upsertArchive({
        strainName: item.lineage_from_label ? item.strain : archived?.displayName || item.strain,
        lineage: initialLineage,
        userId: francis.id,
      });
    }

    const lockKey = `nov15:${item.slug}`;
    const lock = await prisma.publishLock.findUnique({ where: { key: lockKey } });
    if (lock) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.review.findFirst({
      where: { userId: francis.id, productId: product.id, photoOnly: true },
      orderBy: { createdAt: "asc" },
    });
    if (existing) {
      await prisma.publishLock.create({ data: { key: lockKey, reviewId: existing.id } });
      skipped += 1;
      continue;
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: francis.id,
        storeId: null,
        amount: item.size || "",
        priceCents: 0,
        currency: "USD",
        notes: "",
        verdict: "",
        status: "APPROVED",
        photoOnly: true,
        rating: null,
      },
    });

    await prisma.photo.createMany({
      data: item.photos.map((file, i) => ({
        reviewId: review.id,
        path: `/uploads/${item.slug}/${String(i + 1).padStart(2, "0")}.jpg`,
        alt: `${item.strain} photo ${i + 1}`,
        sortOrder: i,
      })),
    });

    if (initialLineage) {
      await upsertArchive({
        strainName: item.lineage_from_label ? item.strain : archived?.displayName || item.strain,
        lineage: initialLineage,
        userId: francis.id,
        sourceReviewId: review.id,
      });
    }

    await prisma.publishLock.create({ data: { key: lockKey, reviewId: review.id } });
    created += 1;
    console.error(`Published ${item.slug} (${item.photos.length} photos)`);
  }

  console.error(`Nov 15 photos: created ${created}, already published ${skipped}, catalog ${catalog.length}.`);
} finally {
  await prisma.$disconnect();
}
