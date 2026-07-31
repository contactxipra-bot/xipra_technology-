import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signAdminToken } from "@/lib/auth/jwt";
import { HttpError } from "@/lib/api/response";
import type { LoginInput } from "@/lib/validations/auth.schema";

export async function loginAdmin({ email, password }: LoginInput) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !admin.isActive) {
    throw new HttpError("Invalid email or password", 401);
  }

  const valid = await verifyPassword(password, admin.password);
  if (!valid) {
    throw new HttpError("Invalid email or password", 401);
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await signAdminToken({
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
}

export async function getAdminById(id: string) {
  const admin = await prisma.admin.findUnique({ where: { id } });
  if (!admin || !admin.isActive) return null;
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}
