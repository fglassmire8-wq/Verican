import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  displayNameFromGoogle,
  normalizeEmail,
  resolveGoogleSignIn,
  type GoogleAuthStore,
  type GoogleAuthUser,
} from "./google-auth";

function memoryStore(seed: GoogleAuthUser[] = []): GoogleAuthStore & { users: GoogleAuthUser[] } {
  const users = seed.map((user) => ({ ...user }));
  return {
    users,
    async findByEmail(email) {
      const normalized = email.trim().toLowerCase();
      return users.find((user) => user.email.toLowerCase() === normalized) ?? null;
    },
    async createMember({ email, name, googleId }) {
      const user: GoogleAuthUser = {
        id: `user_${users.length + 1}`,
        email,
        name,
        role: "MEMBER",
        affiliateStatus: "NONE",
        disabled: false,
        googleId,
      };
      users.push(user);
      return { ...user };
    },
    async setGoogleId(id, googleId) {
      const user = users.find((row) => row.id === id);
      if (!user) throw new Error("missing user");
      user.googleId = googleId;
      return { ...user };
    },
  };
}

describe("resolveGoogleSignIn", () => {
  it("creates a MEMBER for a new verified Google user and does not grant OWNER", async () => {
    const store = memoryStore();
    const result = await resolveGoogleSignIn(
      {
        email: "New.Person@Example.com",
        emailVerified: true,
        name: "New Person",
        googleId: "sub-new",
      },
      store,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.created, true);
    assert.equal(result.linked, false);
    assert.equal(result.user.email, "new.person@example.com");
    assert.equal(result.user.name, "New Person");
    assert.equal(result.user.role, "MEMBER");
    assert.equal(result.user.affiliateStatus, "NONE");
    assert.equal(result.user.googleId, "sub-new");
    assert.equal(store.users.length, 1);
  });

  it("links an existing user by case-insensitive email and never changes role", async () => {
    const store = memoryStore([
      {
        id: "owner-1",
        email: "Francis@GreenVaultNJ.com",
        name: "Francis",
        role: "OWNER",
        affiliateStatus: "VERIFIED",
        disabled: false,
        googleId: null,
      },
    ]);
    const result = await resolveGoogleSignIn(
      {
        email: "francis@greenvaultnj.com",
        emailVerified: true,
        name: "Some Other Name",
        googleId: "sub-francis",
      },
      store,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.created, false);
    assert.equal(result.linked, true);
    assert.equal(result.user.id, "owner-1");
    assert.equal(result.user.role, "OWNER");
    assert.equal(result.user.affiliateStatus, "VERIFIED");
    assert.equal(result.user.name, "Francis");
    assert.equal(result.user.googleId, "sub-francis");
    assert.equal(store.users.length, 1);
  });

  it("rejects Google sign-in when email_verified is not strictly true", async () => {
    const store = memoryStore();
    for (const emailVerified of [false, undefined, "true", 1, null]) {
      const result = await resolveGoogleSignIn(
        { email: "a@example.com", emailVerified, name: "A", googleId: "sub" },
        store,
      );
      assert.deepEqual(result, { ok: false, reason: "unverified_email" });
    }
    assert.equal(store.users.length, 0);
  });

  it("blocks a disabled existing user and does not link googleId", async () => {
    const store = memoryStore([
      {
        id: "disabled-1",
        email: "blocked@example.com",
        name: "Blocked",
        role: "MEMBER",
        affiliateStatus: "NONE",
        disabled: true,
        googleId: null,
      },
    ]);
    const result = await resolveGoogleSignIn(
      { email: "blocked@example.com", emailVerified: true, name: "Blocked", googleId: "sub-blocked" },
      store,
    );
    assert.deepEqual(result, { ok: false, reason: "disabled" });
    assert.equal(store.users[0]?.googleId, null);
  });

  it("rejects a verified profile with no email", async () => {
    const store = memoryStore();
    const result = await resolveGoogleSignIn(
      { email: "  ", emailVerified: true, name: "No Email", googleId: "sub" },
      store,
    );
    assert.deepEqual(result, { ok: false, reason: "missing_email" });
  });
});

describe("helpers", () => {
  it("normalizes email case", () => {
    assert.equal(normalizeEmail("  Foo.Bar@Example.COM "), "foo.bar@example.com");
  });

  it("falls back to the email local part when Google has no usable name", () => {
    assert.equal(displayNameFromGoogle("", "somebody@example.com"), "somebody");
    assert.equal(displayNameFromGoogle("A", "ab@example.com"), "ab");
    assert.equal(displayNameFromGoogle("  Valid Name  ", "x@example.com"), "Valid Name");
  });
});
