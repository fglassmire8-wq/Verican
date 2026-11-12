export function isGoogleAuthEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export type GoogleAuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  affiliateStatus: string;
  disabled: boolean;
  googleId: string | null;
};

export type GoogleAuthStore = {
  findByEmail: (email: string) => Promise<GoogleAuthUser | null>;
  createMember: (data: { email: string; name: string; googleId: string | null }) => Promise<GoogleAuthUser>;
  setGoogleId: (id: string, googleId: string) => Promise<GoogleAuthUser>;
};

export type GoogleProfileInput = {
  email?: string | null;
  emailVerified?: unknown;
  name?: string | null;
  googleId?: string | null;
};

export type GoogleAuthResult =
  | { ok: false; reason: "unverified_email" | "missing_email" | "disabled" }
  | { ok: true; user: GoogleAuthUser; created: boolean; linked: boolean };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function displayNameFromGoogle(name: string | null | undefined, email: string): string {
  const trimmed = (name ?? "").trim().slice(0, 80);
  if (trimmed.length >= 2) return trimmed;
  const local = email.split("@")[0]?.trim() || "Member";
  const fallback = local.slice(0, 80);
  return fallback.length >= 2 ? fallback : "Member";
}

export async function resolveGoogleSignIn(
  profile: GoogleProfileInput,
  store: GoogleAuthStore,
): Promise<GoogleAuthResult> {
  if (profile.emailVerified !== true) {
    return { ok: false, reason: "unverified_email" };
  }
  const raw = profile.email?.trim();
  if (!raw) return { ok: false, reason: "missing_email" };
  const email = normalizeEmail(raw);

  const existing = await store.findByEmail(email);
  if (existing) {
    if (existing.disabled) return { ok: false, reason: "disabled" };
    let user = existing;
    const googleId = profile.googleId?.trim() || null;
    if (googleId && !existing.googleId) {
      user = await store.setGoogleId(existing.id, googleId);
    }
    return { ok: true, user, created: false, linked: true };
  }

  const user = await store.createMember({
    email,
    name: displayNameFromGoogle(profile.name, email),
    googleId: profile.googleId?.trim() || null,
  });
  return { ok: true, user, created: true, linked: false };
}
