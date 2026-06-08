import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { User } from "@prisma/client";

/** Full DB user for the current session, or null. Reads plan/role fresh from DB. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  return db.user.findUnique({ where: { id } });
}

/** Like getCurrentUser but redirects to /login when not authenticated. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Owner & paid accounts have no usage limits. */
export function isUnlimited(user: Pick<User, "plan" | "email"> | null | undefined): boolean {
  if (!user) return false;
  if (user.plan === "owner" || user.plan === "paid") return true;
  const owner = process.env.OWNER_EMAIL?.toLowerCase();
  return !!owner && user.email?.toLowerCase() === owner;
}
