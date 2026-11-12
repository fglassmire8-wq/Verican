import { createHash } from "node:crypto";

const SKIP_PREFIXES = ["/api", "/_next", "/uploads", "/media", "/portal", "/moderation"];

const BOT_UA =
  /bot|crawler|spider|crawling|slurp|facebookexternalhit|facebookcatalog|twitterbot|linkedinbot|embedly|quora link preview|outbrain|pinterest|redditbot|applebot|semrush|ahrefs|dotbot|petalbot|whatsapp|telegram|discordbot|preview/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua || !ua.trim()) return true;
  return BOT_UA.test(ua);
}

export function trackablePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  path = path.split("?")[0]?.split("#")[0] ?? path;
  if (!path || path.length > 200) return null;
  try {
    path = decodeURIComponent(path);
  } catch {
    return null;
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (path.length > 200) return null;
  const lower = path.toLowerCase();
  if (SKIP_PREFIXES.some((prefix) => lower === prefix || lower.startsWith(`${prefix}/`))) {
    return null;
  }
  if (/\.[a-z0-9]{1,8}$/i.test(path)) return null;
  if (!/^\/[A-Za-z0-9/_-]*$/.test(path)) return null;
  return path;
}

export function referrerHost(raw: unknown, requestHost?: string | null): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    if (!host) return null;
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") return null;
    if (host === "greenvaultnj.com" || host.endsWith(".greenvaultnj.com")) return null;
    const self = (requestHost ?? "").split(":")[0]?.replace(/^www\./i, "").toLowerCase();
    if (self && host === self) return null;
    return host.slice(0, 200);
  } catch {
    return null;
  }
}

export function hashVisitorId(visitorId: string): string {
  return createHash("sha256").update(`gv_vid:${visitorId}`).digest("hex");
}

/** Start of `timeZone`'s calendar day, as a UTC Date. */
export function startOfZonedDay(timeZone = "America/New_York", now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  let utc = Date.UTC(year, month - 1, day, 5, 0, 0);
  for (let i = 0; i < 4; i += 1) {
    const clock = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(utc));
    const val = (type: string) => Number(clock.find((part) => part.type === type)?.value);
    const got = Date.UTC(val("year"), val("month") - 1, val("day"), val("hour"), val("minute"), val("second"));
    const wanted = Date.UTC(year, month - 1, day, 0, 0, 0);
    utc += wanted - got;
  }
  return new Date(utc);
}
