"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-muted hover:text-cream transition-colors"
    >
      Sign out
    </button>
  );
}
