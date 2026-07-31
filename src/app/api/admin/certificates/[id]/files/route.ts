import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, HttpError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { savePrivatePdf } from "@/lib/private-storage";
import { attachCertificateFile } from "@/lib/services/certificate.service";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export const POST = withApiHandler(async (request: NextRequest, context: RouteContext) => {
  await requireAdmin();
  const { id } = await context.params;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new HttpError("No file provided", 400);
  }

  // Certificate PDFs go to PRIVATE storage (outside public/) and are served only
  // through authenticated admin routes or verified public verification routes.
  const saved = await savePrivatePdf(file, "certificates");
  const record = await attachCertificateFile(id, saved);

  return apiSuccess(record, { message: "File uploaded", status: 201 });
});
