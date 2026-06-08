import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Lightweight (no Prisma/bcrypt) Auth.js instance for the Next 16 proxy.
export const { auth } = NextAuth(authConfig);
