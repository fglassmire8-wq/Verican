/**
 * Public site copy and origin used by metadata, robots, and the sitemap.
 * Descriptions stay with language already on the site. No payout or sales claims.
 */

/** Display name for titles, metadata, and sentences. */
export const SITE_NAME = "The Green Vault";

/** Short gold lockup used in the header, footer, age gate, and share image. */
export const SITE_MARK = "GREEN VAULT";

export const SITE_TITLE = "The Green Vault — Independent cannabis reviews";

export const SITE_DESCRIPTION =
  "Independent 21+ cannabis review site. Check a photo and an honest review before you buy at a New Jersey dispensary. Not a store. The Green Vault does not sell cannabis. Reviews are user opinions.";

export const CONTACT_EMAIL = "vericannprez@gmail.com";

/** Age-gate flag set after a 21+ confirmation. */
export const AGE_COOKIE = "greenvault_21";

/** Previous age-gate cookie. Still accepted so an existing confirmation stays valid. */
export const LEGACY_AGE_COOKIE = "verican_21";

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
