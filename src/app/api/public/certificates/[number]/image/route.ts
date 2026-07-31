import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";
import { getVerifiedCertificateImage } from "@/lib/services/verification.service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ number: string }> };

/**
 * Streams the optional certificate image — only for ACTIVE certificates that
 * have one. Revoked/expired/non-existent certificates return 404.
 */
export const GET = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  const meta = getRequestMeta(request);
  enforceRateLimit({ scope: "cert-image", identifier: meta.ip, limit: 60, windowMs: 60_000 });

  const { number } = await context.params;
  const certificateNumber = decodeURIComponent(number);

  const { buffer, imageType } = await getVerifiedCertificateImage(certificateNumber);

  const isDownload = request.nextUrl.searchParams.get("download") === "1";
  const extension = imageType === "image/jpeg" ? "jpg" : "png";
  const safeName = `${certificateNumber.replace(/[^a-zA-Z0-9._-]/g, "_")}.${extension}`;
  const disposition = isDownload ? "attachment" : "inline";

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": imageType,
      "Content-Length": String(buffer.length),
      "Content-Disposition": `${disposition}; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
