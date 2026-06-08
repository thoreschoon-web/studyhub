import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

// No DB adapter: Credentials + JWT is stateless and we manage User rows ourselves
// (registerAction). Google OAuth, when enabled, is upserted via the signIn/jwt callbacks.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      if (user && (user as { id?: string }).id) token.id = (user as { id?: string }).id;
      // Google OAuth (no adapter): upsert a DB user so getCurrentUser() resolves.
      if (account?.provider === "google" && token.email) {
        const email = String(token.email).toLowerCase();
        const owner = process.env.OWNER_EMAIL?.toLowerCase();
        const isOwner = owner === email;
        const dbUser = await db.user.upsert({
          where: { email },
          create: { email, name: token.name ?? null, image: (token.picture as string | undefined) ?? null, role: isOwner ? "owner" : "user", plan: isOwner ? "owner" : "free", usage: { create: {} } },
          update: {},
        });
        token.id = dbUser.id;
      }
      return token;
    },
  },
});
