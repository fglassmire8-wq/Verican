export function HowItWorks() {
  const steps = [
    {
      title: "Check a review before buying",
      body: "Jars are sealed on the dispensary floor. Read a photo and an honest BUY or DON'T BUY first.",
    },
    {
      title: "Review after you purchase",
      body: "Post the flower you actually bought. Honest DON'T BUY notes are a feature.",
    },
    {
      title: "Likes drive rank",
      body: "Only approved reviews from verified affiliates can be liked. Rank is likes, not a dollar amount.",
    },
    {
      title: "The owner approves reviews",
      body: "Verified-affiliate reviews stay pending until Francis approves them. Member notes publish unverified and never rank.",
    },
  ];

  return (
    <section>
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Guide</p>
      <h2 className="font-display text-3xl mt-2">How it works</h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title} className="border border-line bg-panel p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="font-display text-xl mt-2 text-cream">{step.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
