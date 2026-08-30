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
  if (decision !== "VERIFIED" && decision !== "REJECTED") {
    return NextResponse.json({ error: "Decision must be VERIFIED or REJECTED." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  await prisma.user.update({
    where: { id },
    data: {
      affiliateStatus: decision,
      role: decision === "VERIFIED" ? "AFFILIATE" : user.role === "OWNER" ? "OWNER" : user.role,
    },
  });

  return NextResponse.json({ ok: true });
}
