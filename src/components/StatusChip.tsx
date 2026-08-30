import { isTrustedAffiliate, roleLabel } from "@/lib/utils";

export function StatusChip({
  role,
  affiliateStatus,
}: {
  role: string;
  affiliateStatus: string;
}) {
  const trusted = isTrustedAffiliate({ role, affiliateStatus });
  const pending = affiliateStatus === "PENDING";
  const rejected = affiliateStatus === "REJECTED";

  const tone = trusted
    ? "border-gold bg-gold/10 text-gold-bright"
    : pending
      ? "border-gold/40 bg-panel-2 text-gold"
      : rejected
        ? "border-dont/50 bg-panel-2 text-dont"
        : "border-line bg-panel-2 text-muted";

  return (
    <span
      className={`inline-flex items-center border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${tone}`}
    >
      {roleLabel(role, affiliateStatus)}
    </span>
  );
}
