"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConfirmButton({
  url,
  method = "DELETE",
  confirmText,
  label,
  body,
  className,
  redirectTo,
}: {
  url: string;
  method?: string;
  confirmText: string;
  label: string;
  body?: Record<string, unknown>;
  className?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!window.confirm(confirmText)) return;
    setPending(true);
    setError("");
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true, ...body }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error || "That didn’t work.");
      return;
    }
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  }

  return (
    <span className="inline-block">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={className ?? "border border-dont text-dont px-3 py-1.5 text-sm hover:bg-dont/10 disabled:opacity-60"}
      >
        {pending ? "Working…" : label}
      </button>
      {error ? <p className="mt-2 text-sm text-dont">{error}</p> : null}
    </span>
  );
}
