import { prisma } from "@/lib/prisma";
import { normalizeLineage } from "@/lib/product-lineage";

/** Lowercase, strip punctuation, collapse spaces. "Cap Junky" → "cap junky". */
export function normalizeStrainKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type ArchivedGenetics = {
  id: string;
  key: string;
  displayName: string;
  lineage: string;
};

/** Exact key first, then the longest archived name that appears as a whole phrase. */
export async function findArchivedGenetics(strainName: string): Promise<ArchivedGenetics | null> {
  const key = normalizeStrainKey(strainName);
  if (!key) return null;
  const exact = await prisma.strainGenetics.findUnique({ where: { key } });
  if (exact) {
    return { id: exact.id, key: exact.key, displayName: exact.displayName, lineage: exact.lineage };
  }
  const all = await prisma.strainGenetics.findMany({
    select: { id: true, key: true, displayName: true, lineage: true },
  });
  const matches = all.filter((row) => {
    if (row.key.length < 4) return false;
    const re = new RegExp(`(?:^| )${escapeRegExp(row.key)}(?: |$)`);
    return re.test(key);
  });
  matches.sort((a, b) => b.key.length - a.key.length);
  return matches[0] ?? null;
}

export async function archivedLineageFor(strainName: string): Promise<string | null> {
  const found = await findArchivedGenetics(strainName);
  return found?.lineage ?? null;
}

/**
 * Upsert the current lineage for a strain. If the value changes, the previous
 * row is copied into history first so earlier values are not lost.
 */
export async function upsertStrainGenetics(input: {
  strainName: string;
  lineage: string;
  userId?: string | null;
  sourceReviewId?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = normalizeLineage(input.lineage);
  if (!parsed.ok) return parsed;
  if (!parsed.lineage) return { ok: true };
  const key = normalizeStrainKey(input.strainName);
  if (!key) return { ok: false, error: "Strain name is required to archive genetics." };
  const displayName = input.strainName.trim();
  const existing = await prisma.strainGenetics.findUnique({ where: { key } });
  if (!existing) {
    await prisma.strainGenetics.create({
      data: {
        key,
        displayName,
        lineage: parsed.lineage,
        sourceReviewId: input.sourceReviewId ?? null,
        updatedById: input.userId ?? null,
      },
    });
    return { ok: true };
  }
  if (existing.lineage === parsed.lineage && existing.displayName === displayName) {
    return { ok: true };
  }
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
        lineage: parsed.lineage,
        displayName,
        sourceReviewId: input.sourceReviewId ?? existing.sourceReviewId,
        updatedById: input.userId ?? existing.updatedById,
      },
    }),
  ]);
  return { ok: true };
}

export const CAP_JUNKY_SEED = {
  displayName: "Cap Junky",
  lineage: "ALIEN COOKIES x KUSH MINTS #11",
};
