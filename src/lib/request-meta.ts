import type { NextRequest } from "next/server";

export type RequestMeta = {
  ip: string;
  userAgent: string;
};

/**
 * Best-effort client IP extraction. Honours common proxy headers so it keeps
 * working behind Vercel / Nginx / Cloudflare in production, and falls back to
 * "unknown" during local development where no forwarding header is present.
 */
export function getRequestMeta(request: NextRequest): RequestMeta {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");

  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    cfIp?.trim() ||
    "unknown";

  const userAgent = request.headers.get("user-agent")?.slice(0, 512) || "unknown";

  return { ip, userAgent };
}
