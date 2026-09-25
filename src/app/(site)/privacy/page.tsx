import type { Metadata } from "next";
import Link from "next/link";
import { AGE_COOKIE, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What The Green Vault stores: an age confirmation, your account, and the reviews you choose to post. 21+ only. Not a store. No cannabis sales.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">21+ · Not a store</p>
      <h1 className="font-display text-4xl mt-2">Privacy</h1>
      <p className="mt-3 text-sm text-muted">Last updated September 25, 2026.</p>

      <div className="mt-8 space-y-8 text-muted leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-cream">What this site is</h2>
          <p>
            The Green Vault is an independent review site for adults 21 and older. It is
            not a store. There is no cart and no checkout. The Green Vault does not sell,
            ship, or deliver cannabis.
          </p>
          <p>
            New Jersey is the first market. The point is a photo and a review before
            you buy a sealed product at a dispensary. Reviews on this site are user
            opinions, not a statement from a brand or from The Green Vault.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-cream">What we store</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              An age confirmation cookie named <span className="text-cream">{AGE_COOKIE}</span>{" "}
              after you say you are 21 or older. It is a flag, not an ID check. It lasts
              about a year.
            </li>
            <li>
              Account details you submit: name, email, and a password stored only as a
              hash. A sign-in cookie keeps you logged in.
            </li>
            <li>
              Reviews you post: strain, brand, store, city, state, amount, the price you
              paid, notes, a BUY or DON&apos;T BUY verdict, optional label details, and
              photos.
            </li>
            <li>Likes on approved reviews from verified affiliates.</li>
          </ul>
          <p>
            The Green Vault does not take payment and does not store card numbers. Rank is likes
            on approved verified-affiliate reviews. No dollar amount is recorded as a
            reward.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-cream">What other people can see</h2>
          <p>
            Approved reviews are public, including member notes and the name on the
            account that posted them. Photos you attach are public with that review.
            Pending verified-affiliate reviews stay off the public catalog until the
            owner approves them.
          </p>
          <p>
            The Green Vault does not sell personal information. Account email is used to sign
            you in and to reply if you write to us. It is not published on a review.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl text-cream">Asking about your information</h2>
          <p>
            Email{" "}
            <a className="text-gold hover:text-gold-bright" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>{" "}
            to ask about your account, a review, or a photo you posted. The{" "}
            <Link href="/terms" className="text-gold hover:text-gold-bright">
              terms
            </Link>{" "}
            explain what the site is and is not.
          </p>
        </section>
      </div>
    </article>
  );
}
