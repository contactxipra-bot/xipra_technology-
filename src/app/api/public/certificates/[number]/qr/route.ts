import { NextRequest, NextResponse } from "next/server";
import { withApiHandler, HttpError } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";
import { prisma } from "@/lib/db";
import { renderCertificateQrPng } from "@/lib/qrcode";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ number: string }> };

/**
 * Serves a certificate's QR code PNG, rendered on demand. The QR belongs to a
 * single real certificate (404 if the number doesn't exist) and encodes the
 * public verify URL with that certificate number pre-filled. `?download=1`
 * forces a file download.
 */
export const GET = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  const meta = getRequestMeta(request);
  enforceRateLimit({ scope: "cert-qr", identifier: meta.ip, limit: 60, windowMs: 60_000 });

  const { number } = await context.params;
  const certificateNumber = decodeURIComponent(number);

  const certificate = await prisma.certificate.findFirst({
    where: { certificateNumber },
    select: { certificateNumber: true },
  });
  if (!certificate) throw new HttpError("Certificate not found", 404);

  const png = await renderCertificateQrPng(certificate.certificateNumber);

  const isDownload = request.nextUrl.searchParams.get("download") === "1";
  const safeName = `qr-${certificate.certificateNumber.replace(/[^a-zA-Z0-9._-]/g, "_")}.png`;
  const disposition = isDownload ? `attachment; filename="${safeName}"` : "inline";

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.length),
      "Content-Disposition": disposition,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
