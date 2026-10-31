"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (newPassword !== confirm) {
      setMsg("New passwords do not match.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setCurrent("");
      setNew("");
      setConfirm("");
      setMsg("Password updated.");
    } else {
      setMsg(data.error ?? "Could not update password.");
    }
  }

  const input = "mt-1 w-full border border-line bg-panel px-3 py-2";
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-sm">
        Current password
        <input type="password" autoComplete="current-password" className={input}
          value={currentPassword} onChange={(e) => setCurrent(e.target.value)} required />
      </label>
      <label className="block text-sm">
        New password (12+ characters)
        <input type="password" autoComplete="new-password" className={input} minLength={12}
          value={newPassword} onChange={(e) => setNew(e.target.value)} required />
      </label>
      <label className="block text-sm">
        Confirm new password
        <input type="password" autoComplete="new-password" className={input} minLength={12}
          value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      </label>
      <button type="submit" disabled={busy}
        className="border border-gold bg-gold text-ink px-5 py-3 text-sm tracking-[0.16em] uppercase disabled:opacity-60">
        {busy ? "Saving…" : "Update password"}
      </button>
      {msg && <p className="text-sm text-muted">{msg}</p>}
    </form>
  );
}
