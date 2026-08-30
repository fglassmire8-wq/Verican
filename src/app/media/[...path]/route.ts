import { NextResponse } from "next/server";
import { readRuntimeUpload } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const file = await readRuntimeUpload(segments);
  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(file.bytes, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
