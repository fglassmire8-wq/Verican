import { NextRequest, NextResponse } from "next/server";
import { requireConfirm, requireFounderApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteStoredPhoto } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as { alt?: unknown } | null;
  if (!body || body.alt === undefined) {
    return NextResponse.json({ error: "Caption is required." }, { status: 400 });
  }
  const alt = String(body.alt).trim();
  if (!alt) return NextResponse.json({ error: "Caption is required." }, { status: 400 });
  const updated = await prisma.photo.update({ where: { id }, data: { alt } });
  return NextResponse.json({ ok: true, photo: { id: updated.id, alt: updated.alt } });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireFounderApi();
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null);
  if (!requireConfirm(body)) {
    return NextResponse.json({ error: "Confirm the delete." }, { status: 400 });
  }
  const { id } = await context.params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  await deleteStoredPhoto(photo.path);
  await prisma.photo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
