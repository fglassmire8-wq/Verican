"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinForm({ affiliate = false }: { affiliate?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") || ""),
        email,
        password,
        affiliate,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPending(false);
      setError(data.error || "Could not create the account.");
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    router.push(affiliate ? "/dashboard" : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Name</span>
        <input
          name="name"
          required
          minLength={2}
          className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block text-sm">
        <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block text-sm">
        <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={10}
          className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
        />
        <span className="block mt-1 text-xs text-muted">At least 10 characters.</span>
      </label>
      {error ? <p className="text-sm text-dont">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full border border-gold bg-gold text-ink py-3 text-sm tracking-[0.16em] uppercase disabled:opacity-60"
      >
        {pending ? "Saving…" : affiliate ? "Apply as affiliate" : "Create member account"}
      </button>
    </form>
  );
}
