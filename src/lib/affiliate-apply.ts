import { prisma } from "@/lib/prisma";

export type AffiliateApplyResult =
  | { ok: true; already: boolean }
  | { ok: false; error: string; status: number };

export async function applyAffiliate(userId: string): Promise<AffiliateApplyResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "Account not found.", status: 404 };
  if (user.role === "OWNER" || user.affiliateStatus === "VERIFIED") {
    return { ok: true, already: true };
  }
  if (user.affiliateStatus === "PENDING") {
    return { ok: true, already: true };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: user.role === "OWNER" ? "OWNER" : "AFFILIATE",
      affiliateStatus: "PENDING",
    },
  });
  return { ok: true, already: false };
}
