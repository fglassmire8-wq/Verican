import Link from "next/link";
import { safeInternalPath } from "@/lib/site";

export const metadata = {
  title: "Welcome — please confirm your age",
  description:
    "Green Vault is an independent cannabis review site for adults 21 and older. Not a store. Green Vault does not sell cannabis.",
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
        <p className="text-[11px] uppercase tracking-[0.12em] text-gold mb-6">New Jersey first</p>
        <h1 className="font-display text-5xl sm:text-6xl tracking-[0.12em] text-gold-bright">
          GREEN VAULT
        </h1>
        <div className="editorial-rule my-8" />
        <p className="text-lg leading-relaxed text-cream/90">
          Welcome! Everyone 21 and over is invited to browse, read, and share honest
          cannabis reviews. Quick check before you come in: are you 21 or older? We are
          not a store and don&apos;t sell cannabis — reviews are user opinions.
        </p>
        <form action="/api/age" method="post" className="mt-10 space-y-4">
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="w-full border border-gold bg-gold text-ink py-3 tracking-[0.18em] uppercase text-sm font-medium hover:bg-gold-bright transition-colors"
          >
            Yes, I&apos;m 21 or older — come on in
          </button>
        </form>
        <details className="mt-4 text-left">
          <summary className="block w-full list-none cursor-pointer text-center border border-line py-3 tracking-[0.18em] uppercase text-sm text-muted hover:text-cream hover:border-muted transition-colors [&::-webkit-details-marker]:hidden">
            I&apos;m not 21 yet
          </summary>
          <p className="mt-4 text-sm text-muted leading-relaxed text-center">
            Thanks for being honest! New Jersey law limits this site to adults 21 and older, so please come back once you turn 21.
          </p>
        </details>
        <p className="mt-10 text-xs text-muted leading-relaxed">
          Entering confirms you are 21 or older and that you understand reviews are
          user opinions. Green Vault does not sell cannabis.
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
