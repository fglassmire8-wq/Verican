"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("Email or password is wrong.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          className="mt-1 w-full bg-panel border border-line px-3 py-3 outline-none focus:border-gold"
        />
      </label>
      {error ? <p className="text-sm text-dont">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full border border-gold bg-gold text-ink py-3 text-sm tracking-[0.16em] uppercase disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
