import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge/proxy-safe config (NO Prisma, NO bcrypt). Used by proxy.ts and spread into auth.ts.
const oauthProviders: NextAuthConfig["providers"] =
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : [];

export const googleEnabled = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: oauthProviders,
  callbacks: {
    // Used by proxy.ts to gate routes (matcher decides which).
    authorized({ auth }) {
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) token.id = (user as { id?: string }).id;
      return token;
    },
    session({ session, token }) {
      if (token?.id && session.user) (session.user as { id?: string }).id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
