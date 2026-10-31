import Link from "next/link";
import { AffiliateTiers } from "@/components/AffiliateTiers";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <h1 className="font-display text-4xl sm:text-5xl max-w-3xl leading-tight text-cream">
            Third party peer reviews
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted leading-relaxed">
            Green Vault publishes independent, third-party reviews of medical and
            recreational cannabis products, purely for quality control. In New Jersey you
            usually can&apos;t see the product before you buy it, so our goal is for every
            product on the market to eventually be reviewed.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/affiliate"
              className="border border-gold bg-gold text-ink px-6 py-3 text-base tracking-[0.08em] uppercase hover:bg-gold-bright hover:border-gold-bright"
            >
              Become an affiliate — Sign up
            </Link>
            <Link
              href="/categories"
              className="border border-line bg-panel px-6 py-3 text-base tracking-[0.08em] uppercase text-cream hover:border-gold"
            >
              Browse categories
            </Link>
          </div>
          <div className="mt-10 max-w-3xl border border-line p-5 bg-panel">
            <h2 className="font-display text-2xl text-gold-bright">Affiliate Program</h2>
            <p className="mt-2 text-muted">Become an affiliate. Sign up here.</p>
            <AffiliateTiers compact />
            <Link
              href="/affiliate"
              className="mt-4 inline-block border border-gold bg-gold text-ink px-5 py-2.5 text-sm tracking-[0.12em] uppercase"
            >
              Sign up as an affiliate
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
