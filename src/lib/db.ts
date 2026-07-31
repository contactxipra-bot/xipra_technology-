import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function buildAdapter() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set. Add your Supabase connection string to .env.");
  }

  // Strip query params (e.g. `sslmode=require`, which node-postgres now treats as
  // `verify-full` and would reject Supabase's pooler cert). TLS is enabled — and
  // cert verification relaxed — via the explicit `ssl` option instead.
  const url = new URL(raw);
  url.search = "";

  return new PrismaPg({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma_v2: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma_v2 ?? new PrismaClient({ adapter: buildAdapter() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma_v2 = prisma;
}
