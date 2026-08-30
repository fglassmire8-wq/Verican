export type Role = "MEMBER" | "AFFILIATE" | "OWNER";
export type AffiliateStatus = "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type Verdict = "BUY" | "DONT_BUY";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(value);
}

export function isTrustedAffiliate(user: {
  role: string;
  affiliateStatus: string;
}): boolean {
  return user.role === "OWNER" || user.affiliateStatus === "VERIFIED";
}

export function isTrustedReview(
  status: string,
  user: { role: string; affiliateStatus: string },
): boolean {
  return status === "APPROVED" && isTrustedAffiliate(user);
}

export function verdictLabel(verdict: string): string {
  return verdict === "DONT_BUY" ? "DON'T BUY" : "BUY";
}

export function roleLabel(role: string, affiliateStatus: string): string {
  if (role === "OWNER") return "Owner";
  if (affiliateStatus === "VERIFIED") return "Verified affiliate";
  if (affiliateStatus === "PENDING") return "Affiliate (pending)";
  if (affiliateStatus === "REJECTED") return "Affiliate (rejected)";
  return "Member";
}
