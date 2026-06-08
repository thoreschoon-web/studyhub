import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { normalizeEmail } from "@/lib/email";

// No DB adapter: Credentials + JWT is stateless and we manage User rows ourselves
// (registerAction). Google OAuth, when enabled, is upserted via the signIn/jwt callbacks.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = normalizeEmail(String(creds?.email ?? ""));
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
        const email = normalizeEmail(String(token.email));
        const owner = process.env.OWNER_EMAIL ? normalizeEmail(process.env.OWNER_EMAIL) : undefined;
        const isOwner = owner === email;
        // Google-Adressen sind von Google verifiziert → emailVerified setzen (Basis für spätere E-Mail-Gate-Logik).
        const dbUser = await db.user.upsert({
          where: { email },
          create: { email, name: token.name ?? null, image: (token.picture as string | undefined) ?? null, role: isOwner ? "owner" : "user", plan: isOwner ? "owner" : "free", emailVerified: new Date(), usage: { create: {} } },
          update: {},
        });
        token.id = dbUser.id;
      }
      return token;
    },
  },
});
