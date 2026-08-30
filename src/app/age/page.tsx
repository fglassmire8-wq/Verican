export const metadata = {
  title: "21+ only",
};

export default async function AgePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/";

  return (
    <div className="min-h-screen bg-ink text-cream flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-6">New Jersey first</p>
        <h1 className="font-display text-5xl sm:text-6xl tracking-[0.28em] text-gold-bright">
          VERICAN
        </h1>
        <div className="editorial-rule my-8" />
        <p className="text-lg leading-relaxed text-cream/90">
          This site is for adults 21 and over. Independent cannabis reviews — not a store.
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
        <a
          href="https://www.google.com"
          className="mt-4 inline-block w-full border border-line py-3 tracking-[0.18em] uppercase text-sm text-muted hover:text-cream hover:border-muted transition-colors"
        >
          I am not 21
        </a>
        <p className="mt-10 text-xs text-muted leading-relaxed">
          VERICAN does not sell cannabis. Entering confirms you are 21+ and that you
          understand reviews are user opinions.
        </p>
      </div>
    </div>
  );
}
