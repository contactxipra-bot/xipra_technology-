import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function buildAdapter() {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase connection string to .env."
    );
  }

  const url = new URL(raw);

  // Remove SSL query parameters because SSL is configured explicitly below.
  url.search = "";

  return new PrismaPg({
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: false,
    },

    // IMPORTANT:
    // Keep max connection to 1 per serverless/build worker to prevent EMAXCONNSESSION on Supabase.
    max: 1,
    connectionTimeoutMillis: 20_000,
    idleTimeoutMillis: 10_000,
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma_v2?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma_v2 ??
  new PrismaClient({
    adapter: buildAdapter(),
  });

// Cache the Prisma client in ALL environments.
globalForPrisma.prisma_v2 = prisma;
