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
    // Keep the pool small because this app is running on Vercel/Supabase.
    max: 5,
    connectionTimeoutMillis: 10_000,
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
