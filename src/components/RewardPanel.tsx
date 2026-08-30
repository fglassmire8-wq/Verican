type RewardRuleRow = {
  id: string;
  key: string;
  label: string;
  config: string;
};

function rewardDetails(config: string): string[] {
  const lines: string[] = [];
  try {
    const parsed = JSON.parse(config) as {
      note?: unknown;
      enabled?: unknown;
    };
    if (typeof parsed.note === "string" && parsed.note.trim()) {
      lines.push(parsed.note.trim());
    }
    if (parsed.enabled === false) {
      lines.push("Not configured yet.");
    }
  } catch {
    // Keep the label only if config is not JSON.
  }
  return lines;
}

export function RewardPanel({ rules }: { rules: RewardRuleRow[] }) {
  return (
    <section>
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Rewards</p>
      <h2 className="font-display text-3xl mt-2">How rank pays</h2>
      <p className="mt-2 text-sm text-muted max-w-2xl leading-relaxed">
        Rank is ordering by likes on approved verified-affiliate reviews. There is
        no dollar amount here. Brand-funded discounts are configured later. VERICAN
        does not sell cannabis and does not promise pay.
      </p>

      {rules.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No reward rules are stored yet. Rank still uses likes when reviews are
          approved.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rules.map((rule) => {
            const details = rewardDetails(rule.config);
            return (
              <li key={rule.id} className="border border-line bg-panel p-5">
                <p className="text-cream">{rule.label}</p>
                {details.map((line) => (
                  <p key={line} className="mt-2 text-sm text-muted">
                    {line}
                  </p>
                ))}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
