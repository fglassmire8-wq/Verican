import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  if (user.role === "OWNER" || user.affiliateStatus === "VERIFIED") {
    return NextResponse.json({ error: "You are already a verified affiliate." }, { status: 400 });
  }
  if (user.affiliateStatus === "PENDING") {
    return NextResponse.json({ error: "Your application is already pending." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: user.role === "OWNER" ? "OWNER" : "AFFILIATE",
      affiliateStatus: "PENDING",
    },
  });

  return NextResponse.json({ ok: true });
}
