/** Fixed product categories. Stored as uppercase tokens on Product.category. */
export const PRODUCT_CATEGORIES = [
  { value: "FLOWER", label: "Flower", slug: "flower" },
  { value: "PREROLL", label: "Pre-roll", slug: "pre-roll" },
  { value: "VAPE", label: "Vape", slug: "vape" },
  { value: "CONCENTRATE", label: "Concentrate", slug: "concentrate" },
  { value: "EDIBLE", label: "Edible", slug: "edible" },
  { value: "OTHER", label: "Other", slug: "other" },
] as const;

export type ProductCategoryValue = (typeof PRODUCT_CATEGORIES)[number]["value"];
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

const ALIASES: Record<string, ProductCategoryValue> = {
  flower: "FLOWER",
  flowers: "FLOWER",
  preroll: "PREROLL",
  "pre-roll": "PREROLL",
  prerolls: "PREROLL",
  "pre-rolls": "PREROLL",
  "pre_roll": "PREROLL",
  vape: "VAPE",
  vapes: "VAPE",
  concentrate: "CONCENTRATE",
  concentrates: "CONCENTRATE",
  edible: "EDIBLE",
  edibles: "EDIBLE",
  other: "OTHER",
};

export function parseCategory(input: unknown): ProductCategory | null {
  if (input == null) return null;
  const raw = String(input).trim();
  if (!raw) return null;
  const key = raw.toLowerCase().replace(/\s+/g, "-");
  const value =
    ALIASES[key] ??
    PRODUCT_CATEGORIES.find((item) => item.value === raw.toUpperCase())?.value ??
    null;
  return PRODUCT_CATEGORIES.find((item) => item.value === value) ?? null;
}

export function categoryLabel(value: string | null | undefined): string {
  return parseCategory(value)?.label ?? "Flower";
}

export function categorySlug(value: string | null | undefined): string {
  return parseCategory(value)?.slug ?? "flower";
}
