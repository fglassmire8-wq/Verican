import { NextResponse } from "next/server";
import { publicUrl } from "@/lib/public-origin";
import { AGE_COOKIE } from "@/lib/site";

export async function POST(request: Request) {
  const form = await request.formData();
  const next = String(form.get("next") || "/");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const response = NextResponse.redirect(publicUrl(safeNext, request));
  response.cookies.set(AGE_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
