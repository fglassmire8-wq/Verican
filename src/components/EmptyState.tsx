import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-line bg-panel px-6 py-10">
      <p className="font-display text-2xl text-cream">{title}</p>
      <div className="mt-2 max-w-xl text-sm text-muted leading-relaxed">{children}</div>
    </div>
  );
}
