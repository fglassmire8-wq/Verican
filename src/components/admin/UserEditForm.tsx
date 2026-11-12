"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserEditForm({
  user,
  isSelf,
}: {
  user: { id: string; name: string; role: string; affiliateStatus: string; disabled: boolean };
  isSelf: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSaved(false);
    const form = new FormData(event.currentTarget);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        role: form.get("role"),
        affiliateStatus: form.get("affiliateStatus"),
        disabled: form.get("disabled") === "on",
      }),
    });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(json?.error || "Save failed.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Name</span>
        <input name="name" defaultValue={user.name} required className="mt-1 w-full bg-panel border border-line px-3 py-2" />
      </label>
      <label className="block text-sm">
        <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Role</span>
        <select name="role" defaultValue={user.role} disabled={isSelf} className="mt-1 w-full bg-panel border border-line px-3 py-2 disabled:opacity-60">
          <option value="MEMBER">Member</option>
          <option value="AFFILIATE">Affiliate</option>
          <option value="OWNER">Founder</option>
        </select>
        {isSelf ? <p className="mt-1 text-xs text-muted">You cannot change your own role.</p> : null}
      </label>
      <label className="block text-sm">
        <span className="text-[11px] uppercase tracking-[0.16em] text-gold">Affiliate status</span>
        <select name="affiliateStatus" defaultValue={user.affiliateStatus} className="mt-1 w-full bg-panel border border-line px-3 py-2">
          <option value="NONE">None</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="disabled" defaultChecked={user.disabled} disabled={isSelf} />
        Disable account (cannot sign in)
      </label>
      {error ? <p className="text-sm text-dont">{error}</p> : null}
      {saved ? <p className="text-sm text-gold-bright">Saved.</p> : null}
      <button type="submit" disabled={pending} className="border border-gold bg-gold text-ink px-5 py-2.5 text-sm tracking-[0.12em] uppercase disabled:opacity-60">
        {pending ? "Saving…" : "Save account"}
      </button>
    </form>
  );
}
