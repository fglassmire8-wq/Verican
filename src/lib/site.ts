/**
 * Public site copy and origin used by metadata, robots, and the sitemap.
 * Descriptions stay with language already on the site. No payout or sales claims.
 */

export const SITE_NAME = "VERICAN";

export const SITE_TITLE = "VERICAN — Independent cannabis reviews";

export const SITE_DESCRIPTION =
  "Independent 21+ cannabis review site. Check a photo and an honest review before you buy at a New Jersey dispensary. Not a store. VERICAN does not sell cannabis. Reviews are user opinions.";

export const CONTACT_EMAIL = "vericannprez@gmail.com";

/** Browser-facing origin. Runtime env wins so a later custom domain does not need a code change. */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXTAUTH_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      // Invalid NEXTAUTH_URL — fall through.
    }
  }

  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) return `https://${railway}`;

  return "http://localhost:3000";
}

/** Login and age-gate next paths stay on this site. */
export function safeInternalPath(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
