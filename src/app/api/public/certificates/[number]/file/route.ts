import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";
import { getVerifiedCertificateFile } from "@/lib/services/verification.service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ number: string }> };

/**
 * Streams a certificate PDF — but only for ACTIVE certificates that have an
 * attached file. Revoked/expired/non-existent certificates return 404, so the
 * private PDF is never publicly accessible outside a valid verification.
 * `?download=1` forces an attachment (download) instead of inline preview.
 */
export const GET = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  const meta = getRequestMeta(request);
  enforceRateLimit({ scope: "cert-file", identifier: meta.ip, limit: 60, windowMs: 60_000 });

  const { number } = await context.params;
  const certificateNumber = decodeURIComponent(number);

  const { buffer, file } = await getVerifiedCertificateFile(certificateNumber);

  const isDownload = request.nextUrl.searchParams.get("download") === "1";
  const safeName = `${certificateNumber.replace(/[^a-zA-Z0-9._-]/g, "_")}.pdf`;
  const disposition = isDownload ? "attachment" : "inline";

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": file.fileType || "application/pdf",
      "Content-Length": String(buffer.length),
      "Content-Disposition": `${disposition}; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
