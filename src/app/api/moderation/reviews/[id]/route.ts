import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const owner = await requireOwner();
  if (!owner) {
    return NextResponse.json({ error: "Owner only." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const decision = String(body?.decision || "");
  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return NextResponse.json({ error: "Decision must be APPROVED or REJECTED." }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  await prisma.review.update({
    where: { id },
    data: { status: decision },
  });

  return NextResponse.json({ ok: true });
}
