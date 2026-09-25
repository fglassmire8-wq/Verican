import Link from "next/link";
import { safeInternalPath } from "@/lib/site";

export const metadata = {
  title: "21+ only",
  description:
    "VERICAN is an independent cannabis review site for adults 21 and older. Not a store. VERICAN does not sell cannabis.",
};

export default async function AgePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeInternalPath(params.next, "/");

  return (
    <div className="min-h-screen bg-ink text-cream flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-6">New Jersey first</p>
        <h1 className="font-display text-5xl sm:text-6xl tracking-[0.28em] text-gold-bright">
          VERICAN
        </h1>
        <div className="editorial-rule my-8" />
        <p className="text-lg leading-relaxed text-cream/90">
          This site is for adults 21 and over. Independent cannabis reviews — not a
          store. VERICAN does not sell cannabis. Reviews are user opinions. New Jersey
          first.
        </p>
        <form action="/api/age" method="post" className="mt-10 space-y-4">
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="w-full border border-gold bg-gold text-ink py-3 tracking-[0.18em] uppercase text-sm font-medium hover:bg-gold-bright transition-colors"
          >
            I am 21 or older
          </button>
        </form>
        <details className="mt-4 text-left">
          <summary className="block w-full list-none cursor-pointer text-center border border-line py-3 tracking-[0.18em] uppercase text-sm text-muted hover:text-cream hover:border-muted transition-colors [&::-webkit-details-marker]:hidden">
            I am not 21
          </summary>
          <p className="mt-4 text-sm text-muted leading-relaxed text-center">
            This site is only for adults 21 and older. Please close the page.
          </p>
        </details>
        <p className="mt-10 text-xs text-muted leading-relaxed">
          Entering confirms you are 21 or older and that you understand reviews are
          user opinions. VERICAN does not sell cannabis.
        </p>
        <p className="mt-4 text-xs text-muted">
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
