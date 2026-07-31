import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { regenerateCertificateQr } from "@/lib/services/certificate.service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export const POST = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const certificate = await regenerateCertificateQr(id);
  return apiSuccess(certificate, { message: "QR code regenerated" });
});
