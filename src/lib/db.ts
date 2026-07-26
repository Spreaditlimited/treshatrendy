import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const isDatabaseConfigured = Boolean(databaseUrl);

export const prisma =
  databaseUrl
    ? globalForPrisma.prisma ??
      new PrismaClient({
        adapter: new PrismaPg({
          connectionString: databaseUrl,
        }),
      })
    : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
