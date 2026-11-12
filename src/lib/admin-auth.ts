import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { publicUrl } from "@/lib/public-origin";
import { getSession } from "@/lib/session";

export async function requireFounderPage(callbackPath: string) {
  const session = await getSession();
  const originRequest = { headers: await headers() };
  if (!session?.user?.id) {
    redirect(publicUrl(`/login?callbackUrl=${callbackPath}`, originRequest).toString());
  }
  if (session.user.role !== "OWNER") {
    redirect(publicUrl("/portal", originRequest).toString());
  }
  return session.user;
}

export async function requireFounderApi() {
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Founder sign-in required." }, { status: 401 }),
      user: null,
    };
  }
  if (session.user.role !== "OWNER") {
    return {
      error: NextResponse.json({ error: "Founder only." }, { status: 403 }),
      user: null,
    };
  }
  return { error: null, user: session.user };
}

export function requireConfirm(body: unknown): boolean {
  return Boolean(body && typeof body === "object" && (body as { confirm?: unknown }).confirm === true);
}
