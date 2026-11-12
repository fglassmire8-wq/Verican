import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prismaGoogleAuthStore } from "@/lib/google-auth-store";
import { isGoogleAuthEnabled, resolveGoogleSignIn } from "@/lib/google-auth";
import { getPublicOrigin } from "@/lib/public-origin";
import { prisma } from "@/lib/prisma";

const providers: NextAuthOptions["providers"] = [
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
      if (!user || user.disabled) return null;

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
];

if (isGoogleAuthEnabled()) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return true;
      const googleProfile = profile as
        | { email?: string; email_verified?: boolean; name?: string; sub?: string }
        | undefined;
      const result = await resolveGoogleSignIn(
        {
          email: googleProfile?.email ?? user?.email,
          emailVerified: googleProfile?.email_verified,
          name: googleProfile?.name ?? user?.name,
          googleId: googleProfile?.sub ?? account.providerAccountId,
        },
        prismaGoogleAuthStore,
      );
      return result.ok;
    },
    async redirect({ url, baseUrl }) {
      const origin = getPublicOrigin({
        headers: new Headers(),
        url: baseUrl,
      });
      if (url.startsWith("/") && !url.startsWith("//")) return `${origin}${url}`;
      try {
        if (new URL(url).origin === origin) return url;
      } catch {
        // Ignore invalid callback URLs.
      }
      return origin;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        const email = (
          user?.email ||
          (profile as { email?: string } | undefined)?.email ||
          token.email ||
          ""
        )
          .trim()
          .toLowerCase();
        const dbUser = email ? await prismaGoogleAuthStore.findByEmail(email) : null;
        if (!dbUser || dbUser.disabled) {
          token.id = "";
          token.role = "NONE";
          token.affiliateStatus = "NONE";
          return token;
        }
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.affiliateStatus = dbUser.affiliateStatus;
        token.name = dbUser.name;
        token.email = dbUser.email;
        return token;
      }

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
          select: { role: true, affiliateStatus: true, name: true, disabled: true },
        });
        if (!dbUser || dbUser.disabled) {
          token.id = "";
          token.role = "NONE";
          token.affiliateStatus = "NONE";
          return token;
        }
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
