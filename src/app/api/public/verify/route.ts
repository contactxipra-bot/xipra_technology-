import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";
import { verifyCertificateSchema } from "@/lib/validations/public.schema";
import { verifyCertificate } from "@/lib/services/verification.service";

export const runtime = "nodejs";

export const POST = withApiHandler(async (request: NextRequest) => {
  const meta = getRequestMeta(request);
  // Guard the audit log / DB against brute-force enumeration.
  enforceRateLimit({ scope: "verify", identifier: meta.ip, limit: 20, windowMs: 60_000 });

  const body = await request.json();
  const { certificateNumber } = verifyCertificateSchema.parse(body);

  const result = await verifyCertificate(certificateNumber, meta);

  if (!result.found) {
    return apiSuccess({ found: false }, { message: "Certificate not found" });
  }

  return apiSuccess(
    { found: true, certificate: result.certificate },
    { message: "Certificate verified" }
  );
});
