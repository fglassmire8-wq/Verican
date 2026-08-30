import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const next = String(form.get("next") || "/");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const response = NextResponse.redirect(new URL(safeNext, request.url));
  response.cookies.set("verican_21", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
