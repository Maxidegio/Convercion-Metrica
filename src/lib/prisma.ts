import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma singleton.
 * En desarrollo, Next recarga módulos y crearía múltiples clientes (agotando
 * conexiones). Reutilizamos una única instancia global.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
