export const VISITOR_COOKIE = "gv_vid";
export const AGE_COOKIE = "gv_21";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidVisitorId(value: string | undefined | null): value is string {
  return Boolean(value && UUID_RE.test(value));
}

export function newVisitorId(): string {
  return crypto.randomUUID();
}

export function visitorCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
    secure: process.env.NODE_ENV === "production",
  };
}
