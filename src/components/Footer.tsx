import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted space-y-3">
        <p className="font-display text-xl tracking-[0.2em] text-gold/80">VERICAN</p>
        <p>21+ only. VERICAN does not sell cannabis. Reviews are user opinions.</p>
        <p>
          Independent review site. Not a store. No cart. New Jersey first — people cannot
          inspect flower before buying at a dispensary.
        </p>
        <p>
          <a className="text-cream hover:text-gold-bright" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
          <Link href="/privacy" className="hover:text-gold-bright">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-gold-bright">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
