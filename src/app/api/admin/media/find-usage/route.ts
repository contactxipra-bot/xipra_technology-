import { NextRequest } from "next/server";
import { withApiHandler, apiSuccess, HttpError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/require-admin";
import { findMediaUsage } from "@/lib/services/media.service";

export const runtime = "nodejs";

export const GET = withApiHandler(async (request: NextRequest) => {
  await requireAdmin();
  const url = request.nextUrl.searchParams.get("url");
  if (!url) throw new HttpError("url is required", 400);
  const usage = await findMediaUsage(url);
  return apiSuccess(usage);
});
