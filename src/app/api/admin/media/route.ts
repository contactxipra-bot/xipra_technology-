import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, HttpError } from "@/lib/api/response";
import { requireAdmin, requireRole } from "@/lib/api/require-admin";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";
import { listMediaObjects, uploadMediaObject, deleteMediaObject } from "@/lib/services/media.service";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export const GET = withApiHandler(async (request: NextRequest) => {
  await requireAdmin();
  const params = request.nextUrl.searchParams;
  const result = await listMediaObjects({
    bucket: params.get("bucket") || "assets",
    search: params.get("search") || undefined,
    page: Number(params.get("page")) || 1,
    limit: Number(params.get("limit")) || 24,
  });
  return apiSuccess(result.items, { meta: result.meta });
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const admin = await requireAdmin();
  enforceRateLimit({ scope: "media-upload", identifier: admin.sub, limit: 30, windowMs: 60_000 });

  const formData = await request.formData();
  const file = formData.get("file");
  const bucket = formData.get("bucket");
  const replacePath = formData.get("replace");

  if (!(file instanceof File)) throw new HttpError("No file provided", 400);
  if (typeof bucket !== "string") throw new HttpError("bucket is required", 400);

  const saved = await uploadMediaObject(file, bucket, typeof replacePath === "string" ? replacePath : undefined);
  await logAudit({
    admin,
    action: replacePath ? "media.replace" : "media.upload",
    entityType: "Media",
    entityId: `${bucket}/${saved.name}`,
    ipAddress: getRequestMeta(request).ip,
  });

  return apiSuccess(saved, { status: 201 });
});

export const DELETE = withApiHandler(async (request: NextRequest) => {
  // Deleting a shared asset can break whatever references it — restrict to SUPER_ADMIN.
  const admin = await requireRole("SUPER_ADMIN");
  const body = await request.json();
  const { bucket, name } = body as { bucket?: string; name?: string };
  if (!bucket || !name) throw new HttpError("bucket and name are required", 400);

  await deleteMediaObject(bucket, name);
  await logAudit({
    admin,
    action: "media.delete",
    entityType: "Media",
    entityId: `${bucket}/${name}`,
    ipAddress: getRequestMeta(request).ip,
  });

  return apiSuccess(null, { message: "File deleted" });
});
