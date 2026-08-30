import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          affiliateStatus: user.affiliateStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.affiliateStatus = user.affiliateStatus;
        token.name = user.name;
      }

      // Re-read role / affiliateStatus on later requests so owner verify
      // (and apply / reject) show up without signing out.
      if (!token.id) return token;

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: { role: true, affiliateStatus: true, name: true },
        });
        if (!dbUser) return token;
        token.role = dbUser.role;
        token.affiliateStatus = dbUser.affiliateStatus;
        token.name = dbUser.name;
      } catch {
        // Keep the existing token if the database is briefly unavailable.
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.affiliateStatus = token.affiliateStatus as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};
