import Link from "next/link";
import { AffiliateApplyButton } from "@/components/AffiliateApplyButton";
import { JoinForm } from "@/components/JoinForm";
import { RefreshAccountStatusButton } from "@/components/RefreshAccountStatusButton";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { roleLabel } from "@/lib/utils";

export const metadata = { title: "Affiliates" };
export const dynamic = "force-dynamic";

export default async function AffiliatePage() {
  const session = await getSession();
  const user = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Verified reviewers</p>
      <h1 className="font-display text-4xl mt-2">Affiliate program</h1>
      <div className="mt-5 space-y-4 text-muted leading-relaxed">
        <p>
          Users are the affiliates. A separate application is pending, then verified
          or rejected by the owner. Only approved reviews from verified affiliates
          can be liked, drive rank, and may later receive brand-funded discounts.
        </p>
        <p>
          Reward status is ranking by likes — not a dollar amount. Brand-funded
          discounts are configured later. VERICAN does not sell cannabis and does
          not promise pay.
        </p>
        <p>
          Honest <span className="text-dont">DON&apos;T BUY</span> reviews are a
          feature. Member notes stay unverified and unrewarded even if you also
          have a member account.
        </p>
      </div>

      <div className="mt-10 border border-line bg-panel p-6">
        {!user ? (
          <>
            <h2 className="font-display text-2xl">Apply as a new affiliate</h2>
            <p className="mt-2 text-sm text-muted">
              Creates an account and submits an affiliate application in one step.
            </p>
            <div className="mt-6">
              <JoinForm affiliate />
            </div>
            <p className="mt-6 text-sm text-muted">
              Already a member?{" "}
              <Link href="/login" className="text-gold hover:text-gold-bright">
                Sign in
              </Link>{" "}
              and apply with that account.
            </p>
          </>
        ) : user.role === "OWNER" || user.affiliateStatus === "VERIFIED" ? (
          <>
            <h2 className="font-display text-2xl">You are verified</h2>
            <p className="mt-2 text-sm text-muted">
              Status: {roleLabel(user.role, user.affiliateStatus)}. Your new reviews
              stay pending until the owner approves them. Approved likes count toward
              rank.
            </p>
            <Link
              href="/submit"
              className="mt-6 inline-block border border-gold bg-gold text-ink px-5 py-3 text-sm tracking-[0.16em] uppercase"
            >
              Submit a review
            </Link>
          </>
        ) : user.affiliateStatus === "PENDING" ? (
          <>
            <h2 className="font-display text-2xl">Application pending</h2>
            <p className="mt-2 text-sm text-muted">
              The owner has not verified you yet. You can still post member notes —
              they stay unverified and unrewarded until you are verified and a
              review is approved.
            </p>
            <p className="mt-3 text-sm text-muted">
              You do not need to sign out. After the owner verifies you, open this
              page again or check status — your session updates on the next request.
            </p>
            <RefreshAccountStatusButton />
          </>
        ) : user.affiliateStatus === "REJECTED" ? (
          <>
            <h2 className="font-display text-2xl">Application rejected</h2>
            <p className="mt-2 text-sm text-muted">
              This account is not a verified affiliate. Member reviews remain
              unverified and unrewarded.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl">Apply with this account</h2>
            <p className="mt-2 text-sm text-muted">
              Signed in as {user.name}. Applying does not make you verified — the
              owner still has to approve it.
            </p>
            <div className="mt-6">
              <AffiliateApplyButton />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
