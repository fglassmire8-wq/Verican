import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AffiliateApplyButton } from "@/components/AffiliateApplyButton";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { SignOutButton } from "@/components/SignOutButton";
import { StatusChip } from "@/components/StatusChip";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/lib/public-origin";
import { getSession } from "@/lib/session";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function PortalAccountPage() {
  const session = await getSession();
  const originRequest = { headers: await headers() };
  if (!session?.user?.id) {
    redirect(publicUrl("/login?callbackUrl=/portal/account", originRequest).toString());
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect(publicUrl("/login", originRequest).toString());
  const owner = user.role === "OWNER";
  const canApply = !owner && user.affiliateStatus === "NONE";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Affiliate HQ</p>
      <h1 className="font-display text-4xl mt-2">Account</h1>
      <div className="mt-8 border border-line bg-panel p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl">{user.name}</h2>
          <StatusChip role={user.role} affiliateStatus={user.affiliateStatus} />
        </div>
        <p className="mt-2 text-sm text-muted">{user.email}</p>
        {canApply ? (
          <div className="mt-6">
            <AffiliateApplyButton />
          </div>
        ) : null}
        <div className="mt-6 text-sm">
          <SignOutButton />
        </div>
      </div>
      {owner ? (
        <div className="mt-8 border border-line bg-panel p-6">
          <h2 className="font-display text-2xl">Change password</h2>
          <ChangePasswordForm />
        </div>
      ) : null}
    </div>
  );
}
