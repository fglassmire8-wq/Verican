import { prisma } from "@/lib/prisma";

export const BATCH_ID_MAX_LENGTH = 80;

export type NormalizeBatchIdResult =
  | { ok: true; batchId: string | null }
  | { ok: false; error: string };

export function normalizeBatchId(value: unknown): NormalizeBatchIdResult {
  if (value == null) return { ok: true, batchId: null };
  const text = String(value).trim();
  if (!text) return { ok: true, batchId: null };
  if (text.length > BATCH_ID_MAX_LENGTH) {
    return { ok: false, error: `Batch ID must be ${BATCH_ID_MAX_LENGTH} characters or fewer.` };
  }
  return { ok: true, batchId: text };
}

export function batchIdKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const key = value.trim().replace(/\s+/g, "").toUpperCase();
  return key || null;
}

/** Copy a reviewer-submitted batch ID onto the product only when the product has none. */
export async function applySubmittedBatchId(productId: string, submitted: string | null | undefined) {
  const parsed = normalizeBatchId(submitted);
  if (!parsed.ok || !parsed.batchId) return;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { batchId: true },
  });
  if (!product || product.batchId) return;
  await prisma.product.update({
    where: { id: productId },
    data: { batchId: parsed.batchId },
  });
}
