import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { updateCertificateSchema } from "@/lib/validations/certificate.schema";
import {
  getCertificateById,
  updateCertificate,
  deleteCertificate,
} from "@/lib/services/certificate.service";
import { logAudit } from "@/lib/audit";
import { getRequestMeta } from "@/lib/request-meta";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;
  const certificate = await getCertificateById(id);
  return apiSuccess(certificate);
});

export const PUT = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const body = await request.json();
  const input = updateCertificateSchema.parse(body);
  const certificate = await updateCertificate(id, input);
  await logAudit({
    admin,
    action: "certificate.update",
    entityType: "Certificate",
    entityId: id,
    metadata: { certificateNumber: certificate?.certificateNumber, status: certificate?.status },
    ipAddress: getRequestMeta(request).ip,
  });
  return apiSuccess(certificate, { message: "Certificate updated" });
});

export const DELETE = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const existing = await getCertificateById(id);
  await deleteCertificate(id);
  await logAudit({
    admin,
    action: "certificate.delete",
    entityType: "Certificate",
    entityId: id,
    metadata: { certificateNumber: existing.certificateNumber },
    ipAddress: getRequestMeta(request).ip,
  });
  return apiSuccess(null, { message: "Certificate deleted" });
});
