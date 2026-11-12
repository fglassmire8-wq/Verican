import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { GoogleAuthStore, GoogleAuthUser } from "@/lib/google-auth";
import { normalizeEmail } from "@/lib/google-auth";

function toAuthUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  affiliateStatus: string;
  disabled: boolean;
  googleId: string | null;
}): GoogleAuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    affiliateStatus: user.affiliateStatus,
    disabled: user.disabled,
    googleId: user.googleId,
  };
}

export const prismaGoogleAuthStore: GoogleAuthStore = {
  async findByEmail(email) {
    const normalized = normalizeEmail(email);
    const exact = await prisma.user.findUnique({ where: { email: normalized } });
    if (exact) return toAuthUser(exact);

    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "User" WHERE lower(email) = ${normalized} LIMIT 1
    `;
    const id = rows[0]?.id;
    if (!id) return null;
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toAuthUser(user) : null;
  },

  async createMember({ email, name, googleId }) {
    const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
    const user = await prisma.user.create({
      data: {
        email: normalizeEmail(email),
        name,
        passwordHash,
        role: "MEMBER",
        affiliateStatus: "NONE",
        googleId,
      },
    });
    return toAuthUser(user);
  },

  async setGoogleId(id, googleId) {
    const user = await prisma.user.update({
      where: { id },
      data: { googleId },
    });
    return toAuthUser(user);
  },
};
