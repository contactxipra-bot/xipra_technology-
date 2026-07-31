import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createCertificateSchema } from "@/lib/validations/certificate.schema";
import { listCertificates, createCertificate } from "@/lib/services/certificate.service";
import { logAudit } from "@/lib/audit";
import { getRequestMeta } from "@/lib/request-meta";

export const GET = withApiHandler(async (request: NextRequest) => {
  await requireAdmin();

  const pagination = parsePagination(request.nextUrl.searchParams);
  const { items, total } = await listCertificates(pagination);

  return apiSuccess(items, { meta: buildPaginationMeta(total, pagination) });
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const admin = await requireAdmin();

  const body = await request.json();
  const input = createCertificateSchema.parse(body);
  const certificate = await createCertificate(input);
  await logAudit({
    admin,
    action: "certificate.create",
    entityType: "Certificate",
    entityId: certificate.id,
    metadata: { certificateNumber: certificate.certificateNumber },
    ipAddress: getRequestMeta(request).ip,
  });

  return apiSuccess(certificate, { message: "Certificate created", status: 201 });
});
