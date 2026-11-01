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
  searchParams: Promise<{ next?: string; declined?: string }>;
}) {
  const params = await searchParams;
  const next = safeInternalPath(params.next, "/");
  const declined = params.declined === "1";

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
        <section className="mt-8 text-left border border-line p-5 space-y-3 text-sm leading-relaxed text-cream/90 max-h-[50vh] overflow-y-auto">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-gold">Disclaimer</h2>
          <p><strong>Public Information.</strong> All brand-related information appearing on this site consists solely of information previously made publicly available by its owners or by third parties, and has been obtained from publicly accessible websites. This site does not publish confidential, proprietary, or non-public information.</p>
          <p><strong>Photographs.</strong> All photographs published on this site are submitted exclusively by pre-approved affiliates of the site, and each photograph is reviewed and vetted prior to publication.</p>
          <p><strong>Product Reviews.</strong> All product reviews appearing on this site are contributed exclusively by participants in the site&apos;s affiliate program.</p>
          <p><strong>Age Requirement.</strong> Participation in the site&apos;s affiliate program is limited to individuals who are twenty-one (21) years of age or older. The content of this site is intended solely for adults aged twenty-one (21) and over.</p>
        </section>
        <form action="/api/age" method="post" className="mt-6 space-y-3">
          <input type="hidden" name="next" value={next} />
          <p className="text-xs text-muted leading-relaxed">
            By clicking below, you confirm you are 21 or older and that you have read and accept the disclaimer above.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              className="w-full border border-gold bg-gold text-ink py-3 tracking-[0.12em] uppercase text-sm font-medium hover:bg-gold-bright transition-colors"
            >
              I have read and understand
            </button>
            <Link
              href={`/age?declined=1&next=${encodeURIComponent(next)}`}
              className="block w-full border border-line py-3 tracking-[0.12em] uppercase text-sm text-muted hover:text-cream hover:border-muted transition-colors"
            >
              No, I do not understand
            </Link>
          </div>
        </form>
        {declined ? (
          <p role="alert" className="mt-4 border border-line p-4 text-sm text-cream leading-relaxed">
            You must be 21 or older and accept the disclaimer to enter Green Vault.
          </p>
        ) : null}
        <p className="mt-10 text-xs text-muted leading-relaxed">
          Entering confirms you are 21 or older and accept the disclaimer above. Green Vault does not sell cannabis.
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
