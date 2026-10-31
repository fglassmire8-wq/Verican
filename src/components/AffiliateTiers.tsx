const TIERS = [
  {
    name: "Bronze",
    req: "Starting tier: your first approved review",
    perk: "Profile badge, and your reviews show on the site.",
    accent: "#b0703c",
  },
  {
    name: "Silver",
    req: "10 approved reviews",
    perk: "Silver badge, and your reviews are featured higher in categories.",
    accent: "#8a8f98",
  },
  {
    name: "Gold",
    req: "25 approved reviews",
    perk: "Gold badge, and first in line for brand partner perks and discounts as they become available.",
    accent: "#c99a1e",
  },
];

export function AffiliateTiers({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "mt-4" : "mt-8"}>
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "sm:grid-cols-3 gap-4"}`}>
        {TIERS.map((t) => (
          <div
            key={t.name}
            className="border border-line bg-panel-2 rounded-xl p-4"
            style={{ borderTop: `4px solid ${t.accent}` }}
          >
            <p className={`bubble ${compact ? "text-xl" : "text-2xl"}`}>{t.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-muted">{t.req}</p>
            <p className={`mt-2 ${compact ? "text-sm" : "text-sm"} text-cream leading-snug`}>{t.perk}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Tiers and perks may change as the program grows.</p>
    </div>
  );
}
