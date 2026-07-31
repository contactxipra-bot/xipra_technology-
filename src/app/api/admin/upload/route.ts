import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, HttpError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { saveUploadedFile, type UploadSubdir } from "@/lib/upload";
import { enforceRateLimit } from "@/lib/rate-limit";

const ALLOWED_SUBDIRS: UploadSubdir[] = ["products", "portfolio", "settings", "content"];

export const POST = withApiHandler(async (request: NextRequest) => {
  const admin = await requireAdmin();
  enforceRateLimit({ scope: "admin-upload", identifier: admin.sub, limit: 30, windowMs: 60_000 });

  const formData = await request.formData();
  const file = formData.get("file");
  const subdir = formData.get("subdir");

  if (!(file instanceof File)) {
    throw new HttpError("No file provided", 400);
  }
  if (typeof subdir !== "string" || !ALLOWED_SUBDIRS.includes(subdir as UploadSubdir)) {
    throw new HttpError(`subdir must be one of: ${ALLOWED_SUBDIRS.join(", ")}`, 400);
  }

  const saved = await saveUploadedFile(file, subdir as UploadSubdir, {
    allowedTypes: "image",
  });

  return apiSuccess(saved, { status: 201 });
});
