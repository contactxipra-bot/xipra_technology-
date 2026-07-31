import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { deleteCertificateFile } from "@/lib/services/certificate.service";

type RouteContext = { params: Promise<{ id: string; fileId: string }> };

export const DELETE = withApiHandler(async (_request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id, fileId } = await context.params;
  await deleteCertificateFile(id, fileId);
  return apiSuccess(null, { message: "File deleted" });
});
