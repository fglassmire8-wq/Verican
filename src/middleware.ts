import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicUrl } from "@/lib/public-origin";

const AGE_COOKIE = "verican_21";

export function middleware(request: NextRequest) {
  const verified = request.cookies.get(AGE_COOKIE)?.value === "1";
  if (verified) return NextResponse.next();

  const url = publicUrl("/age", request);
  const next = request.nextUrl.pathname + request.nextUrl.search;
  if (next && next !== "/age") {
    url.searchParams.set("next", next);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|media|age).*)",
  ],
};
