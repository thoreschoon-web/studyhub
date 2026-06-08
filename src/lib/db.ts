import { PrismaClient } from "@prisma/client";

/** Prisma singleton — avoids exhausting connections under Next dev hot-reload. */
const g = globalThis as unknown as { prisma?: PrismaClient };

export const db = g.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") g.prisma = db;
