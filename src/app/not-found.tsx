import Link from "next/link";
import { SITE_MARK } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink text-cream flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <p className="font-display text-3xl sm:text-4xl tracking-[0.12em] sm:tracking-[0.18em] text-gold-bright">
          {SITE_MARK}
        </p>
        <h1 className="font-display text-3xl mt-6">Page not found</h1>
        <p className="mt-4 text-muted leading-relaxed">
          That address is not on this site. The catalog only includes flower with a
          public review.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm tracking-[0.16em] uppercase">
          <Link href="/" className="border border-gold bg-gold text-ink px-5 py-2.5">
            Back to reviews
          </Link>
          <Link href="/markets" className="border border-line px-5 py-2.5 hover:border-gold">
            Search
          </Link>
        </div>
        <p className="mt-8 text-sm text-muted">
          <Link href="/privacy" className="hover:text-gold-bright">
            Privacy
          </Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="hover:text-gold-bright">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}
