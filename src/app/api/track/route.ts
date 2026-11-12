import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import {
  hashVisitorId,
  isBotUserAgent,
  referrerHost,
  trackablePath,
} from "@/lib/track";
import { isValidVisitorId, newVisitorId, visitorCookieOptions, VISITOR_COOKIE } from "@/lib/visitor";

export const dynamic = "force-dynamic";

function visitorFrom(request: NextRequest): { id: string; fresh: boolean } {
  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  if (isValidVisitorId(existing)) return { id: existing, fresh: false };
  return { id: newVisitorId(), fresh: true };
}

async function readBody(request: NextRequest): Promise<{ path?: unknown; referrer?: unknown }> {
  const text = await request.text();
  if (!text) return {};
  try {
    const parsed = JSON.parse(text) as { path?: unknown; referrer?: unknown };
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  // Always empty: this endpoint never returns counts or visitor data.
  const empty = new NextResponse(null, { status: 204 });

  if (isBotUserAgent(request.headers.get("user-agent"))) {
    return empty;
  }

  const ip = clientIp(request);
  if (!allowRequest(`track:${ip}`, { windowMs: 10 * 60 * 1000, max: 120 })) {
    return new NextResponse(null, { status: 429 });
  }

  const session = await getSession();
  if (session?.user?.role === "OWNER") {
    return empty;
  }

  const body = await readBody(request);
  const path = trackablePath(body.path);
  if (!path) return empty;

  const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const host = referrerHost(body.referrer ?? request.headers.get("referer"), hostHeader);

  const visitor = visitorFrom(request);

  try {
    await prisma.pageView.create({
      data: {
        path,
        visitorHash: hashVisitorId(visitor.id),
        referrerHost: host,
      },
    });
  } catch {
    // Don't fail the page over a stats write.
  }

  const response = new NextResponse(null, { status: 204 });
  if (visitor.fresh) {
    response.cookies.set(VISITOR_COOKIE, visitor.id, visitorCookieOptions());
  }
  return response;
}
