/** Request-like input used to recover the browser-facing origin. */
export type OriginRequest = {
  headers: { get(name: string): string | null };
  url?: string;
};

function firstHeader(headers: OriginRequest["headers"], name: string): string | undefined {
  const raw = headers.get(name);
  if (!raw) return undefined;
  const value = raw.split(",")[0]?.trim();
  return value || undefined;
}

/**
 * Public origin for redirects.
 *
 * Next.js on Railway listens on 0.0.0.0:PORT, so `request.url` is the
 * container address, not the host the browser can open.
 *
 * Order: NEXTAUTH_URL, then x-forwarded-proto + x-forwarded-host / host,
 * then request.url.
 */
export function getPublicOrigin(request: OriginRequest): string {
  const fromEnv = process.env.NEXTAUTH_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      // Invalid NEXTAUTH_URL — fall through to forwarded headers.
    }
  }

  const proto = firstHeader(request.headers, "x-forwarded-proto");
  const host =
    firstHeader(request.headers, "x-forwarded-host") ||
    firstHeader(request.headers, "host");

  if (host) {
    const scheme =
      proto || (request.url ? new URL(request.url).protocol.replace(":", "") : "https");
    return `${scheme}://${host}`;
  }

  if (request.url) {
    return new URL(request.url).origin;
  }

  return "http://localhost:3000";
}

export function publicUrl(path: string, request: OriginRequest): URL {
  return new URL(path, getPublicOrigin(request));
}
