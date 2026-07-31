import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, type AdminTokenPayload } from "./jwt";

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

export function getCookieName(): string {
  return process.env.AUTH_COOKIE_NAME || "xipra_admin_session";
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: getCookieName(),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: getCookieName(),
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** For use inside middleware (Edge runtime). */
export async function getSessionFromRequest(
  request: NextRequest
): Promise<AdminTokenPayload | null> {
  const token = request.cookies.get(getCookieName())?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/** For use inside Server Components / Route Handlers (Node runtime). */
export async function getCurrentAdmin(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
