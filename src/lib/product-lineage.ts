/** Optional parent-strain text entered by the founder. Manual input only. */
export const LINEAGE_MAX_LENGTH = 300;

export type NormalizeLineageResult =
  | { ok: true; lineage: string | null }
  | { ok: false; error: string };

export function normalizeLineage(value: unknown): NormalizeLineageResult {
  if (value == null) return { ok: true, lineage: null };
  const text = String(value).trim();
  if (!text) return { ok: true, lineage: null };
  if (text.length > LINEAGE_MAX_LENGTH) {
    return { ok: false, error: `Lineage must be ${LINEAGE_MAX_LENGTH} characters or fewer.` };
  }
  return { ok: true, lineage: text };
}

export function publicLineage(value: string | null | undefined): string | null {
  const text = value?.trim() || "";
  return text ? text : null;
}
