import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { AdminRole } from "@/generated/prisma/enums";

export type AdminTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
};

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to your .env file.");
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(
  payload: Omit<AdminTokenPayload, "iat" | "exp">
): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifyAdminToken(
  token: string
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}
