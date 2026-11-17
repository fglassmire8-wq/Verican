import { NextRequest, NextResponse } from "next/server";
import { requireFounderApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { upsertStrainGenetics } from "@/lib/strain-genetics";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const row = await prisma.strainGenetics.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Archive entry not found." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as { lineage?: unknown; displayName?: unknown } | null;
  if (!body || body.lineage === undefined) {
    return NextResponse.json({ error: "Lineage is required." }, { status: 400 });
  }
  const result = await upsertStrainGenetics({
    strainName: String(body.displayName ?? row.displayName),
    lineage: String(body.lineage),
    userId: auth.user?.id,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
