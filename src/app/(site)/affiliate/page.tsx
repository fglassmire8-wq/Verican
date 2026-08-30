import Link from "next/link";
import { redirect } from "next/navigation";
import { JoinForm } from "@/components/JoinForm";
import { getSession } from "@/lib/session";

export const metadata = { title: "Affiliates" };
export const dynamic = "force-dynamic";

export default async function AffiliatePage() {
  const session = await getSession();
  if (session?.user?.id) redirect("/portal");

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
        <p>
          After you sign in, the{" "}
          <Link href="/portal" className="text-gold hover:text-gold-bright">
            affiliate portal
          </Link>{" "}
          is your desk — rank, reviews, and applications live there.
        </p>
      </div>

      <div className="mt-10 border border-line bg-panel p-6">
        <h2 className="font-display text-2xl">Apply as a new affiliate</h2>
        <p className="mt-2 text-sm text-muted">
          Creates an account and submits an affiliate application in one step. You
          land in the portal after login, still pending until the owner verifies you.
        </p>
        <div className="mt-6">
          <JoinForm affiliate />
        </div>
        <p className="mt-6 text-sm text-muted">
          Already a member?{" "}
          <Link href="/login?callbackUrl=/portal" className="text-gold hover:text-gold-bright">
            Sign in
          </Link>{" "}
          and apply from the portal.
        </p>
      </div>
    </div>
  );
}
