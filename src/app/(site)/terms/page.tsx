import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The Green Vault is a 21+ independent review site. Not a store. User opinions only. New Jersey first. No cannabis sales and no promised dollar payout.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">21+ · Not a store</p>
      <h1 className="font-display text-4xl mt-2">Terms</h1>
      <p className="mt-3 text-sm text-muted">Last updated September 25, 2026.</p>

      <div className="mt-8 space-y-8 text-muted leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-cream">21 and older</h2>
          <p>
            The Green Vault is for adults 21 and older. Entering the site means you confirm
            that you are 21 or older. The site does not check a government ID.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-cream">Not a store</h2>
          <p>
            The Green Vault does not sell cannabis. There is no cart, no checkout, and no
            shipping. Nothing on this site is an offer to sell cannabis. You buy, if
            you buy, at a licensed dispensary — not here.
          </p>
          <p>
            New Jersey is the first market. Reviews describe flower people bought and
            opened, because dispensary jars are sealed on the floor. The catalog lists
            only flower with a public review. The Green Vault does not add products on its own.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-cream">User opinions only</h2>
          <p>
            Reviews are the opinions of the people who posted them. They are not
            The Green Vault&apos;s opinion, not a brand&apos;s claim, and not medical, legal, or
            safety advice. A BUY or DON&apos;T BUY note is one person&apos;s call after a
            purchase. Honest DON&apos;T BUY reviews are allowed.
          </p>
          <p>
            Member notes are unverified and unrewarded. They never count toward trusted
            rank. Verified-affiliate reviews stay pending until the owner approves them.
            The Green Vault does not promise that a review is complete or correct.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-cream">Accounts, rank, and rewards</h2>
          <p>
            Members can read reviews and post notes. A verified affiliate is a separate
            application: pending, then verified or rejected by the owner. Only approved
            reviews from verified affiliates can be liked. Rank is that like count. It
            is not a dollar amount.
          </p>
          <p>
            The Green Vault does not promise pay. Brand-funded discounts are not offered on
            this site today. Nothing in an account balance, a rank, or a review is a
            promise of money.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-cream">What you post</h2>
          <p>
            You are responsible for your reviews and photos. Post only what you are
            willing to show publicly and what you have the right to share. The owner
            can approve, reject, or remove a review or an affiliate application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-cream">Contact</h2>
          <p>
            Questions about these terms or the site:{" "}
            <a className="text-gold hover:text-gold-bright" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            . How account data is handled is on the{" "}
            <Link href="/privacy" className="text-gold hover:text-gold-bright">
              privacy page
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
