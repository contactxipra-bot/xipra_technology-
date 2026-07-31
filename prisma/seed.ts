import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

function buildAdapter() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set. Add it to your .env file.");
  const url = new URL(raw);
  url.search = ""; // drop sslmode; TLS handled by the explicit ssl option below
  return new PrismaPg({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });
}

const prisma = new PrismaClient({ adapter: buildAdapter() });

async function main() {
  const name = process.env.ADMIN_SEED_NAME || "Xipra Admin";
  const email = (process.env.ADMIN_SEED_EMAIL || "admin@xipratech.com").toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD || "ChangeMe@123";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] Admin "${email}" already exists, skipping.`);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    await prisma.admin.create({
      data: { name, email, password: hashed, role: "SUPER_ADMIN" },
    });
    console.log(`[seed] Created admin "${email}" with the password from .env.`);
  }

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: "Xipra Technology",
    },
  });
  console.log("[seed] Site settings ready.");
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
