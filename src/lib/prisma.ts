import { PrismaClient } from '@prisma/client';

/**
 * Next.js dev mode hot-reloads modules, which would otherwise instantiate a
 * new PrismaClient (and a new DB connection pool) on every file change.
 * Caching the instance on `globalThis` in development avoids that.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
