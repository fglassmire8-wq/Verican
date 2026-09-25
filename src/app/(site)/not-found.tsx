import Link from "next/link";
import { SITE_MARK } from "@/lib/site";

export default function SiteNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">{SITE_MARK}</p>
      <h1 className="font-display text-4xl mt-2">Page not found</h1>
      <p className="mt-4 text-muted leading-relaxed max-w-xl">
        That address is not on this site. The catalog only includes flower with a
        public review.
      </p>
      <div className="mt-8 flex flex-wrap gap-4 text-sm tracking-[0.16em] uppercase">
        <Link href="/" className="border border-gold bg-gold text-ink px-5 py-2.5">
          Back to reviews
        </Link>
        <Link href="/markets" className="border border-line px-5 py-2.5 hover:border-gold">
          Search
        </Link>
      </div>
    </div>
  );
}
